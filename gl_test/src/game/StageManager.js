import { ManagedObject } from '/elem/src/lib/ManagedObject.js'
import { Panel } from '/elem/src/lib/Panel.js'

function normalized ([a, b]){// vex = [a, b]
    let length = Math.sqrt(a*a + b*b);
    return [a/length, b/length];
}
export class StageManager extends ManagedObject{
    constructor(){
        super("stageManager");
        this.objArray = new Array();
        this.preHitMap = new Object();//前のフレームで衝突していたオブジェクトのIDとブロックのマップ
    }
    process(){
        for(let obj of this.objArray){
            obj.process();
        }
    }
    addObject(obj){
        this.objArray.push(obj);
    }
    receive(message){
        if(message["message"] !== "hit_stage"){
            return;
        }
        let chara = message["chara"];
        let hit_chara = new Object();
        hit_chara["vel_x"]  = chara.vel_x;
        hit_chara["vel_y"] = chara.vel_y;
        hit_chara["x"] = chara.x;
        hit_chara["y"] = chara.y;
        hit_chara["pre_x"] = chara.pre_x;
        hit_chara["pre_y"] = chara.pre_y;
        hit_chara["width"] = chara.width;
        hit_chara["height"] = chara.height;
        hit_chara["pre_left"] = hit_chara["pre_x"] - chara.width*0.5;
        hit_chara["pre_right"]= hit_chara["pre_x"]+ chara.width*0.5;
        hit_chara["pre_top"] = hit_chara["pre_y"] + chara.height*0.5;
        hit_chara["pre_bottom"]= hit_chara["pre_y"] - chara.height*0.5;
        hit_chara["landing"] = false;
        if(this.preHitMap[message["id"]] !== undefined){
            this.update(chara, hit_chara);
            let ret = this.preHitMap[message["id"]].hit(hit_chara);
            delete this.preHitMap[message["id"]];
        }

        for(let obj of this.objArray){
            this.update(chara, hit_chara);
            let ret = obj.hit(hit_chara);
            if(ret === "top"){
                this.preHitMap[message["id"]] = obj;
            }
        }
        let send_message = {"message":"hit_character", "result":hit_chara, "id":message["id"]};
        this.send(send_message);
    }
    update(source, target){
        target["left"] = target["x"] - source.width*0.5;
        target["right"]= target["x"]  + source.width*0.5;
        target["top"] = target["y"]  + source.height*0.5;
        target["bottom"]= target["y"]  -  source.height*0.5;

    }
}
export class Block{
    constructor(x, y){
        this.image = new Panel("/elem/res/image/block.png");
        this.x = x;
        this.y = y;
        this.image.setPosition(this.x, this.y);
        this.width = 64;
        this.height = 64;

        this.left = this.x - this.width*0.5;
        this.right = this.x + this.width*0.5;
        this.top = this.y + this.height*0.5;
        this.bottom = this.y - this.height*0.5;
    }
    process(){

    }
    hit(chara){
        if(chara["vel_y"] < 0 && chara["pre_bottom"] >= this.top && chara["bottom"] < this.top && this.left <= chara["right"] && chara["left"] <= this.right){
            //下向きにめり込んだ
            if(chara["pre_right"] <= this.left){
                //さっき左上にいた = 右向きに沈んだ
                let vec_move = normalized([chara["vel_x"] , chara["vel_y"] ]);
                let vec_through = normalized([chara["right"] - this.left , this.top - chara["bottom"] ]);
                if(vec_move[0] <= vec_through[0]){//上から衝突したと判定
                    this.hitTopSide(chara);
                    return "top";
                }
                else{//左から衝突したと判定
                    this.hitTopSide(chara);
                    return "left";
                }
            }
            else if(this.right <= chara["pre_left"]){
                //さっき右上にいた
                let vec_move = normalized([chara["vel_x"] , chara["vel_y"] ]);
                let vec_through = normalized([chara["left"] - this.right , this.top - chara["bottom"] ]);
                if(vec_move[0] >= vec_through[0]){//上から衝突したと判定
                    this.hitTopSide(chara);
                    return "top";
                }
                else{//左から衝突したと判定
                    this.hitTopSide(chara);
                    return "left";
                }
            }
            else{
                //上面にぶつかった
                this.hitTopSide(chara);
                return "top";
            }
        }
        else if(chara["vel_x"] > 0 && chara["pre_right"] <= this.left &&  this.left <= chara["right"] && this.top > chara["bottom"] && chara["top"] > this.bottom){
            //右向きにめり込んだ
            this.hitLeftSide(chara);
            return "left";
        }
        else if(chara["vel_x"] < 0 && chara["pre_left"] >= this.right &&  this.right >= chara["left"] && this.top > chara["bottom"] && chara["top"] > this.bottom){
            //左向きにめり込んだ
            this.hitRightSide(chara);
            return "right";
        }
        else if(chara["vel_y"] > 0 && chara["pre_top"] <= this.bottom && chara["top"] > this.bottom && this.left <= chara["right"] && chara["left"] <= this.right){
            this.hitBottomSide(chara);
            return "bottom";
        }
    }
    hitLeftSide(chara){
        chara["x"] = this.left - chara["width"]*0.5;
    }
    hitRightSide(chara){
        chara["x"] = this.right + chara["width"]*0.5;
    }
    hitTopSide(chara){
        chara["y"] = this.top + chara["height"]*0.5;
        chara["landing"] = true;
    }
    hitBottomSide(chara){
        chara["y"] = this.bottom - chara["height"]*0.5;
        chara["ceiling"] = true;
    }

}
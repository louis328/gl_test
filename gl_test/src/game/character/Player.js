import { ManagedObject } from '/gl_test/src/lib/ManagedObject.js'
import { Polygon } from '/gl_test/src/lib/Polygon.js'
import { motionController} from '/gl_test/src/lib/MotionController.js';
import { keyManager} from '/gl_test/src/lib/KeyManager.js';

export class Player extends ManagedObject{
    constructor(){
        super("player");
        this.image = new Polygon("/gl_test/res/image/block.png");
        this.motion = motionController.create("/gl_test/res/motion/motion_hiyoko.json");
        this.motion.start("stand");
        

        this.image.setUVArray(this.motion.getUV());
        this.width = 40;
        this.height = 45;

        this.x = 0;
        this.y = 0;
        this.pre_x = 0
        this.pre_y = 0;
        this.vel_x = 0;
        this.vel_y = 0;
        this.jumed = 0;

        this.activeFlag =true;
    }
    process(){
        if(!this.activeFlag){
            return;
        }
        this.pre_x = this.x;
        this.pre_y = this.y;
        {//入力
            if(this.jumed === 0 && keyManager.isKeyJustDown(87)){
                this.vel_y = 16.0;
                this.jumed = 1;
            }
            if(keyManager.getKeyState(65)){
                this.vel_x -= 23.0;
            }
            if(keyManager.getKeyState(68)){
                this.vel_x += 23.0;
            }
        }
        {//移動
            //this.vel_y -= 1.2; //重力
            if(this.vel_y < -8){
                this.vel_y = -8.0;
            }
            if(Math.abs(this.vel_x) > 87.0){
                this.vel_x = this.vel_x / Math.abs(this.vel_x) * 87.0;
            }
            if(this.jumed === 0){
                this.vel_x *= 0.8;//地上の摩擦
            }
            else{
                this.vel_x *= 0.95;//空中の摩擦
            }
            if(Math.abs(this.vel_x) < 0.2){
                this.vel_x = 0;
            }

            this.x += this.vel_x;
            this.y += this.vel_y;

            let message = {"message":"hit_stage", "id":"player", "chara":this};
            this.send(message);
        }
        this.image.setUVArray(this.motion.getUV());
        this.image.setPosition(this.x, this.y);
    }
    receive(message){
        if(message["message"] === "hit_character" && message["id"] === "player"){
            let result = message["result"];
            this.x = result["x"];
            this.y = result["y"];
            if(result["landing"]){
                this.vel_y = 0;
                this.jumed = 0;
            }
            else{
                this.jumed = 1;
            }
            if(result["ceiling"]){
                this.vel_y *= 0.3;
            }
            //this.image.setUVArray(this.motion.getUV());
            this.image.setPosition(this.x, this.y);
        }
    }
    activate(){
        this.activeFlag = true;
        this.motion.play();
    }
    inactivate(){
        this.activeFlag = false;
        this.motion.stop();
    }
    isActive(){
        return this.activeFlag;
    }
}
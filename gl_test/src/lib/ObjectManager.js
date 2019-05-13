
class ObjectManager{
    constructor(){
        this.messageQueue = new Array();
        this.objHash = new Object();//ゲームオブジェクトを格納
        this.drawArray = new Array();//描画対象を格納する配列(2D)
        this.boardArray = new Array();//Billboardを格納する
        this.modelArray = new Array();//gltfをまるごと入れる
        this.textArray = new Array();//テキストを格納
    }
    process(){
        //console.log(Object.keys(this.objHash));
        for(let ID in this.objHash){
            let obj = this.objHash[ID];
            obj.process();
        }
        while(this.messageQueue.length != 0){
            let message = this.messageQueue.shift();
            //console.log(message);
            for(let ID in this.objHash){
                let obj = this.objHash[ID];
                obj.receive(message);
            }
        }
    }
    receive(message){
        this.messageQueue.push(message);
    }
    getObject(id){
        return this.objHash[id];
    }
    getDrawArray(){
        return this.drawArray;
    }
    getBoardArray(){
        return this.boardArray;
    }
    getModelArray(){
        return this.modelArray;
    }
    remove(id){
        if(this.objHash[id] != undefined){
            delete this.objHash[id];
        }
    }
}
export const objManager = new ObjectManager();
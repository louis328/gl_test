import {ManagedObject} from './ManagedObject.js';

class MotionController extends ManagedObject{
    constructor(){
        super("motionController");
        this.motionArray = new Array();
    }
    create(filepath){
        let obj = new Motion(filepath);
        this.motionArray.push(obj);
        return obj;
    }
    process(){
        for(let obj of this.motionArray){
            obj.process();
        }
    }
}
export const motionController = new MotionController();

class Motion{
    constructor(filepath){
        this.motionData = new Object();
        this.load(filepath);
        this.id = "";
        this.frame = 0;
        this.isPlaying = false;
    }
    load(filepath){
        let req = new XMLHttpRequest();
        req.open("GET",filepath,false);
        req.send(null);
        let text = req.responseText;
        let json = JSON.parse(text);
        let array = json.data;
        for (let i = 0; i < array.length; ++i) {
            let obj = array[i];
            this.motionData[obj.id] = obj.motion;
        }
        this.motionData[""] = JSON.parse('[{"frame": 30, "start_x": 0,     "start_y": 0,   "end_x": 64,     "end_y": 64}]');
    }
    process(){
        if(this.isPlaying){
            ++this.frame;
        }
    }
    start(id){//現在のモーションと別のモーションを始動させる
        if(this.id === id){
            return;
        }
        this.id = id;
        this.isPlaying = true;
        this.frame = 0;
        if(this.motionData[this.id] == undefined){
            this.id = "";
        }
    }
    restart(){//現在のモーションを最初から始動
        this.isPlaying = true;
        this.frame = 0;
    }
    play(){
        this.isPlaying = true;
    }
    stop(){
        this.isPlaying = false;
    }
    getUV(){
        return this.motionData[this.id][this._getMotionIndex()];
    }
    _getMotionIndex(){
        let tempFrame = this.frame;
        let data = this.motionData[this.id];
        let accumulationFrame = 0;
        while(tempFrame >= 0){
            for(let i=0;i<data.length;++i){
                tempFrame -= data[i].frame;
                if(tempFrame < 0){
                    return i;
                }
                accumulationFrame += data[i].frame;//フレーム値を累積させる
            }
            this.frame -= accumulationFrame;//モーションの終端を過ぎたら現フレーム値を周回させる
        }
    }
}
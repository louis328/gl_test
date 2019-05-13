
import {objManager} from './ObjectManager.js';

let text_serial_number = 0;
export class Text{
    constructor(str, x, y){
        this.id = text_serial_number++;
        this.text = str;
        this.x = x;
        this.y = y;
        this.font = "メイリオ";
        this.size = "50px";
        this.color = "rgba(255,100,200,1.0)";
        objManager.textArray.push(this);
    }
    dead(){
        for(let it in objManager.textArray){
            if(objManager.textArray[it].id === this.id){
                objManager.textArray.splice(it, 1);
                break;
            }
        }
    }
}
import {canvas} from './Canvas.js';
import {objManager} from './ObjectManager.js';
import {FPS} from './Config.js';

export class NioLib{
    constructor(){
        console.log("nio");
    }
    process(){
        (function func (){
            canvas.process();
            objManager.process();
            setTimeout(func, 1000 / FPS);
        })();
    }
}
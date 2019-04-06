import {FPS} from './lib/Config.js';
import {canvas} from './lib/canvas.js';
import {objManager} from './lib/ObjectManager.js';
import { TitleScene } from '/3d/src/game/scene/TitleScene.js';


onload = function(){
    console.log("start");
    let firstScene = new TitleScene();
    (function func (){
        canvas.process();
        objManager.process();
        setTimeout(func, 1000 / FPS);
    })();
}
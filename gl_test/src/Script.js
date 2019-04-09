console.log("onload");
import {FPS} from './lib/Config.js';
import {canvas} from './lib/Canvas.js';
import {objManager} from './lib/ObjectManager.js';
import { TitleScene } from '/src/game/scene/TitleScene.js';


onload = function(){
    console.log("start");
    document.getElementById('message').textContent += ":script start";
    let firstScene = new TitleScene();
    (function func (){
        canvas.process();
        objManager.process();
        setTimeout(func, 1000 / FPS);
    })();
}

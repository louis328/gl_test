console.log("onload");

import {NioLib} from './lib/NioLib.js';
import { TitleScene } from './game/scene/TitleScene.js';


onload = function(){
    console.log("start");
    document.getElementById('message').textContent += ":script start";
    let firstScene = new TitleScene();
    let nio = new NioLib();
    nio.process();
}

import {canvas} from './Canvas.js';
import * as shader from "./shader.js";
import {resManager} from './ResourceManager.js';
import {objManager} from './ObjectManager.js';
import {Panel} from './Panel.js';

export class Billboard extends Panel{
    constructor(tex_address){
        super(tex_address);

        this.uv_vbo = shader.create_vbo(canvas.getGLContext(), this.uvArray);
        this.VBOList = [this.pos_vbo,  this.uv_vbo];

        this.x = 0.0;
        this.y = 0.0;
        this.z = 0.0;
    }
    registerMyselfToManager(){
        objManager.boardArray.push(this);
    }

    getPosition(){
        return {"x":this.x, "y":this.y, "z":this.z};
    }
    setPosition(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
    addPosition(x, y, z){
        this.x += x;
        this.y += y;
        this.z += z;
    }

}
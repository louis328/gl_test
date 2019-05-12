import {canvas} from './Canvas.js';
import * as shader from "./shader.js";
import {resManager} from './ResourceManager.js';
import {objManager} from './ObjectManager.js';

export class Panel {
    constructor(tex_address){
        this.address = tex_address;

        this.visible = true;

        this.rotate = 0;
        this.scaleX = 1.0;
        this.scaleY = 1.0;
        this.expansionX = 1.0;
        this.expansionY = 1.0;
        this.x = 0;
        this.y = 0;


        this.vertex_position = //3*4
		[
			1.0,  1.0,  0.0,
            -1.0,  1.0,  0.0,
            1.0, -1.0,  0.0,
            -1.0, -1.0,  0.0
        ];
        this.vertex_index = 
		[
			0,1,2, 2,1,3
        ];
        this.textureCoord = 
		[
            0,1,2,3
        ];
        this.uvArray = 
		[
            1,0, 0,0, 1,1, 0,1
        ];
        this.uvDefault = true;//trueの場合、uvArrayは初期値を用いる

        this.vertices = this.vertex_position.length;
        this.indices = 	this.vertex_index.length;
        let gl = canvas.getGLContext();
        this.pos_vbo = shader.create_vbo(gl, this.vertex_position);
        this.tex_vbo = shader.create_vbo(gl, this.textureCoord);
        this.VBOList = [this.pos_vbo,  this.tex_vbo];
        this.IBO = shader.create_ibo(gl, this.vertex_index);
        this.deadFlag = false;
        
        this.registerMyselfToManager();
    }
    registerMyselfToManager(){
        objManager.drawArray.push(this);
    }
    dead(){
        this.deadFlag = true;
    }
    isDead(){
        return this.deadFlag;
    }
    getIndices(){
        return this.indices;
    }
    getVBO(){
		return this.VBOList;
    }

	getIBO(){
		return this.IBO;
    }
    getTextureAddress(){
        return this.address;
    }
    isVisible(){
        return this.visible;
    }

    getPosition(){
        return {"x":this.x, "y":this.y};
    }
    setPosition(x,y){
        this.x = x;
        this.y = y;
    }
    addPosition(x,y){
        this.x += x;
        this.y += y;
    }
    getScale(){
        let tex = resManager.getTexture(this.address);
        if(tex === null || this.uvDefault){
            return {"x":1.0, "y":1.0};
        }
        let width = tex.width;
        let height = tex.height;
        return {"x":this.scaleX / width * this.expansionX, "y":this.scaleY / height * this.expansionY};
    }
    setExpansion(x,y){
        this.expansionX = x;
        this.expansionY = y;
    }
    getRotate(){
        return this.rotate;
    }
    setRotate(r){
        this.rotate = r;
    }
    getUVArray(){
        let tex = resManager.getTexture(this.address);
        if(tex === null || this.uvDefault){return [0,0, 1,0, 0,1, 1,1];}
        let width = tex.width;
        let height = tex.height;
        return [
            this.uvArray[0] / width, this.uvArray[1] / height, 
            this.uvArray[2] / width, this.uvArray[3] / height, 
            this.uvArray[4] / width,this.uvArray[5] / height, 
            this.uvArray[6] / width ,this.uvArray[7] / height
        ];
    }
    //scaleとuvArrayピクセルサイズを設定する。get時にwidthとheightで割って0~1に変換する
    setUVArray(uv){
        this.uvDefault = false;
        this.scaleX = Math.abs(uv.end_x - uv.start_x);
        this.scaleY = Math.abs(uv.end_y - uv.start_y);
        this.uvArray = [
            uv.start_x, uv.start_y, 
            uv.end_x, uv.start_y, 
            uv.start_x,uv.end_y, 
            uv.end_x ,uv.end_y
        ];
    }
    setUVArrayReverse(uv){
        this.uvDefault = false;
        this.scaleX = (uv.end_x - uv.start_x);
        this.scaleY = (uv.end_y - uv.start_y);
        this.uvArray = [
            uv.start_x, uv.start_y, 
            uv.end_x, uv.start_y, 
            uv.start_x,uv.end_y, 
            uv.end_x ,uv.end_y
        ];
    }
    setPxToUVArray(startX,startY, endX,endY){
        this.uvDefault = false;
        this.scaleX = Math.abs(endX - startX);
        this.scaleY = Math.abs(endY - startY);
        this.uvArray = [
            startX, startY, 
            endX, startY, 
            startX,endY, 
            endX ,endY
        ];
    }
    setPxToUVArrayReverse(startX,startY, endX,endY){//左右反転
        this.uvDefault = false;
        this.scaleX = (endX - startX);
        this.scaleY = (endY - startY);
        this.uvArray = [
            startX, startY, 
            endX, startY, 
            startX,endY, 
            endX ,endY
        ];
    }
};
import {canvas} from './Canvas.js';

class ResourceManager{
    constructor(){
        this.TextureTable = new Object();//ファイルパスをキーにテクスチャを格納
        this.loadingCount = 0;
    }
    getTexture(address){
        let tex = this.TextureTable[address];
        if(tex === undefined){
            this.createTexture(address);
            return null;
        }
        else{
            return tex;
        }
    }
    isLoading(){
        return (this.loadingCount !== 0);
    }
    // テクスチャを生成する関数
    createTexture(address) {
        let manager = this;
        if(manager.TextureTable[address] !== undefined){
            return;
        }
        // イメージオブジェクトの生成
        let img = new Image();
        //manager.TextureTable[address] = img;
        // イメージオブジェクトのソースを指定
        img.crossOrigin = 'anonymous';
        img.src = address;
        let gl = canvas.getGLContext();
        // データのオンロードをトリガーにする
        img.onload = function () {
            manager.loadingCount += 1;
            // テクスチャオブジェクトの生成
            let tex = gl.createTexture();
            tex.width = img.width;
            tex.height = img.height;
            //img = checkImageSize(img); 
            // テクスチャをバインドする
            gl.bindTexture(gl.TEXTURE_2D, tex);
            // テクスチャへイメージを適用.0
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            // ミップマップを生成
            gl.generateMipmap(gl.TEXTURE_2D);
            // テクスチャのバインドを無効化
            gl.bindTexture(gl.TEXTURE_2D, null);
            // 生成したテクスチャを格納
            manager.TextureTable[address] = tex;
            manager.loadingCount -= 1;
        };
    }
}
export const resManager = new ResourceManager();
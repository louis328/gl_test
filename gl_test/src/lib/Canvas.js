
import { CANVAS_WIDTH, CANVAS_HEIGHT, VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from './Config.js';
import { Shader, SecondShader, ShaderForSkinMesh } from './Shader.js';
import { ProjShader } from './shader/ProjShader.js';
import { DefaultShader } from './shader/DefaultShader.js';
import { SkinShader } from './shader/SkinShader.js';
import { PanelShader } from './shader/PanelShader.js';
import { BoardShader } from './shader/BoardShader.js';
import { objManager} from './ObjectManager.js';
import { resManager } from './ResourceManager.js';
import { qtLIB, matLIB } from './minMatrix.js';

class Canvas {
    constructor() {
        this.version = 2;
        let canvas_element = document.getElementById('nio');
        
        this.messageBox = document.getElementById('message');
        this.messageBox.textContent += ":webgl start";
        try {
            console.log("webgl start!");
            this.time = 0;
            
            this.canvas = document.createElement('canvas');
            canvas_element.appendChild(this.canvas);
            //this.canvas = document.getElementById('mainCanvas');
            this.canvas.textContent = "canvas";
            this.canvas.width = CANVAS_WIDTH;
            this.canvas.height = CANVAS_HEIGHT;
            this.context_gl = this.canvas.getContext('webgl2');//webgl2のコンテキスト作成
            if (!(window.WebGLRenderingContext && this.context_gl && this.context_gl.getShaderPrecisionFormat)) {
                console.log("webgl2非対応, 1で起動");
                this.context_gl = this.canvas.getContext('webgl');//ver1でコンテキスト作成
                if (!(window.WebGLRenderingContext && this.context_gl && this.context_gl.getShaderPrecisionFormat)) {
                    console.log("webgl非対応");
                    this.messageBox.textContent += ':webgl非対応';
                    return false;
                }
                this.version = 1;
            }
        } catch (e) {
            console.log("webgl非対応: " + e);
            this.messageBox.textContent = 'webbl非対応 ' + e;
            return false;
        }
        //テキスト用
        let canvas_2d = document.createElement('canvas');
        canvas_element.appendChild(canvas_2d);
        canvas_2d.width = CANVAS_WIDTH;
        canvas_2d.height = CANVAS_HEIGHT;
        canvas_2d.style = 'visibility:hidden;';
        this.context_2d = canvas_2d.getContext("2d");//テキスト描画用なので2d

        this.context_gl.viewport(0, 0, VIEWPORT_WIDTH,VIEWPORT_HEIGHT);

        this.shader1 = new DefaultShader(this.context_gl, this.version);
        this.shader2 = new ProjShader(this.context_gl, this.version);
        this.shader_skin = new SkinShader(this.context_gl, this.version);
        this.shader_panel = new PanelShader(this.context_gl, this.version);
        this.shader_board = new BoardShader(this.context_gl, this.version);
        this.fBuffer = this.create_framebuffer(CANVAS_WIDTH, CANVAS_HEIGHT);
        
        
        document.documentElement.addEventListener('touchstart', function (e) {
            for(let i=0;i<e.changedTouches.length;++i){
              let touch = e.changedTouches[i];
              let x = touch.pageX - CANVAS_WIDTH/2;
              let y = CANVAS_HEIGHT/2 - touch.pageY;
              let message = new Object();
              message['x'] = x;
              message['y'] = y;
              message['identifier'] = touch.identifier;
              message['message'] = 'touchStart';
              objManager.receive(message);
            }
            e.preventDefault();
          }, {passive: false});
          document.documentElement.addEventListener('touchmove', function (e) {
            for(let i=0;i<e.changedTouches.length;++i){
              let touch = e.changedTouches[i];
              let x = touch.pageX - CANVAS_WIDTH/2;
              let y = CANVAS_HEIGHT/2 - touch.pageY;
              let message = new Object();
              message['x'] = x;
              message['y'] = y;
              message['identifier'] = touch.identifier;
              message['message'] = 'touchMove';
              objManager.receive(message);
            }
            e.preventDefault();
          }, {passive: false});
          document.documentElement.addEventListener('touchend', function (e) {
            for(let i=0;i<e.changedTouches.length;++i){
              let touch = e.changedTouches[i];
              let x = touch.pageX - CANVAS_WIDTH/2;
              let y = CANVAS_HEIGHT/2 - touch.pageY;
              let message = new Object();
              message['x'] = x;
              message['y'] = y;
              message['identifier'] = touch.identifier;
              message['message'] = 'touchEnd';
              objManager.receive(message);
            }
            e.preventDefault();
          }, {passive: false});

              //カリング有効化
            this.context_gl.enable(this.context_gl.CULL_FACE);
            // 深度テストを有効にする
            this.context_gl.enable(this.context_gl.DEPTH_TEST);
            this.context_gl.enable(this.context_gl.BLEND);
            this.context_gl.blendFunc(this.context_gl.SRC_ALPHA, this.context_gl.ONE_MINUS_SRC_ALPHA);
            this.context_gl.depthFunc(this.context_gl.LEQUAL);
            this.context_gl.activeTexture(this.context_gl.TEXTURE0);

            this.context_2d.font = "50px 'ＭＳ Ｐゴシック'";
            

    }
    process(){
        ++this.time;
        this.start();
        this.draw();
        this.drawCanvas();
        this.end();
    }
    //ループ頭
    start() {
        this.context_gl.bindFramebuffer(this.context_gl.FRAMEBUFFER, this.fBuffer.framebuffer);

        this.context_gl.clearColor(0.3, 0.3, 0.3, 1.0);
        this.context_gl.clearDepth(1.0);
        this.context_gl.clear(this.context_gl.COLOR_BUFFER_BIT | this.context_gl.DEPTH_BUFFER_BIT);
    }
    //描画
    draw() {
        let vMatrix   = matLIB.identity(matLIB.create());
        let pMatrix   = matLIB.identity(matLIB.create());
        let vpMatrix  = matLIB.identity(matLIB.create());
        let toCamMatrix  = matLIB.identity(matLIB.create());

        let camera = objManager.getObject("camera");
        if(camera === undefined){return;}

        matLIB.lookAt(camera.getPosition(), camera.getPoint(), camera.getUpDirection(), vMatrix);
        matLIB.perspective(60, CANVAS_WIDTH / CANVAS_HEIGHT, 0.1, camera.getDistance() * 5.0, pMatrix);
        matLIB.multiply(pMatrix, vMatrix, vpMatrix);

        matLIB.lookAt(camera.getPosition(), camera.getPoint(), camera.getUpDirection(), toCamMatrix);
        matLIB.inverse(toCamMatrix, toCamMatrix);
        toCamMatrix[12] = 0;toCamMatrix[13] = 0;toCamMatrix[14] = 0;

        let modelArray = objManager.getModelArray();
        for(let model of modelArray){
            //本来はnode[0]を取り出し階層構造に従って処理する
            for(let node of model.file_data.nodes){
                let meshNumber = node.mesh;
                if(meshNumber !== undefined){//meshの指定がある
                    let shader = this.shader1;
                    if(node.skin !== undefined && model.file_data.skins !== undefined){
                        //skinがあるので専用シェーダを設定する
                        let skin = model.file_data.skins[node.skin];
                        let root_joint_index = skin.skeleton;//ルートジョイントの番号
                        
                        shader = this.shader_skin;//スキンメッシュ用シェーダ設定

                        let jointMatArray = model.computeJointArray(skin, root_joint_index);
                        
                        shader.setJointMatArray(jointMatArray);
                    }
                    let mesh = model.file_data.meshes[meshNumber];
                    let mMatrix   = matLIB.identity(matLIB.create());
                    for(let primitive of mesh.primitives){
                        matLIB.translate(mMatrix, [model.position.x, model.position.y, model.position.z], mMatrix);//modelのtransを反映
                        this.drawModel(primitive, shader, mMatrix, vpMatrix, camera.getPosition());
                    }
                }
            }
        }
        let boardArray = objManager.getBoardArray();
        for(let board of boardArray){
            this.drawBoard(board, vpMatrix, toCamMatrix);
        }
        //透過処理のため、後から描画
        let drawArray = objManager.getDrawArray();
        for(let drawObj of drawArray){
            this.drawPanel(drawObj, vpMatrix);
        }
    }

    drawModel(obj, shader, mMatrix, vpMatrix, cameraPosition){//obj:primitive
        let texture = resManager.getTexture(obj.materialData.pbrMetallicRoughness.baseColorTexture.uri);
        if(texture === null){
            return;
        }
        matLIB.translate(mMatrix, [0.0, 0.0, 0.0], mMatrix);
        //matLIB.rotate(mMatrix, -3.14 * 0.5 , [0, 1, 0], mMatrix);
        matLIB.scale(mMatrix, [1, 1, 1], mMatrix);

        let normalMatrix = matLIB.identity(matLIB.create());
        let lightVec = [5.0, -25, -5.0];

        let mvpMatrix = matLIB.identity(matLIB.create());
        matLIB.multiply(vpMatrix, mMatrix, mvpMatrix);
        let invMatrix = matLIB.identity(matLIB.create());
        matLIB.inverse(mMatrix, invMatrix);
        matLIB.transpose(invMatrix, normalMatrix);

        this.context_gl.useProgram(shader.getPrg());

        shader.setUniform(mMatrix, mvpMatrix, normalMatrix, lightVec, cameraPosition);
        
        this.context_gl.activeTexture(this.context_gl.TEXTURE0);
        this.context_gl.bindTexture(this.context_gl.TEXTURE_2D, texture);
        shader.set_attribute(obj.VBOList);
        this.context_gl.bindBuffer(this.context_gl.ELEMENT_ARRAY_BUFFER, obj.vertexIndexBuffer);
        this.context_gl.drawElements(this.context_gl.TRIANGLES, obj.indexCount, this.context_gl.UNSIGNED_SHORT, 0);
    }
    drawBoard(obj, vpMatrix, toCamMatrix){
        let texture = resManager.getTexture(obj.getTextureAddress());
        if(texture === null){
            return;
        }
        let mMatrix = matLIB.identity(matLIB.create());

        matLIB.translate(mMatrix, [obj.getPosition().x, obj.getPosition().y, obj.getPosition().z], mMatrix);
        //matLIB.rotate(mMatrix, 0.1/3.14 * this.time , [0, 1, 0], mMatrix);

        matLIB.multiply(mMatrix, toCamMatrix, mMatrix);

        //let scaleX = 1.0 * texture.width / CANVAS_WIDTH * obj.getScale().x;
        //let scaleY = 1.0 * texture.height / CANVAS_HEIGHT * obj.getScale().y;
        matLIB.scale(mMatrix, [1, 1, 1.0], mMatrix);

        matLIB.multiply(vpMatrix, mMatrix, mMatrix);
        this.context_gl.useProgram(this.shader_board.getPrg());
        this.shader_board.setUniform(mMatrix, obj.getUVArray());

        this.context_gl.activeTexture(this.context_gl.TEXTURE0);
        this.context_gl.bindTexture(this.context_gl.TEXTURE_2D, texture);
        this.shader_board.set_attribute(obj.getVBO());
        this.context_gl.bindBuffer(this.context_gl.ELEMENT_ARRAY_BUFFER, obj.getIBO());
        this.context_gl.drawElements(this.context_gl.TRIANGLES, obj.getIndices(), this.context_gl.UNSIGNED_SHORT, 0);
    }
    drawPanel(obj, vpMatrix){
        let texture = resManager.getTexture(obj.getTextureAddress());
        if(texture === null){
            return;
        }
        let mMatrix = matLIB.identity(matLIB.create());

        let draw_x = (obj.getPosition().x - (VIEWPORT_WIDTH - CANVAS_WIDTH) / 2) / VIEWPORT_WIDTH * 2;
        let draw_y = (obj.getPosition().y - (VIEWPORT_HEIGHT - CANVAS_HEIGHT) / 2) / VIEWPORT_HEIGHT * 2;
        matLIB.translate(mMatrix, [draw_x, draw_y, 0.0], mMatrix);
        //matLIB.rotate(mMatrix, obj.getRotate() , [0, 0, 1], mMatrix);
        let scaleX = 1.0 * texture.width / CANVAS_WIDTH * obj.getScale().x;
        let scaleY = 1.0 * texture.height / CANVAS_HEIGHT * obj.getScale().y;
        matLIB.scale(mMatrix, [scaleX, scaleY, 1.0], mMatrix);

        this.context_gl.useProgram(this.shader_panel.getPrg());
        this.shader_panel.setUniform(mMatrix, obj.getUVArray());

        this.context_gl.activeTexture(this.context_gl.TEXTURE0);
        this.context_gl.bindTexture(this.context_gl.TEXTURE_2D, texture);
        this.shader_panel.set_attribute(obj.getVBO());
        this.context_gl.bindBuffer(this.context_gl.ELEMENT_ARRAY_BUFFER, obj.getIBO());
        this.context_gl.drawElements(this.context_gl.TRIANGLES, obj.getIndices(), this.context_gl.UNSIGNED_SHORT, 0);
    }
    
    //ループ末
    end() {
        this.context_gl.flush();
    }
    //fameBufferからcanvasへ
    drawCanvas(){
        let gl = this.context_gl;
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.fBuffer.texture);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clearColor(0.7, 0.7, 0.7, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        this.shader2.draw();
        
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);//テクスチャを上下反転
        for (let text of objManager.textArray) {
            this.context_2d.fillStyle = text.color;
            this.context_2d.font = text.size + " 'ＭＳ Ｐゴシック'";
            this.context_2d.fillText(text.text, text.x, text.y);
        }
        let spiritTexture= gl.createTexture(CANVAS_WIDTH, CANVAS_HEIGHT);
        let imageData= this.context_2d.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        gl.bindTexture(gl.TEXTURE_2D, spiritTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        
        gl.generateMipmap(gl.TEXTURE_2D);
        this.shader2.draw();
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);//上下反転を解除
    }
    getGLContext() {
        return this.context_gl;
    }
    create_framebuffer(width, height){
        let gl = this.context_gl;
        var frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        let depthRenderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
        let fTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, fTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return {framebuffer: frameBuffer, renderbuffer: depthRenderBuffer, texture: fTexture};
    }
}

export const canvas = new Canvas();
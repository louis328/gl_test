import {Shader } from './Shader.js';

export class ProjShader extends Shader {
    constructor(gl, ver=2) {
        super(gl, ver);
        let shaderInstance = this;
        
        this.fetch_shader(this.file_dir + "proj_"+this.version+"_vs.txt", this.file_dir + "proj_"+this.version+"_fs.txt").then(function(response){
            shaderInstance.create_program(response[0], response[1]);
            shaderInstance.attLocation[0] = gl.getAttribLocation(shaderInstance.prg, 'position');
            shaderInstance.attStride[0] = 3;//頂点は3
            shaderInstance.uniLocation[0] = gl.getUniformLocation(shaderInstance.prg, 'texture2dSampler');
            shaderInstance.planePosition = [
                1.0,  1.0,  0.0,
            -1.0,  1.0,  0.0,
                1.0, -1.0,  0.0,
            -1.0, -1.0,  0.0
            ];
            shaderInstance.planeNormal = [
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0
            ];
            shaderInstance.planeTexCoord = [
            1.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            0.0, 0.0
            ];
            shaderInstance.planeIndex = [
                0, 1, 2, 2, 1, 3
            ];
            shaderInstance.planeVBO = [shaderInstance.create_vbo(shaderInstance.planePosition)];
            shaderInstance.planeIBO = shaderInstance.create_ibo(shaderInstance.planeIndex);
            shaderInstance.isReady = true;
        });
    }
    draw(){
        if(!this.isReady){return;}
		this.gl.useProgram(this.prg);
		this.set_attribute2(this.gl, this.planeVBO, this.attLocation, this.attStride);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.planeIBO);
		this.gl.uniform1i(this.uniLocation[0], 1);
		this.gl.drawElements(this.gl.TRIANGLES, this.planeIndex.length, this.gl.UNSIGNED_SHORT, 0);
    }
    set_attribute2(gl, vbo, attL, attS) {
        // 引数として受け取った配列を処理する
        for (var i in vbo) {
            // バッファをバインドする
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
            // attributeLocationを有効にする
            gl.enableVertexAttribArray(attL[i]);
            // attributeLocationを通知し登録する
            gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
        }
    }
}
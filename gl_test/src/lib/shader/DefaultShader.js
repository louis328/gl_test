import {Shader } from './Shader.js';

export class DefaultShader extends Shader {
    constructor(gl, ver=2) {
        super(gl, ver);
        let shaderInstance = this;
        
        this.fetch_shader(this.file_dir + "default_"+this.version+"_vs.txt", this.file_dir + "default_"+this.version+"_fs.txt").then(function(response){
            shaderInstance.create_program(response[0], response[1]);

            shaderInstance.attLocation[0] = gl.getAttribLocation(shaderInstance.prg, 'position');
            shaderInstance.attLocation[1] = gl.getAttribLocation(shaderInstance.prg, 'normal');
            shaderInstance.attLocation[2] = gl.getAttribLocation(shaderInstance.prg, 'texCoord');
            shaderInstance.attStride[0] = 3;//頂点は3
            shaderInstance.attStride[1] = 3;//法線は3
            shaderInstance.attStride[2] = 2;//uv座標は2
            shaderInstance.uniLocation[0] = gl.getUniformLocation(shaderInstance.prg, 'matrix');
		    shaderInstance.uniLocation[1] = gl.getUniformLocation(shaderInstance.prg, 'mvpMatrix');
		    shaderInstance.uniLocation[2] = gl.getUniformLocation(shaderInstance.prg, 'normalMatrix');
		    shaderInstance.uniLocation[3] = gl.getUniformLocation(shaderInstance.prg, 'lightVec');
            shaderInstance.uniLocation[4] = gl.getUniformLocation(shaderInstance.prg, 'eyePosition');
            shaderInstance.uniLocation[5] = gl.getUniformLocation(shaderInstance.prg, 'texture2dSampler');

            shaderInstance.isReady = true;
        });
    }
    setUniform(mat, mvp, normal, lightVec, cameraPos){//drawElementsの直前に使用
		this.setMatrix(mat);
		this.setMVPMatrix(mvp);
		this.setNormal(normal);
		this.setLightPosition(lightVec);
		this.setCameraPosition(cameraPos);
		this.setTexSampler(0);
    }
    setMatrix(matrix) {
		this.gl.uniformMatrix4fv(this.uniLocation[0], false, matrix);
	}
	setMVPMatrix(mvpMatrix) {
		this.gl.uniformMatrix4fv(this.uniLocation[1], false, mvpMatrix);
	}
	setNormal(normal) {
		this.gl.uniformMatrix4fv(this.uniLocation[2], false, normal);
	}
	setLightPosition(lightVec) {
		this.gl.uniform3fv(this.uniLocation[3], lightVec);
	}
	setCameraPosition(cameraPosition) {
		this.gl.uniform3fv(this.uniLocation[4], cameraPosition);
	}
	setTexSampler(val = 0){
		this.gl.uniform1i(this.uniLocation[5], val);
	}
	setUV(uvArray){
		this.gl.uniform2fv (this.uniLocation[1], uvArray);
	}
}
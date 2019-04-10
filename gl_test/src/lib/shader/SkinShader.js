import {Shader } from './Shader.js';

export class SkinShader extends Shader {
    constructor(gl) {
        super(gl);
        let shaderInstance = this;
        
        this.fetch_shader(this.file_dir + "skin_"+this.version+"_vs.txt", this.file_dir + "skin_"+this.version+"_fs.txt").then(function(response){
            shaderInstance.create_program(response[0], response[1]);

            shaderInstance.attLocation[0] = gl.getAttribLocation(shaderInstance.prg, 'position');
		    shaderInstance.attLocation[1] = gl.getAttribLocation(shaderInstance.prg, 'normal');
		    shaderInstance.attLocation[2] = gl.getAttribLocation(shaderInstance.prg, 'texCoord');
		    shaderInstance.attLocation[3] = gl.getAttribLocation(shaderInstance.prg, 'jointIndex');
            shaderInstance.attLocation[4] = gl.getAttribLocation(shaderInstance.prg, 'weight');
            shaderInstance.attStride[0] = 3;//頂点は3
            shaderInstance.attStride[1] = 3;//法線は3
            shaderInstance.attStride[2] = 2;//uv座標は2
            shaderInstance.attStride[3] = 4;//joint番号最大4つ
            shaderInstance.attStride[4] = 4;//jointに対するweightも最大4つ
            shaderInstance.uniLocation[0] = gl.getUniformLocation(shaderInstance.prg, 'matrix');
		    shaderInstance.uniLocation[1] = gl.getUniformLocation(shaderInstance.prg, 'mvpMatrix');
		    shaderInstance.uniLocation[2] = gl.getUniformLocation(shaderInstance.prg, 'normalMatrix');
		    shaderInstance.uniLocation[3] = gl.getUniformLocation(shaderInstance.prg, 'joinMatArray');
		    shaderInstance.uniLocation[4] = gl.getUniformLocation(shaderInstance.prg, 'lightVec');
            shaderInstance.uniLocation[5] = gl.getUniformLocation(shaderInstance.prg, 'eyePosition');
		    shaderInstance.uniLocation[6] = gl.getUniformLocation(shaderInstance.prg, 'texture2dSampler');
            shaderInstance.joinMatArray = new Float32Array(16);
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

		this.gl.uniformMatrix4fv(this.uniLocation[3], false, this.joinMatArray);
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
	setJointMatArray(matrix){
		this.joinMatArray  = matrix;
	}
	setLightPosition(lightVec) {
		this.gl.uniform3fv(this.uniLocation[4], lightVec);
	}
	setCameraPosition(cameraPosition) {
		this.gl.uniform3fv(this.uniLocation[5], cameraPosition);
	}
	setTexSampler(val = 0){
		this.gl.uniform1i(this.uniLocation[6], val);
	}
	setUV(uvArray){
		this.gl.uniform2fv (this.uniLocation[1], uvArray);
    }
    set_attribute(vbo) {
		let gl = this.gl;
		// 引数として受け取った配列を処理する
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo[0]);
		gl.enableVertexAttribArray(this.attLocation[0]);
		gl.vertexAttribPointer(this.attLocation[0], this.attStride[0], gl.FLOAT, false, 0, 0);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo[1]);
		gl.enableVertexAttribArray(this.attLocation[1]);
		gl.vertexAttribPointer(this.attLocation[1], this.attStride[1], gl.FLOAT, false, 0, 0);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo[2]);
		gl.enableVertexAttribArray(this.attLocation[2]);
		gl.vertexAttribPointer(this.attLocation[2], this.attStride[2], gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo[3]);
		gl.enableVertexAttribArray(this.attLocation[3]);
		gl.vertexAttribPointer(this.attLocation[3], this.attStride[3], gl.UNSIGNED_SHORT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo[4]);
		gl.enableVertexAttribArray(this.attLocation[4]);
		gl.vertexAttribPointer(this.attLocation[4], this.attStride[4], gl.FLOAT, false, 0, 0);
		
	}
}
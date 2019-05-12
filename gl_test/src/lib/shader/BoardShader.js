import {Shader } from './Shader.js';

export class BoardShader extends Shader {
    constructor(gl) {
        super(gl);
        let shaderInstance = this;
        
        this.fetch_shader(this.file_dir + "billboard_1_vs.txt", this.file_dir + "billboard_1_fs.txt").then(function(response){
            shaderInstance.create_program(response[0], response[1]);

            shaderInstance.attLocation[0] = gl.getAttribLocation(shaderInstance.prg, 'position');
            shaderInstance.attLocation[1] = gl.getAttribLocation(shaderInstance.prg, 'texCoord');
    
            shaderInstance.attStride[0] = 3;//3個ずつ
            shaderInstance.attStride[1] = 2;//2個ずつ
    
            shaderInstance.uniLocation[0] = gl.getUniformLocation(shaderInstance.prg, 'mvpMatrix');
            shaderInstance.uniLocation[1] = gl.getUniformLocation(shaderInstance.prg, 'texture2dSampler');
            shaderInstance.isReady = true;
        });
    }

    setUniform(mvp){//drawElementsの直前に使用
		this.setMVPMatrix(mvp);
		this.setTexSampler(0);
    }
    setMVPMatrix(mvpMatrix) {
		this.gl.uniformMatrix4fv(this.uniLocation[0], false, mvpMatrix);
    }
    setTexSampler(val = 0){
		this.gl.uniform1i(this.uniLocation[1], val);
	}
}
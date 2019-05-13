import {Shader } from './Shader.js';

export class BoardShader extends Shader {
  constructor(gl) {
    super(gl);
    let shaderInstance = this;

    this.fetch_shader(this.file_dir + "billboard_1_vs.txt", this.file_dir + "billboard_1_fs.txt").then(function (response) {
      shaderInstance.create_program(response[0], response[1]);

      shaderInstance.attLocation[0] = gl.getAttribLocation(shaderInstance.prg, 'position');
      shaderInstance.attLocation[1] = gl.getAttribLocation(shaderInstance.prg, 'textureCoord');

      shaderInstance.attStride[0] = 3;//3個ずつ
      shaderInstance.attStride[1] = 1;//1個ずつ

      shaderInstance.uniLocation[0] = gl.getUniformLocation(shaderInstance.prg, 'mvpMatrix');
      shaderInstance.uniLocation[1] = gl.getUniformLocation(shaderInstance.prg, 'UVArray');
      shaderInstance.uniLocation[2] = gl.getUniformLocation(shaderInstance.prg, 'texture');
      shaderInstance.isReady = true;
    });
  }

  setUniform(mvp, uvArray) {//drawElementsの直前に使用
    this.setMVPMatrix(mvp);
    this.setTexSampler(0);
    this.setUV(uvArray);
  }
  setMVPMatrix(mvpMatrix) {
    this.gl.uniformMatrix4fv(this.uniLocation[0], false, mvpMatrix);
  }
  setTexSampler(val = 0) {
    this.gl.uniform1i(this.uniLocation[2], val);
  }
  setUV(uvArray){
		this.gl.uniform2fv (this.uniLocation[1], uvArray);
  }
}
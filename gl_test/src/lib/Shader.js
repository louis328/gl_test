
export function create_shader(gl, id) {
	// シェーダを格納する変数
	var shader;
	// HTMLからscriptタグへの参照を取得
	var scriptElement = document.getElementById(id);
	// scriptタグが存在しない場合は抜ける
	if (!scriptElement) { return; }
	// scriptタグのtype属性をチェック
	switch (scriptElement.type) {
		// 頂点シェーダの場合
		case 'x-shader/x-vertex':
			shader = gl.createShader(gl.VERTEX_SHADER);
			break;
		// フラグメントシェーダの場合
		case 'x-shader/x-fragment':
			shader = gl.createShader(gl.FRAGMENT_SHADER);
			break;
		default:
			return;
	}
	// 生成されたシェーダにソースを割り当てる
	gl.shaderSource(shader, scriptElement.text);
	// シェーダをコンパイルする
	gl.compileShader(shader);
	// シェーダが正しくコンパイルされたかチェック
	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return shader;// 成功していたらシェーダを返して終了
	} else {
		var textarea = document.getElementById('message');
		textarea.innerHTML += ("\n create_shader:error");
		alert(gl.getShaderInfoLog(shader));// 失敗していたらエラーログをアラートする
	}
}
export function create_program(gl, vs, fs) {
	// プログラムオブジェクトの生成
	var program = gl.createProgram();

	// プログラムオブジェクトにシェーダを割り当てる
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);

	// シェーダをリンク
	gl.linkProgram(program);

	// シェーダのリンクが正しく行なわれたかチェック
	if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
		// 成功していたらプログラムオブジェクトを有効にする
		gl.useProgram(program);
		// プログラムオブジェクトを返して終了
		return program;
	} else {
		// 失敗していたらエラーログをアラートする
		console.log("create_program:error");
		var textarea = document.getElementById('message');
		textarea.innerHTML += ("\n create_program:error");
		alert(gl.getProgramInfoLog(program));
	}
}
export function create_vbo(gl, data) {
	// バッファオブジェクトの生成
	var vbo = gl.createBuffer();
	// バッファをバインドする
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	// バッファにデータをセット
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	// バッファのバインドを無効化
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	// 生成した VBO を返して終了
	return vbo;
}
// IBOを生成する関数
export function create_ibo(gl, data) {
	// バッファオブジェクトの生成
	var ibo = gl.createBuffer();
	// バッファをバインドする
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	// バッファにデータをセット
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
	// バッファのバインドを無効化
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	// 生成したIBOを返して終了
	return ibo;
}
// VBOをバインドし登録する関数
export function set_attribute(gl, vbo, attL, attS) {
	// 引数として受け取った配列を処理する
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo[0]);
	gl.enableVertexAttribArray(attL[0]);
	gl.vertexAttribPointer(attL[0], attS[0], gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo[1]);
	gl.enableVertexAttribArray(attL[1]);
	gl.vertexAttribPointer(attL[1], attS[1], gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo[2]);
	gl.enableVertexAttribArray(attL[2]);
	gl.vertexAttribPointer(attL[2], attS[2], gl.FLOAT, false, 0, 0);
	
}
export function set_attribute2(gl, vbo, attL, attS) {
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
export function checkImageSize(img) {
	var w = img.naturalWidth, h = img.naturalHeight;
	var size = Math.pow(2, Math.log(Math.max(w, h)) / Math.LN2 | 0); // largest 2^n integer that does not exceed s
	if (w !== h || w !== size) {
		var canv = document.createElement('canvas');
		canv.height = canv.width = size;
		canv.getContext('2d').drawImage(img, 0, 0, w, h, 0, 0, size, size);
		img = canv;console.log(size);
	}
	return img;
}
export function create_framebuffer(gl, width, height){
	var frameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	var depthRenderBuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
	var fTexture = gl.createTexture();
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
/*------------------------------------------------------------------------------------------*/
export class Shader {
	constructor(gl) {
		this.gl = gl;

		let v_shader = create_shader(gl, 'vs');
		let f_shader = create_shader(gl, 'fs');

		this.prg = create_program(gl, v_shader, f_shader);

		this.attLocation = new Array(5);
		this.attLocation[0] = gl.getAttribLocation(this.prg, 'position');
		this.attLocation[1] = gl.getAttribLocation(this.prg, 'normal');
		this.attLocation[2] = gl.getAttribLocation(this.prg, 'texCoord');

		this.attStride = new Array(5);
		this.attStride[0] = 3;//頂点は3
		this.attStride[1] = 3;//法線は3
		this.attStride[2] = 2;//uv座標は2

		this.uniLocation = new Array();
		this.uniLocation[0] = gl.getUniformLocation(this.prg, 'matrix');
		this.uniLocation[1] = gl.getUniformLocation(this.prg, 'mvpMatrix');
		this.uniLocation[2] = gl.getUniformLocation(this.prg, 'normalMatrix');
		this.uniLocation[3] = gl.getUniformLocation(this.prg, 'lightVec');
        this.uniLocation[4] = gl.getUniformLocation(this.prg, 'eyePosition');
        this.uniLocation[5] = gl.getUniformLocation(this.prg, 'texture2dSampler');
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
	getPrg() {
		return this.prg;
	}
	getLoc() {
		return this.attLocation;
	}
	getStr() {
		return this.attStride;
	}
	set_attribute(gl, vbo) {
		// 引数として受け取った配列を処理する
		for (let i in vbo) {
			// バッファをバインドする
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
			// attributeLocationを有効にする
			gl.enableVertexAttribArray(this.attLocation[i]);
			// attributeLocationを通知し登録する
			gl.vertexAttribPointer(this.attLocation[i], this.attStride[i], gl.FLOAT, false, 0, 0);
		}
	}
};
export class SecondShader{
	//frameBufferからcanvasへの描画に使用
	constructor(gl) {
		this.gl = gl;

		let v_shader = create_shader(gl, 'vsp');
		let f_shader = create_shader(gl, 'fsp');

		this.prg = create_program(gl, v_shader, f_shader);

		this.attLocation = new Array(1);
		this.attLocation[0] = gl.getAttribLocation(this.prg, 'position');

		this.attStride = new Array(1);
		this.attStride[0] = 3;//頂点は3

		this.uniLocation = new Array(1);
		this.uniLocation[0] = gl.getUniformLocation(this.prg, 'texture2dSampler');
		this.planePosition = [
			1.0,  1.0,  0.0,
		   -1.0,  1.0,  0.0,
			1.0, -1.0,  0.0,
		   -1.0, -1.0,  0.0
		];
		this.planeNormal = [
		   0.0, 0.0, 1.0,
		   0.0, 0.0, 1.0,
		   0.0, 0.0, 1.0,
		   0.0, 0.0, 1.0
		];
		this.planeTexCoord = [
		   1.0, 0.0,
		   0.0, 0.0,
		   1.0, 1.0,
		   0.0, 1.0
		];
		this.planeIndex = [
			0, 1, 2, 2, 1, 3
		];
		this.planeVBO = [create_vbo(gl, this.planePosition)];
		this.planeIBO = create_ibo(gl, this.planeIndex);
	}
	draw(){
		this.gl.useProgram(this.prg);
		set_attribute2(this.gl, this.planeVBO, this.attLocation, this.attStride);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.planeIBO);
		this.gl.uniform1i(this.uniLocation[0], 1);
		this.gl.drawElements(this.gl.TRIANGLES, this.planeIndex.length, this.gl.UNSIGNED_SHORT, 0);
	}
}
export class ShaderForSkinMesh {//スキンメッシュ用にjointとweightを追加
	constructor(gl) {
		this.gl = gl;

		let v_shader = create_shader(gl, 'vs_skin');
		let f_shader = create_shader(gl, 'fs_skin');

		this.prg = create_program(gl, v_shader, f_shader);

		this.attLocation = new Array(5);
		this.attLocation[0] = gl.getAttribLocation(this.prg, 'position');
		this.attLocation[1] = gl.getAttribLocation(this.prg, 'normal');
		this.attLocation[2] = gl.getAttribLocation(this.prg, 'texCoord');
		this.attLocation[3] = gl.getAttribLocation(this.prg, 'jointIndex');
		this.attLocation[4] = gl.getAttribLocation(this.prg, 'weight');

		this.attStride = new Array(5);
		this.attStride[0] = 3;//頂点は3
		this.attStride[1] = 3;//法線は3
		this.attStride[2] = 2;//uv座標は2
		this.attStride[3] = 4;//joint番号最大4つ
		this.attStride[4] = 4;//jointに対するweightも最大4つ

		
		this.uniLocation = new Array(7);
		this.uniLocation[0] = gl.getUniformLocation(this.prg, 'matrix');
		this.uniLocation[1] = gl.getUniformLocation(this.prg, 'mvpMatrix');
		this.uniLocation[2] = gl.getUniformLocation(this.prg, 'normalMatrix');
		this.uniLocation[3] = gl.getUniformLocation(this.prg, 'joinMatArray');
		this.uniLocation[4] = gl.getUniformLocation(this.prg, 'lightVec');
        this.uniLocation[5] = gl.getUniformLocation(this.prg, 'eyePosition');
		this.uniLocation[6] = gl.getUniformLocation(this.prg, 'texture2dSampler');
		
		this.joinMatArray = new Float32Array(16);
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
	getPrg() {
		return this.prg;
	}
	getLoc() {
		return this.attLocation;
	}
	getStr() {
		return this.attStride;
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
};
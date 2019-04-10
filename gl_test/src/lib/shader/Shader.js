
export class Shader {
	constructor(gl, ver=2) {
        this.gl = gl;
        this.version = ver;
        let dir = window.location.pathname;
        this.file_dir = dir.substring(0, dir.lastIndexOf('/')) + "/src/lib/shader/file/";

        this.attLocation = new Array();
        this.attStride = new Array();
        this.uniLocation = new Array();

        this.prg = null;
        this.isReady = false;
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
		// 引数として受け取った配列を処理する
		for (let i in vbo) {
			// バッファをバインドする
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo[i]);
			// attributeLocationを有効にする
			this.gl.enableVertexAttribArray(this.attLocation[i]);
			// attributeLocationを通知し登録する
			this.gl.vertexAttribPointer(this.attLocation[i], this.attStride[i], this.gl.FLOAT, false, 0, 0);
		}
    }
    // vsとfsを外部テキストから非同期で読み込み、シェーダーオブジェクトを２つ返す
    fetch_shader(uri_vs, uri_fs){
        let gl = this.gl;
        let promise_vs =  new Promise(function(resolve, reject){
            fetch(uri_vs).then(function(response) {
                return response.text();
            }).then(function(text) {
                resolve(text);
            });
        });
        let promise_fs =  new Promise(function(resolve, reject){
            fetch(uri_fs).then(function(response) {
                return response.text();
            }).then(function(text) {
                resolve(text);
            });
        });
        let shaderInstance = this;

            return Promise.all( [ promise_vs, promise_fs ] ).then( function ( textArray ) {
                let shader = [
                    gl.createShader(gl.VERTEX_SHADER),
                    gl.createShader(gl.FRAGMENT_SHADER)
                ];
                for(let i=0;i<2;++i){
                    gl.shaderSource(shader[i], textArray[i]);
                    gl.compileShader(shader[i]);
                }
                if (!gl.getShaderParameter(shader[0], gl.COMPILE_STATUS)) {
                    let textarea = document.getElementById('message');
                    textarea.innerHTML += ("\n create_shader:error");
                    alert(gl.getShaderInfoLog(shader[0]));// 失敗していたらエラーログをアラートする
                }
                else if (!gl.getShaderParameter(shader[1], gl.COMPILE_STATUS)) {
                    let textarea = document.getElementById('message');
                    textarea.innerHTML += ("\n create_shader:error");
                    alert(gl.getShaderInfoLog(shader[1]));// 失敗していたらエラーログをアラートする
                }
                else{
                    return shader;
                }
                
            } )
            .catch( function ( reason ) {
                console.log( reason ) ;
            } ) ;

    }

    create_shader(id) {
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
                shader = this.gl.createShader(this.gl.VERTEX_SHADER);
                break;
            // フラグメントシェーダの場合
            case 'x-shader/x-fragment':
                shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
                break;
            default:
                return;
        }
        // 生成されたシェーダにソースを割り当てる
        this.gl.shaderSource(shader, scriptElement.text);
        // シェーダをコンパイルする
        this.gl.compileShader(shader);
        // シェーダが正しくコンパイルされたかチェック
        if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            return shader;// 成功していたらシェーダを返して終了
        } else {
            var textarea = document.getElementById('message');
            textarea.innerHTML += ("\n create_shader:error");
            alert(this.gl.getShaderInfoLog(shader));// 失敗していたらエラーログをアラートする
        }
    }
    create_program(vs, fs) {
        // プログラムオブジェクトの生成
        this.prg = this.gl.createProgram();
    
        // プログラムオブジェクトにシェーダを割り当てる
        this.gl.attachShader(this.prg, vs);
        this.gl.attachShader(this.prg, fs);
    
        // シェーダをリンク
        this.gl.linkProgram(this.prg);
    
        // シェーダのリンクが正しく行なわれたかチェック
        if (this.gl.getProgramParameter(this.prg, this.gl.LINK_STATUS)) {
            // 成功していたらプログラムオブジェクトを有効にする
            this.gl.useProgram(this.prg);
            // プログラムオブジェクトを返して終了
            return this.prg;
        } else {
            // 失敗していたらエラーログをアラートする
            console.log("create_program:error");
            var textarea = document.getElementById('message');
            textarea.innerHTML += ("\n create_program:error");
            alert(this.gl.getProgramInfoLog(this.prg));
        }
    }
    create_vbo(data) {
        // バッファオブジェクトの生成
        let vbo = this.gl.createBuffer();
        // バッファをバインドする
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        // バッファにデータをセット
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
        // バッファのバインドを無効化
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        // 生成した VBO を返して終了
        return vbo;
    }
    // IBOを生成する関数
    create_ibo(data) {
        // バッファオブジェクトの生成
        let ibo = this.gl.createBuffer();
        // バッファをバインドする
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
        // バッファにデータをセット
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);
        // バッファのバインドを無効化
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        // 生成したIBOを返して終了
        return ibo;
    }
}
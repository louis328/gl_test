import {canvas} from '../Canvas.js';
import {objManager} from '../ObjectManager.js';
import {resManager} from '../ResourceManager.js';
import {qtLIB, matLIB} from '../minMatrix.js';
import {FPS} from '../Config.js';

export class Model{
    constructor(url){
        this.position = {x:0, y:0, z:0};
        this.frame_time = 0;
        this.animation = 0;

        this.dir_path = "";
        this.file_data = null;
        this.readFile(url);
    }

    //スキンメッシュ用のjointごとの変換行列を計算
    computeJointArray(skin, root_index){
        let matArray = new Array();
        for(let i=0;i<32;++i){matArray.push(matLIB.identity(matLIB.create()));}
    
        let initial_mat = matLIB.identity(matLIB.create());
        if(this.file_data.nodes[0].matrix !== undefined){
            initial_mat = this.file_data.nodes[0].matrix;
        }
        this.computeJointArrayRec(matArray, root_index, initial_mat);
        for(let node_index of skin.joints){
            let joint_index = this.file_data.nodes[node_index].jointIndex;
            if(skin.inverseBindMatrices === undefined){continue;}
            let inverseBindMatrix = [];
            for(let i=0;i<16;++i){
                inverseBindMatrix[i] = skin.inverseBindMatrices[i + joint_index*16];
            }
            matLIB.multiply(matArray[joint_index], inverseBindMatrix, matArray[joint_index]);
        }
        let ret = [];
        for(let i=0;i<32;++i){
            for(var j=0;j<16;++j){
                ret.push(matArray[i][j]);//matごとではなく、要素ごとに送らないと解釈してくれないらしい
            }
        }
        return ret;
    }
    computeMixedVector(data, frame_second){
        frame_second = frame_second % data.keyFrames.slice(-1)[0];
        for(let index in data.keyFrames){
            if(frame_second < data.keyFrames[index]){
                let index_pre = (index + data.keyFrames.length - 1) % data.keyFrames.length;
                let vec1 = data.outputs[index_pre];
                let vec2 = data.outputs[index];
                let vec = new Array(vec1.length);
                let time_length = data.keyFrames[index] - data.keyFrames[index_pre];
                let ratio2 = (frame_second - data.keyFrames[index_pre]) / time_length;
                let ratio1 = (time_length - (frame_second - data.keyFrames[index_pre])) / time_length;
                for(let i=0;i<vec.length;++i){
                    vec[i] = vec1[i] * ratio1 + vec2[i] * ratio2;
                }
                return vec;
            }
        }
    }
    computeJointArrayRec(matArray, node_index, parent_matrix){
        let node = this.file_data.nodes[node_index];
        let mat = matLIB.identity(matLIB.create());
        let animation = this.file_data.animations[this.animation];
        let frame_second = this.frame_time / FPS;//フレーム数から秒へ変換
        //matLIB.translate(mat, node.translation, mat);
        //let mat_R = qtLIB.toMatIV(node.rotation, matLIB.create());
        
        let vec_trans = this.computeMixedVector(animation.dataTrans[node.jointIndex], frame_second);
        matLIB.translate(mat, vec_trans, mat);
        
        let qt_rotate = this.computeMixedVector(animation.dataRotation[node.jointIndex], frame_second);
        let mat_R = qtLIB.toMatIV(qt_rotate, matLIB.create());
        matLIB.multiply(mat, matLIB.inverse(mat_R, mat_R), mat);//nodeのrotationは逆向き？
        matLIB.multiply(parent_matrix, mat, matArray[node.jointIndex]);//親の変換行列に自身の回転をかける
    
        if(node.children !== undefined){
            for(let child_node_index of node.children){
                this.computeJointArrayRec(matArray, child_node_index, matArray[node.jointIndex]);
            }
        }
    }
        
    readFile(url){
        this.dir_path = url.split("/").reverse().slice(1).reverse().join("/") + "/";
        let thisInstance = this;
        fetch(url).then(function(response) {
            return response.json();
        }).then(function(gltf) {
            thisInstance.file_data = gltf;
            Promise.all( gltf.buffers.map(function(elem){return thisInstance.readBinaryFile(elem);}) ).then( function ( message ) {
                console.log( message ) ;
                thisInstance.parseFileData();
                objManager.modelArray.push(thisInstance);
            } ) ;
            if(gltf.images !== undefined){
                for(let image of gltf.images){
                    let uri = thisInstance.dir_path + image.uri;
                    let tex = resManager.getTexture(uri);
                    image.uri = uri;
                }
            }
            
        });

    }
    readBinaryFile(buffer){
        let thisInstance = this;
        return new Promise(function(resolve, reject){
            fetch(thisInstance.dir_path + buffer.uri).then(function(response) {
                return response.arrayBuffer();
            }).then(function(arrayBuffer) {
                buffer.data = arrayBuffer;
                resolve("success!");
            });
        });
    }
    parseFileData(){
        for(let node of this.file_data.nodes){
            let meshNumber = node.mesh;
            if(meshNumber !== undefined){
                this.parseMesh(this.file_data.meshes[meshNumber]);
                if(node.skin !== undefined){
                    let skin = this.file_data.skins[node.skin];
                    if(skin.inverseBindMatrices !== undefined){
                        let accessor = this.file_data.accessors[skin.inverseBindMatrices];
                        let binary = this.parseAccessor(accessor);
                        skin.inverseBindMatrices = new Float32Array( (binary) );
                    }
                    this.parseSkin(skin); console.log(this.file_data);
                    
                }
            }
        }
        if(this.file_data.animations !== undefined){
            for(let animation of this.file_data.animations){
                this.parseAnimations(animation);
            }
        }
        
    }
    parseAnimations(animation){
        let targetNodes = new Object();
        for(let channel of animation.channels){
            targetNodes[channel.target.node] = 1;
        }
        animation.jointSize = Object.keys(targetNodes).length;
        animation.dataTrans = new Array();
        animation.dataRotation = new Array();
        animation.dataScale = new Array();
        for(let i=0;i<animation.jointSize;++i){
            animation.dataTrans.push(new Object());
            animation.dataRotation.push(new Object());
            animation.dataScale.push(new Object());
        }
        for(let channel of animation.channels){
            let sampler = animation.samplers[channel.sampler];
            let accessor_in = this.file_data.accessors[sampler.input];
            let binary_in = this.parseAccessor(accessor_in);
            let input  = new Int16Array(binary_in);
            let accessor_out = this.file_data.accessors[sampler.output];
            let binary_output = this.parseAccessor(accessor_out);
            let output  = new Float32Array(binary_output);
            let jointIndex = this.file_data.nodes[channel.target.node].jointIndex;
            if(channel.target.path === "translation"){
                animation.dataTrans[jointIndex].keyFrames = new Array(accessor_in.count);
                animation.dataTrans[jointIndex].outputs = new Array(accessor_out.count);
                let time_length = accessor_in.max[0] - accessor_in.min[0];
                for(let i=0;i<accessor_in.count;++i){
                    let val = accessor_in.min[0] + time_length / (accessor_in.count - 1) * i;
                    animation.dataTrans[jointIndex].keyFrames[i] =  val;
                }
                for(let i=0;i<accessor_out.count;++i){
                    animation.dataTrans[jointIndex].outputs[i] = new Float32Array(3);
                    for(let j=0;j<3;++j){
                        animation.dataTrans[jointIndex].outputs[i][j] = output[i*3 + j];
                    }
                }
            }
            else if(channel.target.path === "rotation"){
                animation.dataRotation[jointIndex].keyFrames = new Array(accessor_in.count);
                animation.dataRotation[jointIndex].outputs = new Array(accessor_out.count);
                let time_length = accessor_in.max[0] - accessor_in.min[0];
                for(let i=0;i<accessor_in.count;++i){
                    let val = accessor_in.min[0] + time_length / (accessor_in.count - 1) * i;
                    animation.dataRotation[jointIndex].keyFrames[i] =  val;
                }
                for(let i=0;i<accessor_out.count;++i){
                    animation.dataRotation[jointIndex].outputs[i] = new Float32Array(4);
                    for(let j=0;j<4;++j){
                        animation.dataRotation[jointIndex].outputs[i][j] = output[i*4 + j];
                    }
                }
            }
            else if(channel.target.path === "scale"){
                animation.dataScale[jointIndex].keyFrames = new Array(accessor_in.count);
                animation.dataScale[jointIndex].outputs = new Array(accessor_out.count);
                let time_length = accessor_in.max[0] - accessor_in.min[0];
                for(let i=0;i<accessor_in.count;++i){
                    let val = accessor_in.min[0] + time_length / (accessor_in.count - 1) * i;
                    animation.dataScale[jointIndex].keyFrames[i] =  val;
                }
                for(let i=0;i<accessor_out.count;++i){
                    animation.dataScale[jointIndex].outputs[i] = new Float32Array(3);
                    for(let j=0;j<3;++j){
                        animation.dataScale[jointIndex].outputs[i][j] = output[i*3 + j];
                    }
                }
            }
        }
    }
    parseMesh(mesh){
        let gl = canvas.getGLContext();
        for(let primitive of mesh.primitives){
            if(primitive.indices !== undefined){
                let accessor = this.file_data.accessors[primitive.indices];
                primitive.indexCount = accessor.count;
                let binary = this.parseAccessor(accessor);
                primitive.index_buffer = new Int16Array(binary);
                primitive.vertexIndexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, primitive.vertexIndexBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, primitive.index_buffer, gl.STATIC_DRAW);
            }
            if(primitive.attributes.POSITION !== undefined){
                let accessor = this.file_data.accessors[primitive.attributes.POSITION];
                primitive.vertexCount = accessor.count;
                let binary = this.parseAccessor(accessor);
                primitive.position_buffer = new Float32Array( (binary) );
                primitive.vertexPositionBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, primitive.vertexPositionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, primitive.position_buffer, gl.STATIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
            if(primitive.attributes.NORMAL !== undefined){
                let accessor = this.file_data.accessors[primitive.attributes.NORMAL];
                let binary = this.parseAccessor(accessor);
                primitive.normal_buffer = new Float32Array( (binary) );
                primitive.vertexNormalBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, primitive.vertexNormalBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, primitive.normal_buffer, gl.STATIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
            if(primitive.attributes.TEXCOORD_0 !== undefined){
                let accessor = this.file_data.accessors[primitive.attributes.TEXCOORD_0];
                let binary = this.parseAccessor(accessor);
                primitive.texcoord_buffer = new Float32Array( (binary) );
                primitive.vertexTexcoordBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, primitive.vertexTexcoordBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, primitive.texcoord_buffer, gl.STATIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
            else{
                let binary = new Array();
                for(let i=0;i<primitive.vertexCount*2*4;++i){
                    binary.push("00000000");
                }
                primitive.texcoord_buffer = new Float32Array(binary );
                primitive.vertexTexcoordBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, primitive.vertexTexcoordBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, primitive.texcoord_buffer, gl.STATIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
            primitive.VBOList = [primitive.vertexPositionBuffer, primitive.vertexNormalBuffer, primitive.vertexTexcoordBuffer];
            
            if(primitive.attributes.JOINTS_0 !== undefined){
                let accessor = this.file_data.accessors[primitive.attributes.JOINTS_0];
                let binary = this.parseAccessor(accessor);
                let joint_buffer = new Int16Array( binary );
                primitive.vertexJointBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, primitive.vertexJointBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, joint_buffer, gl.STATIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                primitive.VBOList.push( primitive.vertexJointBuffer );
                if(primitive.attributes.WEIGHTS_0 !== undefined){
                    let weight_accessor = this.file_data.accessors[primitive.attributes.WEIGHTS_0];
                    let weight_binary = this.parseAccessor(weight_accessor);
                    let weight_buffer = new Float32Array( weight_binary );
                    primitive.vertexWeightBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, primitive.vertexWeightBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, weight_buffer, gl.STATIC_DRAW);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                    primitive.VBOList.push( primitive.vertexWeightBuffer );
                }
            }

            primitive.materialData = this.file_data.materials[primitive.material];
            if(primitive.materialData.pbrMetallicRoughness === undefined){
                primitive.materialData.pbrMetallicRoughness = new Object();
            }
            let baseColorTexture = primitive.materialData.pbrMetallicRoughness.baseColorTexture;
            if(baseColorTexture !== undefined){
                baseColorTexture.uri = this.file_data.images[baseColorTexture.index].uri;
            }
            else{
                primitive.materialData.pbrMetallicRoughness.baseColorTexture = new Object();
                primitive.materialData.pbrMetallicRoughness.baseColorTexture.uri = "/3d/src/lib/gltf/default.png";
            }
        }
    }
    parseSkin(skin){
        for(let i in skin.joints){
            this.file_data.nodes[skin.joints[i]].jointIndex = Number(i);
        }
    }
    parseAccessor(accessor){
        let bv_index = accessor.bufferView;
        let bufferView = this.file_data.bufferViews[bv_index];
        let b_index = bufferView.buffer;
        let buffer = this.file_data.buffers[b_index];
        let accOffset = accessor.byteOffset;
        if(accOffset === undefined){accOffset = 0;}
        let start = accOffset + bufferView.byteOffset;
        //let end  = accOffset + bufferView.byteOffset + bufferView.byteLength;
        let length = 1;
        if(accessor.count !== undefined){
            length = accessor.count;
        }
        if(accessor.type === "SCALAR"){
            length *= 1;
        }
        else if(accessor.type === "VEC2"){
            length *= 2;
        }
        else if(accessor.type === "VEC3"){
            length *= 3;
        }
        else if(accessor.type === "VEC4"){
            length *= 4;
        }
        else if(accessor.type === "MAT4"){
            length *= 16;
        }
        else{
            console.log("accessor.type: " + accessor.type + " の処理が無い");
        }

        if(accessor.componentType === 5123){//Int16Array
            length *= 2;
        }
        else if(accessor.componentType === 5126){//Float32Array
            length *= 4;
        }
        else{
            console.log("accessor.componentType: " + accessor.componentType + " の処理が無い");
        }

        return ( buffer.data.slice(start, start+length) ) ;
    }
}
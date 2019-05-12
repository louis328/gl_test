console.log("title");
import { ManagedObject } from '../../../../gl_test/src/lib/ManagedObject.js';
import { keyManager} from '../../../../gl_test/src/lib/KeyManager.js';
import { Player } from '../character/Player.js'
import { Model } from '../../../../gl_test/src/lib/gltf/Model.js';
import { Camera } from '../../../../gl_test/src/lib/Camera.js';

export class TitleScene extends ManagedObject{
    constructor(){
        super("title_scene");
        console.log("title");
        this.player = new Player();
        this.model1 = new Model("/3d/res/camera/AntiqueCamera.gltf");
        
        this.box0 = new Model("/gl_test/res/box/BoxTextured.gltf");
        this.box1 = new Model("/gl_test/res/box/BoxTextured.gltf");
        this.box2 = new Model("/gl_test/res/box/BoxTextured.gltf");
        this.box3 = new Model("/gl_test/res/camera/AntiqueCamera.gltf");
        this.box4 = new Model("/gl_test/res/box/BoxTextured.gltf");
        this.box5 = new Model("/gl_test/res/box/BoxTextured.gltf");
        this.riggedSimple = new Model("/gl_test/res/model/RiggedSimple/RiggedSimple.gltf");
        this.box1.position.x = 5;
        this.box2.position.y = 5;
        this.box3.position.z = 5;
        this.box4.position.x = -5;
        this.box5.position.z = -5;
        this.model1.position.x = 3;

        this.camera = new Camera();
        
    }
    process(){
        this.riggedSimple.frame_time += 1;
    }
    destructor(){

    }
}

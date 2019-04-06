import { ManagedObject } from '/3d/src/lib/ManagedObject.js';
import { keyManager} from '/3d/src/lib/KeyManager.js';
import { Player } from '/3d/src/game/character/Player.js'
import { Model } from '/3d/src/lib/gltf/Model.js';
import { Camera } from '/3d/src/lib/Camera.js';

export class TitleScene extends ManagedObject{
    constructor(){
        super("title_scene");
        console.log("title");
        //this.player = new Player();
        //this.model1 = new Model("/3d/res/camera/AntiqueCamera.gltf");
        this.box0 = new Model("/3d/res/box/BoxTextured.gltf");
        this.box1 = new Model("/3d/res/box/BoxTextured.gltf");
        this.box2 = new Model("/3d/res/box/BoxTextured.gltf");
        this.box3 = new Model("/3d/res/box/BoxTextured.gltf");
        this.box4 = new Model("/3d/res/box/BoxTextured.gltf");
        this.box5 = new Model("/3d/res/box/BoxTextured.gltf");
        this.riggedSimple = new Model("/3d/res/model/RiggedSimple/RiggedSimple.gltf");
        this.box1.position.x = 8;
        this.box2.position.y = 8;
        this.box3.position.z = 8;
        this.box4.position.x = -8;
        this.box5.position.z = -8;
        this.camera = new Camera();
    }
    process(){
        this.riggedSimple.frame_time += 1;
    }
    destructor(){

    }
}
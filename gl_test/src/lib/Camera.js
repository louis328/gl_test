import { ManagedObject } from './ManagedObject.js'

export class Camera extends ManagedObject{
    constructor(){
        super("camera");
        this.position = {x:5, y:10, z:25.0};
        this.point = {x:0, y:1, z:0};//焦点
        this.upDirection = {x:0, y:1.0, z:0};

        this.time = 0;
    }
    process(){
        this.position = {x:Math.sin(this.time * 0.03) * 12, y:8, z:22.0};
        ++this.time;
    }
    getDistance(){
        return Math.sqrt((this.position.x - this.point.x)**2 + (this.position.y - this.point.y)**2 + (this.position.z - this.point.z)**2);
    }
    getPosition(){
        return [this.position.x, this.position.y, this.position.z];
    }
    getPoint(){
        return [this.point.x, this.point.y, this.point.z];
    }
    getUpDirection(){
        return [this.upDirection.x, this.upDirection.y, this.upDirection.z];
    }
}

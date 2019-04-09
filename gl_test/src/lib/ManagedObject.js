import {objManager} from './ObjectManager.js';


export class ManagedObject{
    constructor(id){
        this.ID = id;
        let obj = objManager.objHash[this.ID];
        if(obj == undefined){
            objManager.objHash[this.ID] = this;
        }
        else{
            console.log("ID:" + id + "は登録済み");
        }
    }
    process(){

    }
    dead(){
        this.destructor();
        objManager.remove(this.ID);
    }
    destructor(){

    }
    getID(){
        return this.ID;
    }
    send(message){
        objManager.receive(message);
    }
    receive(message){
        
    }
}
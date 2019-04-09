import { ManagedObject } from './ManagedObject.js'

class KeyManager extends ManagedObject{
    constructor() {
        super("keyManager");
        document.getElementById('canvas').keyManager = this;
        document.onkeydown = this.pressFunction;
        document.onkeyup = this.releaseFunction;
        this.keyState = new Object();
        this.keyPreState = new Object();

        this.keyJustDown = new Object();
        this.keyJustUp = new Object();
        for(let i=0;i<128;++i){
            this.keyState [String(i)] = false;
            this.keyPreState [String(i)] = false;
        }
    }
    pressFunction(event){
        let keyCode = event.keyCode;
        //console.log("key press: " + keyCode);
        document.getElementById('canvas').keyManager.keyState[keyCode] = true;
    }
    releaseFunction(event){
        let keyCode = event.keyCode;
        //console.log("key release: " + keyCode);
        document.getElementById('canvas').keyManager.keyState[keyCode] = false;
    }
    process(){
        let state = this.keyState;
        for(let k in state){
            let change = state[k] ^ this.keyPreState[k];
            this.keyJustDown[k] = change & state[k];
            this.keyJustUp[k] = change & !state[k];
            this.keyPreState[k] = state[k];
        }
    }
    getKeyState(key){
        return this.keyState[key];
    }
    isKeyJustDown(key){
        return this.keyJustDown[key];
    }
    isKeyJustUp(key){
        return this.keyJustUp[key];
    }
}

export const keyManager = new KeyManager();
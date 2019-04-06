
//画面の縦横比でPCモードかスマホモードか分岐
export const PC_MODE = ( window.innerHeight < window.innerWidth*1.3 ) ? (true) : false;
const SIDE_LENGTH = ( window.innerWidth <  window.innerHeight) ? (window.innerHeight) : window.innerWidth;
export const PLAY_WIDTH = 900;
export const PLAY_HEIGHT = 675;
export const VIEWPORT_WIDTH = ( PC_MODE ) ? (PLAY_WIDTH) : SIDE_LENGTH;
export const VIEWPORT_HEIGHT = ( PC_MODE ) ? (PLAY_WIDTH) : SIDE_LENGTH;
export const CANVAS_WIDTH = ( PC_MODE ) ? (PLAY_WIDTH) : window.innerWidth;
export const CANVAS_HEIGHT = ( PC_MODE ) ? (PLAY_HEIGHT) : window.innerHeight;

export const FPS = 30;
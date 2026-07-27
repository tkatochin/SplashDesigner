import SplashScene from "./src/scenes/SplashScene.js";

export function createGame(){
  return new Phaser.Game({
    type: Phaser.AUTO,
    width:1280,
    height:720,
    parent:document.body,
    backgroundColor:"#101820",
    scene:[SplashScene],
    scale:{
      mode:Phaser.Scale.FIT,
      autoCenter:Phaser.Scale.CENTER_BOTH
    }
  });
}

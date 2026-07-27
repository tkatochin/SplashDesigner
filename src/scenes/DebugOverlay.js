export default class DebugOverlay{
  constructor(scene){
    this.scene=scene;
    this.enabled=false;

    this.text=scene.add.text(10, scene.scale.height-90, "",{
      fontSize:"14px",
      color:"#00ff88",
      backgroundColor:"#000000"
    }).setDepth(9999).setVisible(false).setScrollFactor(0);
  }

  setEnabled(flag){
    this.enabled=flag;
    this.text.setVisible(flag);
  }

  update(info={}){
    if(!this.enabled) return;
    this.text.setText([
      `FPS : ${Math.round(this.scene.game.loop.actualFps)}`,
      `TEMP: ${info.temperature ?? "-"}`,
      `MODE: ${info.mode ?? "-"}`,
      `BGM : ${info.bgm ?? "-"}`,
      `STEAM: ${info.steam ? "ON":"OFF"}`
    ]);
  }
}

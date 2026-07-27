export default class RedLightEffect{
  constructor(scene){
    this.scene=scene;
    this.overlay=scene.add.rectangle(
      scene.scale.width/2,
      scene.scale.height/2,
      scene.scale.width,
      scene.scale.height,
      0xff3030,
      0
    ).setScrollFactor(0).setDepth(1000);
  }

  fadeIn(duration=1000){
    this.scene.tweens.add({
      targets:this.overlay,
      alpha:0.28,
      duration
    });
  }

  fadeOut(duration=1000){
    this.scene.tweens.add({
      targets:this.overlay,
      alpha:0,
      duration
    });
  }

  flash(count=3){
    let i=0;
    const pulse=()=>{
      if(i++>=count) return;
      this.fadeIn(120);
      this.scene.time.delayedCall(120,()=>{
        this.fadeOut(180);
        this.scene.time.delayedCall(220,pulse);
      });
    };
    pulse();
  }
}

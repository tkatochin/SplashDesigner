export default class MADMAXTimeline{
  constructor(scene,effects={}){
    this.scene=scene;
    this.effects=effects;
  }

  play(){
    const e=this.effects;

    e.bgm?.fadeIn?.("madmax",1000);

    this.scene.time.delayedCall(500,()=>e.light?.fadeIn?.());
    this.scene.time.delayedCall(1000,()=>e.steam?.start?.());
    this.scene.time.delayedCall(1500,()=>e.water?.start?.());
    this.scene.time.delayedCall(1800,()=>e.vibra?.start?.());

    this.scene.time.delayedCall(10000,()=>{
      e.water?.stop?.();
      e.vibra?.stop?.();
      e.light?.fadeOut?.();
      e.steam?.stop?.();
      e.bgm?.fadeOut?.("madmax",1500);
      this.scene.events.emit("madmax-finished");
    });
  }
}

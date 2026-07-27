export default class SplashApp{
  constructor({
    scene,
    steam,
    water,
    redLight,
    sound,
    ui,
    settings,
    timeline
  }={}){
    this.scene=scene;
    this.steam=steam;
    this.water=water;
    this.redLight=redLight;
    this.sound=sound;
    this.ui=ui;
    this.settings=settings;
    this.timeline=timeline;
  }

  initialize(){
    this.settings?.load?.();
    this.ui?.setMode?.("READY");
    this.ui?.setTemperature?.(
      this.settings?.get?.("temperature") ?? 90
    );

    this.scene?.events.on("madmax-start",()=>{
      this.ui?.setMode?.("MADMAX");
      this.timeline?.play?.();
    });

    this.scene?.events.on("madmax-finished",()=>{
      this.ui?.setMode?.("READY");
      this.ui?.setStatus?.("SYSTEM OK");
    });
  }
}

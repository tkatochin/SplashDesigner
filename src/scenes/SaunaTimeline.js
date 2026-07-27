export default class SaunaTimeline{
  constructor(effects){
    this.effects=effects;
  }

  start(){
    this.effects.bgm.fadeIn("bgm",1000);

    setTimeout(()=>this.effects.light.fadeIn(),300);
    setTimeout(()=>this.effects.vibra.start(),800);
    setTimeout(()=>this.effects.water.start(),1200);
  }

  stop(){
    this.effects.water.stop();

    setTimeout(()=>this.effects.vibra.stop(),200);
    setTimeout(()=>this.effects.light.fadeOut(),500);
    setTimeout(()=>this.effects.bgm.fadeOut("bgm",1000),700);
  }
}

export default class SoundEffectManager{
  constructor(scene){
    this.scene=scene;
    this.se={};
    this.bgm=null;
  }

  register(name,sound){
    this.se[name]=sound;
  }

  play(name,config={}){
    this.se[name]?.play(config);
  }

  playBGM(sound){
    if(this.bgm===sound) return;
    this.stopBGM();
    this.bgm=sound;
    this.bgm?.play({loop:true,volume:0});
    this.scene.tweens.add({
      targets:this.bgm,
      volume:1,
      duration:1000
    });
  }

  stopBGM(duration=1000){
    if(!this.bgm) return;
    const bgm=this.bgm;
    this.scene.tweens.add({
      targets:bgm,
      volume:0,
      duration,
      onComplete:()=>{
        bgm.stop();
      }
    });
    this.bgm=null;
  }
}

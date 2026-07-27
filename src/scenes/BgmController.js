export default class BgmController {
  constructor(audioManager){
    this.audio=audioManager;
    this.enabled=false;
  }

  play(key="bgm"){
    this.enabled=true;
    if(this.audio?.play){
      this.audio.play(key);
    }
  }

  stop(key="bgm"){
    this.enabled=false;
    if(this.audio?.stop){
      this.audio.stop(key);
    }
  }

  fadeIn(key="bgm",duration=1000){
    this.play(key);
    console.log(`[BGM] fadeIn ${duration}ms`);
  }

  fadeOut(key="bgm",duration=1000){
    console.log(`[BGM] fadeOut ${duration}ms`);
    this.stop(key);
  }

  toggle(key="bgm"){
    this.enabled ? this.fadeOut(key) : this.fadeIn(key);
  }
}

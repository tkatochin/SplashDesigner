const clamp=value=>Math.max(0,Math.min(1,value));
const smooth=value=>{const t=clamp(value);return t*t*(3-2*t);};

/** A held overflow that reuses OverflowRenderer without stacking pulse effects. */
export class MADMAXOverflowEffect {
  constructor(){
    this.active=false;this.holding=false;this.holdElapsed=0;this.releaseElapsed=0;
    this.strength=1.35;this.origin={u:.5,v:.48};
    this.strands=Array.from({length:30},(_,index)=>({
      u:(index+.25+Math.random()*.5)/30,
      width:.55+Math.random()*1.05,
      phase:Math.random()*Math.PI*2
    }));
  }

  update(dt,holding){
    const delta=Math.max(0,Math.min(dt,100));
    if(holding){
      if(!this.holding){this.holding=true;this.releaseElapsed=0;}
      this.active=true;this.holdElapsed+=delta;
      return;
    }
    if(this.holding){this.holding=false;this.releaseElapsed=0;}
    if(!this.active)return;
    this.releaseElapsed+=delta;
    if(this.releaseElapsed>=1250){this.active=false;this.holdElapsed=0;this.releaseElapsed=0;}
  }

  levels(){
    const fade=this.holding?1:1-smooth(this.releaseElapsed/1250);
    const ramp=(start,end)=>smooth((this.holdElapsed-start)/(end-start))*fade*this.strength;
    return{
      surge:ramp(0,180),rim:ramp(120,420),firstFall:ramp(280,650),
      tread:ramp(480,850),secondFall:ramp(700,1080),bottomFlow:ramp(900,1350)
    };
  }
}

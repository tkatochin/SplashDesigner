const clamp=value=>Math.max(0,Math.min(1,value));
const smooth=value=>{const t=clamp(value);return t*t*(3-2*t);};

/** Owns the complete, non-reentrant MADMAX button and waterfall timeline. */
export class MADMAXDevice {
  constructor(){
    this.state="idle";
    this.elapsed=0;
    this.temperatureMode="cold";
  }

  press(){
    if(this.state!=="idle")return false;
    this.state="pressed";this.elapsed=0;
    return true;
  }

  cancelPress(){
    if(this.state!=="pressed")return false;
    this.state="idle";this.elapsed=0;
    return true;
  }

  release(temperatureMode="cold"){
    if(this.state!=="pressed")return false;
    this.temperatureMode=temperatureMode;
    this.state="countdown";this.elapsed=0;
    return true;
  }

  update(dt){
    if(this.state==="idle"||this.state==="pressed")return;
    this.elapsed+=Math.max(0,Math.min(dt,100));
    if(this.elapsed<3000)this.state="countdown";
    else if(this.elapsed<23000)this.state="falling";
    else if(this.elapsed<25000)this.state="overflow-tail";
    else if(this.elapsed<28000)this.state="settling";
    else{this.state="idle";this.elapsed=0;}
  }

  get busy(){return this.state!=="idle";}
  get pressed(){return this.state==="pressed";}
  get falling(){return this.elapsed>=3000&&this.elapsed<23000&&this.state!=="pressed"&&this.state!=="idle";}
  get overflowHolding(){return this.elapsed>=5000&&this.elapsed<25000&&this.state!=="pressed"&&this.state!=="idle";}
  get hot(){return this.temperatureMode==="warm"||this.temperatureMode==="hot";}
  get fallStrength(){
    if(!this.falling)return 0;
    const start=smooth((this.elapsed-3000)/260);
    const end=1-smooth((this.elapsed-22650)/350);
    return start*end;
  }
  get settlingStrength(){return this.elapsed>=23000&&this.elapsed<28000?1-clamp((this.elapsed-23000)/5000):0;}
}

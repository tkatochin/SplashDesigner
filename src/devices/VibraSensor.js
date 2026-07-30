/** Owns the one-shot infrared sensor and its fixed vibra run time. */
export class VibraSensor {
  constructor(durationMs=60000){
    this.durationMs=durationMs;
    this.elapsed=0;
    this.active=false;
  }

  start(){
    if(this.active)return false;
    this.active=true;
    this.elapsed=0;
    return true;
  }

  update(dt){
    if(!this.active)return;
    this.elapsed+=Math.max(0,dt);
    if(this.elapsed>=this.durationMs){
      this.elapsed=this.durationMs;
      this.active=false;
    }
  }

  get progress(){return this.active?Math.min(1,this.elapsed/this.durationMs):0;}
  get spread(){return this.active ? .14+.86*Math.min(1,this.elapsed/3200) : 0;}
}

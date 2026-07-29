const MODES=[
  {id:"cold",base:17.6,steam:0},
  {id:"single",base:9.8,steam:0},
  {id:"warm",base:39.8,steam:.38},
  {id:"hot",base:43.6,steam:.78}
];

/** Owns the bath temperature, display type, and slow real-world fluctuation. */
export class WaterTemperature {
  constructor(){
    this.modeIndex=0;
    this.display="digital";
    this.offset=0;
    this.elapsed=0;
  }

  update(dt){
    this.elapsed+=Math.min(dt,1000);
    if(this.elapsed<20000)return;
    this.elapsed%=20000;
    this.offset=(Math.floor(Math.random()*5)-2)/10;
  }

  cycle(){
    this.modeIndex=(this.modeIndex+1)%MODES.length;
    this.offset=0;
    this.elapsed=0;
  }

  toggleDisplay(){this.display=this.display==="digital"?"analog":"digital";}
  get mode(){return MODES[this.modeIndex];}
  get value(){return Math.round((this.mode.base+this.offset)*10)/10;}
  get steamLevel(){return this.mode.steam;}
}

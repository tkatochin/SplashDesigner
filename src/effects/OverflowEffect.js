const clamp=value=>Math.max(0,Math.min(1,value));
const smooth=value=>{const t=clamp(value);return t*t*(3-2*t);};

/** Owns the reusable timing and stable water-strand pattern for one overflow. */
export class OverflowEffect {
  constructor(){
    this.active=false;
    this.elapsed=0;
    this.duration=7500;
    this.strength=1;
    this.origin={u:.5,v:.5};
    this.strands=[];
  }

  trigger({strength=1,origin={u:.5,v:.5}}={}){
    this.active=true;
    this.elapsed=0;
    this.strength=Math.max(.55,Math.min(1.35,strength));
    this.origin=origin;
    this.strands=Array.from({length:24},(_,index)=>({
      u:(index+.35+Math.random()*.3)/24,
      width:.35+Math.random()*.9,
      phase:Math.random()*Math.PI*2
    }));
    return true;
  }

  update(dt){
    if(!this.active)return;
    this.elapsed+=Math.min(dt,100);
    if(this.elapsed>=this.duration){this.active=false;this.elapsed=0;}
  }

  levels(){
    const t=this.elapsed;
    return{
      surge:this.#pulse(t,0,120,520,900),
      rim:this.#pulse(t,180,430,2700,3450),
      firstFall:this.#pulse(t,350,650,3150,4100),
      tread:this.#pulse(t,580,900,3450,4500),
      secondFall:this.#pulse(t,820,1150,3750,4700),
      bottomFlow:this.#pulse(t,1000,1450,3900,5350),
      floorReach:smooth((t-1000)/1200),
      floorDrain:smooth((t-5000)/2200),
      wet:smooth((t-900)/650)*(1-smooth((t-5000)/2500))
    };
  }

  #pulse(t,start,full,end,empty){
    return smooth((t-start)/(full-start))*(1-smooth((t-end)/(empty-end)))*this.strength;
  }
}

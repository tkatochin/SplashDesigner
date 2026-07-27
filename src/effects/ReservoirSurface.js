export class ReservoirSurface {
  constructor(cols=56,rows=30){
    this.cols=cols;this.rows=rows;
    this.state=new Float32Array(cols*rows);
    this.velocity=new Float32Array(cols*rows);
    this.next=new Float32Array(cols*rows);
    this.seeded=false;
    this.elapsed=0;
  }
  disturb(x,y,power=0.6){
    const cx=Math.floor(x*(this.cols-1));
    const cy=Math.floor(y*(this.rows-1));
    for(let oy=-2;oy<=2;oy++)for(let ox=-2;ox<=2;ox++){
      const px=cx+ox,py=cy+oy;
      if(px>0&&px<this.cols-1&&py>0&&py<this.rows-1){
        this.velocity[py*this.cols+px]+=power*Math.exp(-(ox*ox+oy*oy)*0.45);
      }
    }
  }
  update(dt){
    this.elapsed+=dt;
    if(!this.seeded){this.disturb(.3,.45,.22);this.disturb(.72,.62,-.18);this.seeded=true;}
    if(this.elapsed>900){
      this.elapsed=0;
      const phase=performance.now()*.00023;
      this.disturb(.5+Math.sin(phase)*.34,.25+Math.cos(phase*.73)*.12,.035);
    }
    const steps=Math.min(2,Math.max(1,Math.round(dt/16.7)));
    for(let step=0;step<steps;step++){
      for(let y=1;y<this.rows-1;y++)for(let x=1;x<this.cols-1;x++){
        const i=y*this.cols+x;
        const neighbor=(this.state[i-1]+this.state[i+1]+this.state[i-this.cols]+this.state[i+this.cols])*.25;
        this.velocity[i]+=(neighbor-this.state[i])*.19;
        this.velocity[i]*=.982;
        this.next[i]=(this.state[i]+this.velocity[i])*.996;
      }
      const swap=this.state;this.state=this.next;this.next=swap;
    }
  }
  value(x,y){
    const ix=Math.max(0,Math.min(this.cols-1,Math.floor(x*(this.cols-1))));
    const iy=Math.max(0,Math.min(this.rows-1,Math.floor(y*(this.rows-1))));
    return this.state[iy*this.cols+ix];
  }
}

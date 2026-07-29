/** Procedural steam whose density follows water temperature and splash boosts. */
export class SteamRenderer {
  constructor(){
    this.boost=0;
    this.wisps=Array.from({length:22},(_,index)=>({
      u:(index+.35)/22,
      phase:(index*2.399)%1,
      sway:.55+((index*17)%9)/10,
      size:.7+((index*13)%7)/10
    }));
  }

  update(dt){this.boost=Math.max(0,this.boost-dt/2600);}
  splash(strength=1){this.boost=Math.min(1.25,this.boost+.38*Math.max(.4,strength));}

  render(ctx,g,width,height,baseLevel,time){
    const level=Math.min(1.35,baseLevel+this.boost);
    if(level<=0)return;
    const water=g.water;
    const rise=height*(baseLevel>.6?.25:.19);
    ctx.save();ctx.globalCompositeOperation="screen";
    for(const wisp of this.wisps){
      const cycle=(time*.000055*(.8+wisp.sway)+wisp.phase)%1;
      if(cycle>Math.min(1,level*.92))continue;
      const x=water.backL.x+(water.backR.x-water.backL.x)*wisp.u+Math.sin(time*.0007+wisp.phase*9)*width*.012*wisp.sway;
      const y=water.backL.y-cycle*rise;
      const radius=Math.max(8,width*.018*wisp.size*(.7+cycle*.8));
      const alpha=(1-cycle)*Math.min(.2,.065+level*.09);
      const fog=ctx.createRadialGradient(x,y,0,x,y,radius);
      fog.addColorStop(0,`rgba(245,247,232,${alpha})`);
      fog.addColorStop(.55,`rgba(226,236,224,${alpha*.55})`);
      fog.addColorStop(1,"rgba(220,230,220,0)");
      ctx.fillStyle=fog;ctx.beginPath();ctx.ellipse(x,y,radius,radius*1.65,0,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
}

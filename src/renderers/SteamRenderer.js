/** Procedural steam whose density follows water temperature and splash boosts. */
export class SteamRenderer {
  constructor(){
    this.boost=0;
    this.wisps=Array.from({length:42},()=>({
      u:Math.random(),
      v:.04+Math.random()*.9,
      phase:Math.random(),
      activation:Math.random(),
      speed:.55+Math.random()*.9,
      sway:.35+Math.random()*1.3,
      width:.38+Math.random()*1.55,
      height:.55+Math.random()*1.75,
      opacity:.45+Math.random()*.75,
      rotation:(Math.random()-.5)*.55
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
      if(wisp.activation>Math.min(1,level*.92))continue;
      const cycle=(time*.00005*wisp.speed+wisp.phase)%1;
      const left=this.#mix(water.backL,water.nearL,wisp.v);
      const right=this.#mix(water.backR,water.nearR,wisp.v);
      const sourceX=left.x+(right.x-left.x)*wisp.u;
      const sourceY=left.y;
      const x=sourceX+Math.sin(time*.00065*wisp.speed+wisp.phase*11)*width*.014*wisp.sway;
      const y=sourceY-cycle*rise*(.65+wisp.height*.25);
      const radius=Math.max(7,width*.015*(.65+cycle*.85));
      const life=Math.sin(Math.PI*cycle);
      const alpha=life*Math.min(.22,(.045+level*.085)*wisp.opacity);
      const fog=ctx.createRadialGradient(x,y,0,x,y,radius);
      fog.addColorStop(0,`rgba(245,247,232,${alpha})`);
      fog.addColorStop(.55,`rgba(226,236,224,${alpha*.55})`);
      fog.addColorStop(1,"rgba(220,230,220,0)");
      ctx.fillStyle=fog;ctx.beginPath();
      ctx.ellipse(x,y,radius*wisp.width,radius*wisp.height,wisp.rotation,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  #mix(a,b,t){return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
}

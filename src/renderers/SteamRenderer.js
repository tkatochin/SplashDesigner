/** Procedural steam whose density follows water temperature and splash boosts. */
export class SteamRenderer {
  constructor(){
    this.boost=0;
    this.wisps=Array.from({length:78},()=>{
      const small=Math.random()<.28;
      return{
        u:Math.random(),
        v:.02+Math.random()*.96,
        phase:Math.random(),
        activation:Math.random(),
        speed:.42+Math.random()*1.05,
        sway:.3+Math.random()*1.55,
        width:small?.25+Math.random()*.75:.8+Math.pow(Math.random(),.7)*3.7,
        height:small?.45+Math.random():1.1+Math.pow(Math.random(),.72)*4.4,
        opacity:.72+Math.random()*.9,
        rotation:(Math.random()-.5)*.65
      };
    });
  }

  update(dt){this.boost=Math.max(0,this.boost-dt/2600);}
  splash(strength=1){this.boost=Math.min(1.25,this.boost+.38*Math.max(.4,strength));}

  render(ctx,g,width,height,baseLevel,time){
    const level=Math.min(1.35,baseLevel+this.boost);
    if(level<=0)return;
    const water=g.water;
    const rise=height*(baseLevel>.6?.64:.48);
    ctx.save();ctx.globalCompositeOperation="screen";

    for(const wisp of this.wisps){
      if(wisp.activation>Math.min(1,.22+level*.86))continue;
      const cycle=(time*.00005*wisp.speed+wisp.phase)%1;
      const left=this.#mix(water.backL,water.nearL,wisp.v);
      const right=this.#mix(water.backR,water.nearR,wisp.v);
      const sourceX=left.x+(right.x-left.x)*wisp.u;
      const sourceY=left.y;
      const x=sourceX+Math.sin(time*.00065*wisp.speed+wisp.phase*11)*width*.014*wisp.sway;
      const y=sourceY-cycle*rise*(.72+wisp.height*.08);
      const radius=Math.max(9,width*.028*(.55+cycle*1.45));
      const life=Math.min(1,cycle/.07)*Math.pow(1-cycle,1.35);
      const alpha=life*Math.min(.38,(.08+level*.145)*wisp.opacity);
      const fog=ctx.createRadialGradient(x,y,0,x,y,radius);
      fog.addColorStop(0,`rgba(252,252,243,${alpha})`);
      fog.addColorStop(.5,`rgba(235,241,231,${alpha*.62})`);
      fog.addColorStop(1,"rgba(220,230,220,0)");
      ctx.fillStyle=fog;ctx.beginPath();
      ctx.ellipse(x,y,radius*wisp.width,radius*wisp.height,wisp.rotation,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  #mix(a,b,t){return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
}

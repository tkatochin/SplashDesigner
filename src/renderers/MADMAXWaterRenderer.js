/** Renders the MADMAX water column, unclipped impact spray, foam, and hot steam. */
export class MADMAXWaterRenderer {
  constructor(){
    this.spray=[];this.foam=[];this.spawnElapsed=0;
    this.steamSeeds=Array.from({length:70},()=>({
      phase:Math.random(),x:(Math.random()-.5),speed:.65+Math.random()*1.1,
      sway:.35+Math.random(),size:.6+Math.random()*1.4,opacity:.55+Math.random()*.45
    }));
  }

  update(dt,device){
    const delta=Math.max(0,Math.min(dt,100));
    for(const p of this.spray){p.age+=delta;p.x+=p.vx*delta;p.y+=p.vy*delta;p.vy+=p.gravity*delta;}
    for(const p of this.foam)p.age+=delta;
    this.spray=this.spray.filter(p=>p.age<p.life);
    this.foam=this.foam.filter(p=>p.age<p.life);
    if(!device.falling){this.spawnElapsed=0;return;}
    this.spawnElapsed+=delta;
    let bursts=0;
    while(this.spawnElapsed>=22&&bursts<8){
      this.spawnElapsed-=22;bursts++;
      const strength=device.fallStrength;
      for(let i=0;i<10;i++)this.#spawnSpray(strength);
      for(let i=0;i<7;i++)this.#spawnFoam(strength);
    }
    if(this.spray.length>760)this.spray.splice(0,this.spray.length-760);
    if(this.foam.length>460)this.foam.splice(0,this.foam.length-460);
  }

  impactPoint(g){
    const v=.48,left=this.#mix(g.water.backL,g.water.nearL,v),right=this.#mix(g.water.backR,g.water.nearR,v);
    return this.#mix(left,right,.5);
  }

  renderColumn(ctx,g,width,height,device,time){
    const strength=device.fallStrength;if(strength<=0)return;
    const impact=this.impactPoint(g),baseSide=Math.max(40,Math.min(68,Math.min(width,height)*.11));
    const topWidth=baseSide*.6,bottomWidth=topWidth*1.4;
    const sway=Math.sin(time*.009)*topWidth*.08+Math.sin(time*.021)*topWidth*.035;
    ctx.save();ctx.globalCompositeOperation="screen";
    const water=ctx.createLinearGradient(0,0,0,impact.y);
    water.addColorStop(0,`rgba(206,238,242,${.58*strength})`);
    water.addColorStop(.58,`rgba(122,207,222,${.68*strength})`);
    water.addColorStop(1,`rgba(225,251,250,${.82*strength})`);
    ctx.fillStyle=water;ctx.beginPath();
    ctx.moveTo(width*.5-topWidth*.5+sway,0);ctx.bezierCurveTo(
      width*.5-topWidth*.62-sway*.3,impact.y*.35,width*.5-bottomWidth*.35+sway*.5,impact.y*.72,impact.x-bottomWidth*.5,impact.y
    );
    ctx.lineTo(impact.x+bottomWidth*.5,impact.y);ctx.bezierCurveTo(
      width*.5+bottomWidth*.38+sway*.2,impact.y*.7,width*.5+topWidth*.58-sway*.4,impact.y*.32,width*.5+topWidth*.5+sway,0
    );ctx.closePath();ctx.fill();

    ctx.lineCap="round";
    for(let line=0;line<15;line++){
      const u=(line+.5)/15,phase=line*1.73;
      const x0=width*.5+(u-.5)*topWidth+sway;
      const x1=impact.x+(u-.5)*bottomWidth+Math.sin(time*.014+phase)*bottomWidth*.045;
      ctx.strokeStyle=`rgba(${line%3?"233,255,253":"72,164,187"},${(.18+(line%4)*.055)*strength})`;
      ctx.lineWidth=Math.max(1,topWidth*(.018+(line%5)*.006));ctx.beginPath();
      ctx.moveTo(x0,0);ctx.bezierCurveTo(x0+Math.sin(time*.01+phase)*topWidth*.18,impact.y*.32,x1-Math.cos(time*.012+phase)*bottomWidth*.12,impact.y*.72,x1,impact.y);ctx.stroke();
    }
    ctx.restore();
  }

  renderImpact(ctx,g,width,height,device,time){
    const impact=this.impactPoint(g),strength=Math.max(device.fallStrength,device.settlingStrength*.35);
    if(strength<=0&&!this.spray.length&&!this.foam.length)return;
    ctx.save();ctx.globalCompositeOperation="screen";
    for(const p of this.foam){
      const progress=p.age/p.life,alpha=Math.min(1,progress/.08)*Math.pow(1-progress,1.15)*p.opacity;
      const x=impact.x+p.x*width,y=impact.y+p.y*height;
      const radius=Math.max(2,width*p.size*(.65+progress*.8));
      ctx.fillStyle=`rgba(227,255,252,${alpha})`;ctx.beginPath();ctx.ellipse(x,y,radius*1.35,radius*.55,p.rotation,0,Math.PI*2);ctx.fill();
    }
    for(const p of this.spray){
      const progress=p.age/p.life,alpha=Math.min(1,progress/.06)*Math.pow(1-progress,.7)*p.opacity;
      const x=impact.x+p.x*width,y=impact.y+p.y*height,r=Math.max(1,width*p.size*(1-progress*.25));
      ctx.fillStyle=`rgba(222,252,252,${alpha})`;ctx.beginPath();ctx.ellipse(x,y,r,r*(1.2+p.stretch),p.rotation,0,Math.PI*2);ctx.fill();
    }
    if(strength>0){
      const pulse=.86+.14*Math.sin(time*.026),radius=Math.max(24,width*.052)*(.7+strength*.55)*pulse;
      const burst=ctx.createRadialGradient(impact.x,impact.y,0,impact.x,impact.y,radius);
      burst.addColorStop(0,`rgba(248,255,250,${.92*strength})`);burst.addColorStop(.38,`rgba(192,245,246,${.72*strength})`);burst.addColorStop(1,"rgba(108,214,230,0)");
      ctx.fillStyle=burst;ctx.beginPath();ctx.ellipse(impact.x,impact.y,radius*1.5,radius*.62,0,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
    if(device.hot)this.#renderHotSteam(ctx,impact,width,height,strength,time);
  }

  #renderHotSteam(ctx,impact,width,height,strength,time){
    if(strength<=0)return;
    ctx.save();ctx.globalCompositeOperation="screen";
    // Fivefold local density relative to a single impact plume, without fogging the room.
    for(const seed of this.steamSeeds){
      const cycle=(time*.00013*seed.speed+seed.phase)%1;
      const x=impact.x+seed.x*width*.11+Math.sin(time*.0008+seed.phase*9)*width*.012*seed.sway;
      const y=impact.y-cycle*height*.3;
      const life=Math.min(1,cycle/.08)*Math.pow(1-cycle,1.25);
      const rx=Math.max(10,width*.022*seed.size*(.65+cycle)),ry=rx*(1.5+seed.size*.5);
      const alpha=life*.22*seed.opacity*strength;
      ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);
      const fog=ctx.createRadialGradient(0,0,0,0,0,1);
      fog.addColorStop(0,`rgba(255,252,243,${alpha})`);fog.addColorStop(.5,`rgba(242,245,235,${alpha*.58})`);fog.addColorStop(1,"rgba(228,235,225,0)");
      ctx.fillStyle=fog;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    ctx.restore();
  }

  #spawnSpray(strength){
    const angle=(-Math.PI*.92)+Math.random()*Math.PI*.84;
    const speed=(.00013+Math.random()*.00028)*(.7+strength*.5);
    this.spray.push({x:(Math.random()-.5)*.025,y:(Math.random()-.5)*.008,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
      gravity:.00000055+Math.random()*.0000004,age:0,life:520+Math.random()*950,size:.0015+Math.random()*.004,
      opacity:.55+Math.random()*.45,stretch:Math.random()*1.8,rotation:(Math.random()-.5)*1.2});
  }
  #spawnFoam(strength){
    const angle=Math.random()*Math.PI*2,distance=Math.sqrt(Math.random())*.075*(.7+strength*.5);
    this.foam.push({x:Math.cos(angle)*distance,y:Math.sin(angle)*distance*.22,age:0,life:280+Math.random()*520,
      size:.004+Math.random()*.012,opacity:.62+Math.random()*.38,rotation:(Math.random()-.5)*.55});
  }
  #mix(a,b,t){return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
}

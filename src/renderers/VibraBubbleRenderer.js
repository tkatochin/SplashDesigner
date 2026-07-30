/** Renders irregular surface bubbles emitted by the bath vibra. */
export class VibraBubbleRenderer {
  constructor(){this.particles=[];this.spawnElapsed=0;}

  update(dt,active,spread){
    for(const particle of this.particles)particle.age+=dt;
    this.particles=this.particles.filter(particle=>particle.age<particle.life);
    if(!active){this.spawnElapsed=0;return;}
    this.spawnElapsed+=dt;
    let bursts=0;
    while(this.spawnElapsed>=30&&bursts<8){
      this.spawnElapsed-=30;bursts++;
      const center=this.#burstCenter(spread);
      const count=28+Math.floor(Math.random()*18);
      for(let index=0;index<count;index++)this.#spawn(spread,center,index<5);
    }
  }

  render(ctx,g,width){
    if(!this.particles.length)return;
    const water=g.water;
    ctx.save();
    this.#polygon(ctx,[water.backL,water.backR,water.nearR,water.nearL]);ctx.clip();
    for(const particle of this.particles){
      const point=this.#waterPoint(water,particle.u,particle.v);
      const progress=particle.age/particle.life;
      const appear=Math.min(1,progress/.07);
      const pop=progress<.9?1:Math.max(0,(1-progress)/.1);
      const perspective=.45+particle.v*.75;
      const heave=Math.sin(Math.PI*Math.min(1,progress*1.1));
      const burstScale=progress<.82?1:1+(progress-.82)*1.8;
      const radius=Math.max(1.6,width*particle.size*perspective*(.72+progress*.46)*burstScale);
      const alpha=appear*pop*particle.opacity;
      const y=point.y-radius*.34*heave;
      ctx.beginPath();ctx.ellipse(point.x,y+radius*.24,radius*1.08,radius*.48,particle.rotation,0,Math.PI*2);
      ctx.fillStyle=`rgba(0,68,86,${alpha*.22})`;ctx.fill();
      ctx.beginPath();ctx.ellipse(point.x,y,radius,radius*(.58+particle.roundness*.2),particle.rotation,0,Math.PI*2);
      ctx.fillStyle=`rgba(222,248,244,${alpha*(particle.mound?.76:.58)})`;ctx.fill();
      ctx.strokeStyle=`rgba(247,255,250,${alpha*.92})`;ctx.lineWidth=Math.max(.8,radius*.13);ctx.stroke();
      ctx.beginPath();ctx.ellipse(point.x-radius*.25,y-radius*.16,radius*.19,radius*.11,particle.rotation,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,250,${alpha*.84})`;ctx.fill();
      if(progress>.78){
        const burst=(progress-.78)/.22;
        ctx.beginPath();ctx.ellipse(point.x,y,radius*(1+burst*.55),radius*(.62+burst*.3),particle.rotation,0,Math.PI*2);
        ctx.strokeStyle=`rgba(247,255,250,${alpha*(1-burst)*.75})`;ctx.lineWidth=Math.max(.7,radius*.1);ctx.stroke();
      }
    }
    ctx.restore();
  }

  #burstCenter(spread){
    return{
      u:.5+(Math.random()-.5)*.92*spread,
      v:.5+(Math.random()-.5)*.86*spread
    };
  }
  #spawn(spread,center,mound){
    const jitterAngle=Math.random()*Math.PI*2;
    const jitter=.006+Math.random()*.022;
    this.particles.push({
      u:Math.max(.04,Math.min(.96,center.u+Math.cos(jitterAngle)*jitter)),
      v:Math.max(.08,Math.min(.92,center.v+Math.sin(jitterAngle)*jitter*.62)),
      age:0,life:340+Math.random()*410,
      size:mound?.011+Math.random()*.011:.004+Math.random()*.009,
      opacity:.7+Math.random()*.3,rotation:(Math.random()-.5)*.55,
      roundness:Math.random(),mound
    });
    if(this.particles.length>1000)this.particles.splice(0,this.particles.length-1000);
  }
  #waterPoint(water,u,v){
    const left=this.#mix(water.backL,water.nearL,v),right=this.#mix(water.backR,water.nearR,v);
    return this.#mix(left,right,u);
  }
  #polygon(ctx,points){ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);ctx.closePath();}
  #mix(a,b,t){return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
}

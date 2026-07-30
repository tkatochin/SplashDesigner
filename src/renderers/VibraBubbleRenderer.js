/** Renders irregular surface bubbles emitted by the bath vibra. */
export class VibraBubbleRenderer {
  constructor(){this.particles=[];this.spawnElapsed=0;}

  update(dt,active,spread){
    for(const particle of this.particles)particle.age+=dt;
    this.particles=this.particles.filter(particle=>particle.age<particle.life);
    if(!active){this.spawnElapsed=0;return;}
    this.spawnElapsed+=dt;
    let bursts=0;
    while(this.spawnElapsed>=82&&bursts<5){
      this.spawnElapsed-=82;bursts++;
      const center=this.#burstCenter(spread);
      const count=9+Math.floor(Math.random()*9);
      for(let index=0;index<count;index++)this.#spawn(spread,center,index<2);
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
      const appear=Math.min(1,progress/.12),fade=Math.pow(1-progress,1.45);
      const perspective=.45+particle.v*.75;
      const heave=Math.sin(Math.PI*Math.min(1,progress*1.18));
      const radius=Math.max(1.8,width*particle.size*perspective*(.68+progress*.62));
      const alpha=appear*fade*particle.opacity;
      const y=point.y-radius*.34*heave;
      ctx.beginPath();ctx.ellipse(point.x,y+radius*.24,radius*1.08,radius*.48,particle.rotation,0,Math.PI*2);
      ctx.fillStyle=`rgba(0,68,86,${alpha*.22})`;ctx.fill();
      ctx.beginPath();ctx.ellipse(point.x,y,radius,radius*(.58+particle.roundness*.2),particle.rotation,0,Math.PI*2);
      ctx.fillStyle=`rgba(222,248,244,${alpha*(particle.mound?.76:.58)})`;ctx.fill();
      ctx.strokeStyle=`rgba(247,255,250,${alpha*.92})`;ctx.lineWidth=Math.max(.8,radius*.13);ctx.stroke();
      ctx.beginPath();ctx.ellipse(point.x-radius*.25,y-radius*.16,radius*.19,radius*.11,particle.rotation,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,250,${alpha*.84})`;ctx.fill();
    }
    ctx.restore();
  }

  #burstCenter(spread){
    const angle=Math.random()*Math.PI*2;
    const distance=Math.sqrt(Math.random())*spread*.46;
    return{
      u:Math.max(.06,Math.min(.94,.5+Math.cos(angle)*distance)),
      v:Math.max(.1,Math.min(.9,.53+Math.sin(angle)*distance*.72))
    };
  }
  #spawn(spread,center,mound){
    const jitterAngle=Math.random()*Math.PI*2;
    const jitter=(.008+Math.random()*.026)*(.55+spread*.65);
    this.particles.push({
      u:Math.max(.04,Math.min(.96,center.u+Math.cos(jitterAngle)*jitter)),
      v:Math.max(.08,Math.min(.92,center.v+Math.sin(jitterAngle)*jitter*.62)),
      age:0,life:900+Math.random()*1300,
      size:mound?.013+Math.random()*.012:.005+Math.random()*.011,
      opacity:.58+Math.random()*.4,rotation:(Math.random()-.5)*.55,
      roundness:Math.random(),mound
    });
    if(this.particles.length>320)this.particles.splice(0,this.particles.length-320);
  }
  #waterPoint(water,u,v){
    const left=this.#mix(water.backL,water.nearL,v),right=this.#mix(water.backR,water.nearR,v);
    return this.#mix(left,right,u);
  }
  #polygon(ctx,points){ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);ctx.closePath();}
  #mix(a,b,t){return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
}

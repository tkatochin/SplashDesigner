/** Renders irregular surface bubbles emitted by the bath vibra. */
export class VibraBubbleRenderer {
  constructor(){this.particles=[];this.spawnElapsed=0;}

  update(dt,active,spread){
    for(const particle of this.particles)particle.age+=dt;
    this.particles=this.particles.filter(particle=>particle.age<particle.life);
    if(!active){this.spawnElapsed=0;return;}
    this.spawnElapsed+=dt;
    let bursts=0;
    while(this.spawnElapsed>=110&&bursts<4){
      this.spawnElapsed-=110;bursts++;
      const count=2+Math.floor(Math.random()*4);
      for(let index=0;index<count;index++)this.#spawn(spread);
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
      const radius=Math.max(1.4,width*particle.size*perspective*(.58+progress*.72));
      const alpha=appear*fade*particle.opacity;
      ctx.beginPath();ctx.ellipse(point.x,point.y,radius,radius*.46,particle.rotation,0,Math.PI*2);
      if(particle.filled){ctx.fillStyle=`rgba(231,250,247,${alpha*.48})`;ctx.fill();}
      ctx.strokeStyle=`rgba(238,255,252,${alpha})`;ctx.lineWidth=Math.max(.7,radius*.16);ctx.stroke();
      if(particle.filled){
        ctx.beginPath();ctx.arc(point.x-radius*.24,point.y-radius*.12,Math.max(.5,radius*.16),0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,250,${alpha*.72})`;ctx.fill();
      }
    }
    ctx.restore();
  }

  #spawn(spread){
    const angle=Math.random()*Math.PI*2;
    const distance=Math.sqrt(Math.random())*spread*.48;
    this.particles.push({
      u:Math.max(.04,Math.min(.96,.5+Math.cos(angle)*distance)),
      v:Math.max(.08,Math.min(.92,.53+Math.sin(angle)*distance*.72)),
      age:0,life:620+Math.random()*1150,size:.0035+Math.random()*.0085,
      opacity:.42+Math.random()*.48,rotation:(Math.random()-.5)*.5,filled:Math.random()<.62
    });
    if(this.particles.length>150)this.particles.splice(0,this.particles.length-150);
  }
  #waterPoint(water,u,v){
    const left=this.#mix(water.backL,water.nearL,v),right=this.#mix(water.backR,water.nearR,v);
    return this.#mix(left,right,u);
  }
  #polygon(ctx,points){ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);ctx.closePath();}
  #mix(a,b,t){return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
}

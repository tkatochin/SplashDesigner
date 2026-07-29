/** Draws a round bath thermometer on the back-wall grout line. */
export class ThermometerRenderer {
  geometry(width,height){
    const radius=Math.max(20,Math.min(34,Math.min(width,height)*.055));
    const wallBottom=height*.52;
    const tileHeight=Math.max(38,height*.075);
    const firstGroutAboveFloor=Math.floor((wallBottom-.001)/tileHeight)*tileHeight;
    return{x:width*.5,y:firstGroutAboveFloor,radius};
  }

  hitTest(px,py,width,height){
    const g=this.geometry(width,height);
    return Math.hypot(px-g.x,py-g.y)<=g.radius*1.18;
  }

  render(ctx,width,height,temperature){
    const g=this.geometry(width,height);
    ctx.save();
    ctx.shadowColor="rgba(23,28,27,.42)";ctx.shadowBlur=g.radius*.22;ctx.shadowOffsetY=g.radius*.1;
    ctx.fillStyle="#8b908c";ctx.beginPath();ctx.arc(g.x,g.y,g.radius,0,Math.PI*2);ctx.fill();
    ctx.shadowColor="transparent";
    ctx.fillStyle="#c8cbc3";ctx.beginPath();ctx.arc(g.x,g.y,g.radius*.88,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#111512";ctx.beginPath();ctx.arc(g.x,g.y,g.radius*.75,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="rgba(255,255,232,.42)";ctx.lineWidth=Math.max(1,g.radius*.035);
    ctx.beginPath();ctx.arc(g.x,g.y,g.radius*.7,Math.PI*1.08,Math.PI*1.72);ctx.stroke();
    if(temperature.display==="analog")this.#analog(ctx,g,temperature.value);
    else this.#digital(ctx,g,temperature.value);
    ctx.restore();
  }

  #digital(ctx,g,value){
    ctx.fillStyle="#ffd51f";
    ctx.font=`700 ${g.radius*.56}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText(value.toFixed(1),g.x,g.y+g.radius*.03);
    ctx.fillStyle="rgba(255,213,31,.72)";
    ctx.font=`600 ${g.radius*.19}px sans-serif`;
    ctx.textAlign="right";ctx.fillText("°C",g.x+g.radius*.53,g.y+g.radius*.43);
  }

  #analog(ctx,g,value){
    ctx.save();ctx.translate(g.x,g.y);
    for(let index=0;index<=10;index++){
      const angle=Math.PI*.75+index*Math.PI*1.5/10;
      const inner=g.radius*(index%2? .52:.46),outer=g.radius*.63;
      ctx.strokeStyle=index%2?"rgba(255,213,31,.55)":"#ffd51f";
      ctx.lineWidth=index%2?1:1.7;
      ctx.beginPath();ctx.moveTo(Math.cos(angle)*inner,Math.sin(angle)*inner);
      ctx.lineTo(Math.cos(angle)*outer,Math.sin(angle)*outer);ctx.stroke();
    }
    const angle=Math.PI*.75+Math.max(0,Math.min(50,value))/50*Math.PI*1.5;
    ctx.strokeStyle="#ffd51f";ctx.lineWidth=Math.max(2,g.radius*.07);ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(-Math.cos(angle)*g.radius*.08,-Math.sin(angle)*g.radius*.08);
    ctx.lineTo(Math.cos(angle)*g.radius*.45,Math.sin(angle)*g.radius*.45);ctx.stroke();
    ctx.fillStyle="#ffd51f";ctx.beginPath();ctx.arc(0,0,g.radius*.09,0,Math.PI*2);ctx.fill();
    ctx.font=`700 ${g.radius*.23}px ui-monospace, monospace`;ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText(value.toFixed(1),0,g.radius*.37);
    ctx.restore();
  }
}

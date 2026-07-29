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
    ctx.fillStyle="#ecebe2";ctx.beginPath();ctx.arc(0,0,g.radius*.71,0,Math.PI*2);ctx.fill();

    ctx.lineCap="butt";
    ctx.lineWidth=g.radius*.11;
    ctx.strokeStyle="rgba(45,119,184,.72)";ctx.beginPath();
    ctx.arc(0,0,g.radius*.49,this.#temperatureAngle(15),this.#temperatureAngle(20));ctx.stroke();
    ctx.strokeStyle="rgba(196,48,42,.74)";ctx.beginPath();
    ctx.arc(0,0,g.radius*.49,this.#temperatureAngle(38),this.#temperatureAngle(42));ctx.stroke();

    const ticks=[0,5,10,15,20];
    for(let temperature=22;temperature<=80;temperature+=2)ticks.push(temperature);
    for(const temperature of ticks){
      const angle=this.#temperatureAngle(temperature);
      const major=temperature%10===0;
      const inner=g.radius*(major?.43:.52),outer=g.radius*.63;
      ctx.strokeStyle=major?"#303331":"rgba(48,52,50,.76)";
      ctx.lineWidth=major?Math.max(1.8,g.radius*.065):Math.max(.8,g.radius*.03);
      ctx.beginPath();ctx.moveTo(Math.cos(angle)*inner,Math.sin(angle)*inner);
      ctx.lineTo(Math.cos(angle)*outer,Math.sin(angle)*outer);ctx.stroke();
    }

    ctx.fillStyle="#3b3e3b";ctx.font=`700 ${Math.max(6,g.radius*.19)}px sans-serif`;
    ctx.textAlign="center";ctx.textBaseline="middle";
    for(const temperature of [0,20,40,50,60,70,80]){
      const angle=this.#temperatureAngle(temperature);
      const radius=g.radius*.34;
      ctx.fillText(String(temperature),Math.cos(angle)*radius,Math.sin(angle)*radius);
    }
    ctx.font=`600 ${Math.max(6,g.radius*.18)}px sans-serif`;
    ctx.fillText("°C",0,g.radius*.35);

    const angle=this.#temperatureAngle(value);
    ctx.strokeStyle="#343836";ctx.lineWidth=Math.max(2,g.radius*.075);ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(-Math.cos(angle)*g.radius*.08,-Math.sin(angle)*g.radius*.08);
    ctx.lineTo(Math.cos(angle)*g.radius*.48,Math.sin(angle)*g.radius*.48);ctx.stroke();
    ctx.fillStyle="#4d514e";ctx.beginPath();ctx.arc(0,0,g.radius*.1,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }

  #temperatureAngle(value){
    const clamped=Math.max(0,Math.min(80,value));
    const spans=[.75,.82,.9,1,1.08,1.16,1.23,1.3];
    const total=spans.reduce((sum,span)=>sum+span,0);
    const section=Math.min(7,Math.floor(clamped/10));
    let weighted=0;
    for(let index=0;index<section;index++)weighted+=spans[index];
    weighted+=spans[section]*((clamped-section*10)/10);
    return Math.PI*.75+Math.PI*1.5*(weighted/total);
  }
}

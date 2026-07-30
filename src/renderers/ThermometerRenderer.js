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
    if(temperature.display==="analog")this.#analog(ctx,g,temperature.value);
    else{
      ctx.fillStyle="#c8cbc3";ctx.beginPath();ctx.arc(g.x,g.y,g.radius*.88,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#111512";ctx.beginPath();ctx.arc(g.x,g.y,g.radius*.75,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="rgba(255,255,232,.42)";ctx.lineWidth=Math.max(1,g.radius*.035);
      ctx.beginPath();ctx.arc(g.x,g.y,g.radius*.7,Math.PI*1.08,Math.PI*1.72);ctx.stroke();
      this.#digital(ctx,g,temperature.value);
    }
    ctx.restore();
  }

  #digital(ctx,g,value){
    const fixed=value.toFixed(1).padStart(4," ");
    const digitHeight=g.radius*.48;
    const digitWidth=digitHeight*.53;
    const gap=digitWidth*.22;
    const totalWidth=digitWidth*3+gap*2+digitWidth*.28;
    const left=g.x-totalWidth/2;
    const top=g.y-digitHeight*.5;
    const digits=[fixed[0],fixed[1],fixed[3]];
    const positions=[left,left+digitWidth+gap,left+digitWidth*2+gap*2+digitWidth*.28];
    for(let index=0;index<3;index++)this.#sevenSegmentDigit(ctx,positions[index],top,digitWidth,digitHeight,digits[index]);
    ctx.fillStyle="#ffd51f";
    const decimalSize=digitWidth*.34;
    const decimalX=(positions[1]+digitWidth+positions[2])/2;
    ctx.fillRect(decimalX-decimalSize/2,g.y+digitHeight*.39-decimalSize/2,decimalSize,decimalSize);
    ctx.fillStyle="rgba(255,213,31,.72)";
    ctx.font=`600 ${g.radius*.19}px sans-serif`;
    ctx.textAlign="right";ctx.fillText("°C",g.x+g.radius*.53,g.y+g.radius*.43);
  }

  #sevenSegmentDigit(ctx,x,y,width,height,digit){
    const map={
      0:"abcedf",1:"bc",2:"abged",3:"abgcd",4:"fgbc",
      5:"afgcd",6:"afgecd",7:"abc",8:"abcdefg",9:"abfgcd"
    };
    const active=new Set(map[digit]||"");
    const thickness=width*.18;
    const horizontal=(cx,cy)=>[
      [cx-thickness*.5,cy],[cx,cy-thickness*.5],[cx+width-thickness,cy-thickness*.5],
      [cx+width-thickness*.5,cy],[cx+width-thickness,cy+thickness*.5],[cx,cy+thickness*.5]
    ];
    const vertical=(cx,cy)=>[
      [cx,cy-thickness*.5],[cx+thickness*.5,cy],[cx+thickness*.5,cy+height*.5-thickness],
      [cx,cy+height*.5-thickness*.5],[cx-thickness*.5,cy+height*.5-thickness],[cx-thickness*.5,cy]
    ];
    const segments={
      a:horizontal(x+thickness*.5,y+thickness*.5),
      g:horizontal(x+thickness*.5,y+height*.5),
      d:horizontal(x+thickness*.5,y+height-thickness*.5),
      f:vertical(x+thickness*.5,y+thickness*.5),
      b:vertical(x+width-thickness*.5,y+thickness*.5),
      e:vertical(x+thickness*.5,y+height*.5),
      c:vertical(x+width-thickness*.5,y+height*.5)
    };
    for(const [name,points] of Object.entries(segments)){
      ctx.fillStyle=active.has(name)?"#ffd51f":"rgba(255,213,31,.075)";
      ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
      for(let index=1;index<points.length;index++)ctx.lineTo(points[index][0],points[index][1]);
      ctx.closePath();ctx.fill();
    }
  }

  #analog(ctx,g,value){
    ctx.save();ctx.translate(g.x,g.y);
    ctx.fillStyle="#ecebe2";ctx.beginPath();ctx.arc(0,0,Math.max(1,g.radius-1),0,Math.PI*2);ctx.fill();

    ctx.lineCap="butt";
    ctx.lineWidth=g.radius*.22;
    ctx.strokeStyle="rgba(45,119,184,.72)";ctx.beginPath();
    ctx.arc(0,0,g.radius*.75,this.#temperatureAngle(15),this.#temperatureAngle(20));ctx.stroke();
    ctx.strokeStyle="rgba(196,48,42,.74)";ctx.beginPath();
    ctx.arc(0,0,g.radius*.75,this.#temperatureAngle(38),this.#temperatureAngle(42));ctx.stroke();

    const ticks=[0,5,10,15,20];
    for(let temperature=22;temperature<=80;temperature+=2)ticks.push(temperature);
    for(const temperature of ticks){
      const angle=this.#temperatureAngle(temperature);
      const major=temperature%10===0;
      const inner=g.radius*(major?.64:.75),outer=g.radius*.86;
      ctx.strokeStyle=major?"#272a28":"rgba(113,118,114,.55)";
      ctx.lineWidth=Math.max(.7,g.radius*.026);
      ctx.beginPath();ctx.moveTo(Math.cos(angle)*inner,Math.sin(angle)*inner);
      ctx.lineTo(Math.cos(angle)*outer,Math.sin(angle)*outer);ctx.stroke();
    }

    ctx.fillStyle="rgba(59,62,59,.68)";ctx.font=`600 ${Math.max(3,g.radius*.1)}px sans-serif`;
    ctx.textAlign="center";ctx.textBaseline="middle";
    for(const temperature of [0,20,40,50,60,70,80]){
      const angle=this.#temperatureAngle(temperature);
      const radius=g.radius*.5;
      ctx.fillText(String(temperature),Math.cos(angle)*radius,Math.sin(angle)*radius);
    }
    ctx.font=`600 ${Math.max(4,g.radius*.13)}px sans-serif`;
    ctx.fillText("℃",0,g.radius*.55);

    const angle=this.#temperatureAngle(value);
    ctx.strokeStyle="#343836";ctx.lineWidth=Math.max(2,g.radius*.075);ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(-Math.cos(angle)*g.radius*.08,-Math.sin(angle)*g.radius*.08);
    ctx.lineTo(Math.cos(angle)*g.radius*.69,Math.sin(angle)*g.radius*.69);ctx.stroke();
    ctx.fillStyle="#4d514e";ctx.beginPath();ctx.arc(0,0,g.radius*.1,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }

  #temperatureAngle(value){
    const clamped=Math.max(0,Math.min(80,value));
    // Compass anchors: 0=SSW, 50=NNW, 60=NNE, 80=SSE.
    // Per-10-degree spans grow decisively toward the hot end.
    const start=Math.PI*5/8;
    const spans=[15,21,27,33,39,45,60,75].map(degrees=>degrees*Math.PI/180);
    const section=Math.min(7,Math.floor(clamped/10));
    let angle=start;
    for(let index=0;index<section;index++)angle+=spans[index];
    return angle+spans[section]*((clamped-section*10)/10);
  }
}

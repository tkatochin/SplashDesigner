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

  render(ctx,width,height,temperature,pool){
    const g=this.geometry(width,height);
    ctx.save();
    if(temperature.display==="analog"){
      if(pool)this.#conduit(ctx,g,pool,height);
      ctx.shadowColor="rgba(23,28,27,.42)";ctx.shadowBlur=g.radius*.22;ctx.shadowOffsetY=g.radius*.1;
      ctx.fillStyle="#8b908c";ctx.beginPath();ctx.arc(g.x,g.y,g.radius,0,Math.PI*2);ctx.fill();
      ctx.shadowColor="transparent";
      this.#analog(ctx,g,temperature.value);
    }
    else{
      if(pool)this.#digitalColumn(ctx,g,pool,width,height);
      ctx.fillStyle="#111512";ctx.beginPath();ctx.arc(g.x,g.y,g.radius*.75,0,Math.PI*2);ctx.fill();
      this.#digital(ctx,g,temperature.value);
    }
    ctx.restore();
  }

  #digitalColumn(ctx,g,pool,width,height){
    const bottom=pool.water.backL.y;
    const rimDepth=Math.max(1,pool.water.backL.y-pool.outer.backL.y);
    const rearRadius=g.radius*.88;
    const rearY=g.y-rimDepth*.13;

    // A shallow rear cap and a converging silver band give the column depth
    // without drawing a floating shape outside the one-point perspective.
    const rearCap=ctx.createLinearGradient(g.x-rearRadius,rearY,g.x+rearRadius,rearY);
    rearCap.addColorStop(0,"#7a8582");rearCap.addColorStop(.48,"#eef2ed");rearCap.addColorStop(1,"#8b9692");
    ctx.fillStyle=rearCap;ctx.beginPath();ctx.moveTo(g.x-rearRadius,rearY);
    ctx.arc(g.x,rearY,rearRadius,Math.PI,0);ctx.closePath();ctx.fill();
    const silver=ctx.createLinearGradient(g.x-g.radius,g.y,g.x+g.radius,rearY);
    silver.addColorStop(0,"#bcc6c2");silver.addColorStop(.5,"#f1f4ef");silver.addColorStop(1,"#8a9591");
    ctx.fillStyle=silver;ctx.beginPath();ctx.moveTo(g.x-g.radius,g.y);
    ctx.lineTo(g.x+g.radius,g.y);ctx.lineTo(g.x+rearRadius,rearY);ctx.lineTo(g.x-rearRadius,rearY);ctx.closePath();ctx.fill();
    const innerShadow=ctx.createLinearGradient(g.x,g.y-rearRadius*.8,g.x+rearRadius,rearY);
    innerShadow.addColorStop(0,"rgba(45,52,50,.15)");innerShadow.addColorStop(1,"rgba(45,52,50,.52)");
    ctx.fillStyle=innerShadow;ctx.beginPath();ctx.moveTo(g.x+g.radius*.12,g.y);
    ctx.lineTo(g.x+g.radius,g.y);ctx.lineTo(g.x+rearRadius,rearY);ctx.lineTo(g.x+rearRadius*.52,rearY);ctx.closePath();ctx.fill();

    const rightShadowWidth=Math.max(5,rimDepth*.16);
    const rightShadow=ctx.createLinearGradient(g.x+g.radius,0,g.x+g.radius+rightShadowWidth,0);
    rightShadow.addColorStop(0,"rgba(31,38,37,.48)");rightShadow.addColorStop(.58,"rgba(45,53,51,.2)");rightShadow.addColorStop(1,"rgba(45,53,51,0)");
    ctx.fillStyle=rightShadow;ctx.beginPath();ctx.moveTo(g.x+g.radius,g.y);
    ctx.lineTo(g.x+g.radius+rightShadowWidth,g.y+rimDepth*.08);
    ctx.lineTo(g.x+g.radius+rightShadowWidth,bottom-rimDepth*.12);
    ctx.lineTo(g.x+g.radius,bottom);ctx.closePath();ctx.fill();

    const steel=ctx.createLinearGradient(g.x-g.radius,g.y+g.radius*.7,g.x+g.radius,g.y-g.radius*.7);
    steel.addColorStop(0,"#8b9692");steel.addColorStop(.22,"#e1e8e2");
    steel.addColorStop(.48,"#a0aba7");steel.addColorStop(.72,"#f0f3ed");steel.addColorStop(1,"#7a8581");
    ctx.fillStyle=steel;ctx.beginPath();ctx.moveTo(g.x-g.radius,bottom);ctx.lineTo(g.x-g.radius,g.y);
    ctx.arc(g.x,g.y,g.radius,Math.PI,0);ctx.lineTo(g.x+g.radius,bottom);ctx.closePath();ctx.fill();
    ctx.strokeStyle="rgba(39,47,46,.62)";ctx.lineWidth=Math.max(1,width*.0013);ctx.stroke();
    ctx.strokeStyle="#e1ebe1";ctx.lineWidth=Math.max(1,width*.0015);
    ctx.beginPath();ctx.moveTo(g.x-g.radius,bottom);ctx.lineTo(g.x-g.radius,g.y);ctx.stroke();

    ctx.strokeStyle="#edf2ec";ctx.lineWidth=Math.max(1,width*.0011);
    ctx.beginPath();ctx.moveTo(g.x-g.radius,g.y);ctx.lineTo(g.x-rearRadius,rearY);
    ctx.moveTo(g.x+g.radius,g.y);ctx.lineTo(g.x+rearRadius,rearY);ctx.stroke();

    const recess=ctx.createRadialGradient(g.x-g.radius*.12,g.y-g.radius*.12,g.radius*.35,g.x,g.y,g.radius*.8);
    recess.addColorStop(0,"#4f5957");recess.addColorStop(.82,"#202625");recess.addColorStop(1,"#0f1312");
    ctx.fillStyle=recess;ctx.beginPath();ctx.arc(g.x,g.y,g.radius*.79,0,Math.PI*2);ctx.fill();
  }

  #conduit(ctx,g,pool,height){
    const waterY=pool.water.backL.y;
    const rimBackY=pool.outer.backL.y;
    const endY=Math.min(pool.water.nearL.y,waterY+height*.075);
    const p0={x:g.x,y:g.y+g.radius*.92};
    const p1={x:g.x-g.radius*.16,y:g.y+g.radius*1.45};
    const p2={x:g.x+g.radius*.28,y:rimBackY-g.radius*.22};
    const p3={x:g.x+g.radius*.16,y:waterY+g.radius*.1};
    const p4={x:g.x+g.radius*.12,y:waterY+g.radius*.42};
    const p5={x:g.x+g.radius*.12,y:endY-g.radius*.25};
    const p6={x:g.x+g.radius*.12,y:endY};
    const points=[];
    for(let index=0;index<=14;index++)points.push(this.#cubic(p0,p1,p2,p3,index/14));
    for(let index=1;index<=10;index++)points.push(this.#cubic(p3,p4,p5,p6,index/10));
    const submerged=points.findIndex(point=>point.y>=waterY);
    const visibleEnd=submerged<0?points.length-1:Math.max(0,submerged);
    const path=new Path2D();path.moveTo(points[0].x,points[0].y);
    for(let index=1;index<=visibleEnd;index++)path.lineTo(points[index].x,points[index].y);
    const pipeWidth=Math.max(5,g.radius*.18);
    ctx.save();ctx.lineCap="round";ctx.lineJoin="round";
    ctx.strokeStyle="rgba(29,36,36,.72)";ctx.lineWidth=pipeWidth*1.55;ctx.stroke(path);
    ctx.strokeStyle="#9da8a6";ctx.lineWidth=pipeWidth;ctx.stroke(path);
    ctx.strokeStyle="rgba(244,250,244,.72)";ctx.lineWidth=Math.max(1,pipeWidth*.2);ctx.stroke(path);
    for(let index=2;index<Math.max(2,visibleEnd-1);index+=2){
      const before=points[index-1],after=points[index+1],point=points[index];
      const length=Math.max(.001,Math.hypot(after.x-before.x,after.y-before.y));
      const nx=-(after.y-before.y)/length,ny=(after.x-before.x)/length;
      ctx.strokeStyle="rgba(50,59,58,.72)";ctx.lineWidth=Math.max(1,pipeWidth*.18);
      ctx.beginPath();ctx.moveTo(point.x-nx*pipeWidth*.62,point.y-ny*pipeWidth*.62);
      ctx.lineTo(point.x+nx*pipeWidth*.62,point.y+ny*pipeWidth*.62);ctx.stroke();
    }
    if(submerged>=0){
      for(let index=submerged;index<points.length-1;index++){
        const a=points[index],b=points[index+1],t=(index-submerged)/Math.max(1,points.length-1-submerged);
        const alpha=.48*(1-t);
        ctx.strokeStyle=`rgba(32,104,121,${alpha*.8})`;ctx.lineWidth=pipeWidth*1.42;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        ctx.strokeStyle=`rgba(201,219,211,${alpha})`;ctx.lineWidth=pipeWidth*.8;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
    }
    ctx.restore();
  }

  #cubic(a,b,c,d,t){
    const u=1-t,aa=u*u*u,bb=3*u*u*t,cc=3*u*t*t,dd=t*t*t;
    return{x:a.x*aa+b.x*bb+c.x*cc+d.x*dd,y:a.y*aa+b.y*bb+c.y*cc+d.y*dd};
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

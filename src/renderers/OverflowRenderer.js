/** Draws water differently on horizontal stone, vertical risers, and the floor. */
export class OverflowRenderer {
  render(ctx,geometry,width,height,effect,time){
    if(!effect.active)return;
    const levels=effect.levels();
    ctx.save();
    this.#rimFilm(ctx,geometry,levels.rim);
    this.#horizontalFlow(ctx,0,geometry.steps.treadTop,width,geometry.steps.riser2Top-geometry.steps.treadTop,levels.tread,.34);
    this.#cascade(ctx,0,geometry.steps.top,width,geometry.steps.treadTop-geometry.steps.top,levels.firstFall,effect,time);
    this.#cascade(ctx,0,geometry.steps.riser2Top,width,geometry.steps.floorTop-geometry.steps.riser2Top,levels.secondFall,effect,time);
    this.#wetFloor(ctx,width,height,geometry.steps.floorTop,levels,effect,time);
    ctx.restore();
  }

  #rimFilm(ctx,g,amount){
    if(amount<=0)return;
    const {water:w,sideWalls:s}=g;
    const wallRightNear=this.#pointAtY(s.rightCorner,s.rightNear,w.nearR.y);
    const drainOuterNear=this.#pointAtY(s.leftCorner,s.leftNear,w.nearL.y);
    const gradient=ctx.createLinearGradient(0,w.backL.y,0,w.nearL.y);
    gradient.addColorStop(0,`rgba(178,242,250,${Math.min(.58,amount*.46)})`);
    gradient.addColorStop(.45,`rgba(39,181,214,${Math.min(.62,amount*.5)})`);
    gradient.addColorStop(1,`rgba(4,107,157,${Math.min(.54,amount*.42)})`);
    ctx.fillStyle=gradient;
    // One seven-corner sheet covers the bath and both surrounding sides once.
    // The upper-left notch wraps around the pillar; its back corner is the
    // lower-right corner of the pillar's side face, not the grate's back edge.
    ctx.beginPath();
    ctx.moveTo(0,g.leftOpening.sillLeftY);
    ctx.lineTo(g.leftOpening.pillarLeft,w.backL.y);
    ctx.lineTo(g.leftOpening.pillarRight,w.backL.y);
    ctx.lineTo(g.leftOpening.backRight,g.wallBottom);
    ctx.lineTo(s.rightCorner.x,g.wallBottom);
    ctx.lineTo(wallRightNear.x,w.nearL.y);
    ctx.lineTo(drainOuterNear.x,w.nearL.y);
    ctx.closePath();ctx.fill();

    // A continuous foamy lip makes it clear that water reaches every side,
    // rather than leaving the side rims looking only partially wet.
    ctx.lineJoin="round";ctx.lineCap="round";
    ctx.strokeStyle=`rgba(215,251,255,${Math.min(.82,amount*.7)})`;
    ctx.lineWidth=3.2;
    ctx.beginPath();
    ctx.moveTo(w.backL.x,w.backL.y);ctx.lineTo(w.backR.x,w.backR.y);
    ctx.lineTo(w.nearR.x,w.nearR.y);ctx.lineTo(w.nearL.x,w.nearL.y);ctx.closePath();ctx.stroke();
  }

  #cascade(ctx,x,y,width,height,amount,effect,time){
    if(amount<=0)return;
    const gradient=ctx.createLinearGradient(0,y,0,y+height);
    gradient.addColorStop(0,`rgba(102,222,244,${Math.min(.68,amount*.52)})`);
    gradient.addColorStop(.72,`rgba(12,139,190,${Math.min(.58,amount*.42)})`);
    gradient.addColorStop(1,`rgba(218,251,255,${Math.min(.5,amount*.38)})`);
    ctx.fillStyle=gradient;ctx.fillRect(x,y,width,height);
    ctx.lineCap="round";
    for(const strand of effect.strands){
      const sway=Math.sin(time*.006+strand.phase)*width*.004;
      const sx=x+strand.u*width+sway;
      ctx.strokeStyle=`rgba(225,252,255,${Math.min(.72,amount*(.28+strand.width*.24))})`;
      ctx.lineWidth=Math.max(1,width*.0024*strand.width);
      ctx.beginPath();ctx.moveTo(sx,y);ctx.bezierCurveTo(sx+sway*.3,y+height*.35,sx-sway*.4,y+height*.72,sx+sway*.2,y+height);ctx.stroke();
    }
  }

  #horizontalFlow(ctx,x,y,width,height,amount,opacity){
    if(amount<=0)return;
    const gradient=ctx.createLinearGradient(0,y,0,y+height);
    gradient.addColorStop(0,`rgba(105,220,239,${Math.min(opacity,amount*opacity)})`);
    gradient.addColorStop(.7,`rgba(20,146,188,${Math.min(opacity*.72,amount*opacity*.65)})`);
    gradient.addColorStop(1,"rgba(12,109,157,0)");
    ctx.fillStyle=gradient;ctx.fillRect(x,y,width,height);
  }

  #wetFloor(ctx,width,height,floorTop,levels,effect,time){
    if(levels.wet<=0||levels.floorReach<=0)return;
    const depth=Math.max(1,height-floorTop);
    const frontY=floorTop+depth*levels.floorReach;
    const rearY=floorTop+depth*.88*levels.floorDrain;
    if(rearY>=frontY)return;
    const wave=Math.min(depth*.08,4);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0,rearY);ctx.lineTo(width,rearY);ctx.lineTo(width,frontY);
    ctx.bezierCurveTo(width*.78,frontY+wave,width*.62,frontY-wave,width*.5,frontY);
    ctx.bezierCurveTo(width*.36,frontY+wave,width*.18,frontY-wave,0,frontY);
    ctx.closePath();ctx.clip();

    const film=ctx.createLinearGradient(0,rearY,0,Math.max(rearY+1,frontY));
    film.addColorStop(0,`rgba(93,202,224,${Math.min(.38,levels.wet*.31)})`);
    film.addColorStop(.7,`rgba(31,137,171,${Math.min(.3,levels.wet*.23)})`);
    film.addColorStop(1,`rgba(17,100,132,${Math.min(.18,levels.wet*.13)})`);
    ctx.fillStyle=film;ctx.fillRect(0,rearY,width,frontY-rearY+wave);

    ctx.lineCap="round";
    for(let index=0;index<12;index++){
      const strand=effect.strands[(index*2)%effect.strands.length];
      const x=(index+.45)*width/12;
      const sway=Math.sin(time*.004+strand.phase)*width*.006;
      ctx.strokeStyle=`rgba(191,237,242,${Math.min(.24,levels.wet*(.08+strand.width*.08))})`;
      ctx.lineWidth=Math.max(.8,width*.0012*strand.width);
      ctx.beginPath();ctx.moveTo(x,rearY);ctx.bezierCurveTo(x+sway,frontY*.35+rearY*.65,x-sway,frontY*.72+rearY*.28,x+sway*.35,frontY);ctx.stroke();
    }
    ctx.restore();
  }

  #quad(ctx,a,b,c,d){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();}
  #pointAtY(a,b,y){const t=(y-a.y)/(b.y-a.y);return{x:a.x+(b.x-a.x)*t,y};}
}

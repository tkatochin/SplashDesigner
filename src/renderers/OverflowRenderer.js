/** Draws water differently on horizontal stone, vertical risers, and the floor. */
export class OverflowRenderer {
  render(ctx,geometry,width,height,effect,time){
    if(!effect.active)return;
    const levels=effect.levels();
    ctx.save();
    this.#rimFilm(ctx,geometry,levels.rim);
    this.#horizontalFlow(ctx,0,geometry.steps.treadTop,width,geometry.steps.riser2Top-geometry.steps.treadTop,levels.tread,.34);
    this.#cascade(ctx,0,geometry.steps.top,width,geometry.steps.treadTop-geometry.steps.top,levels.firstFall,effect,time);
    this.#horizontalFlow(ctx,0,geometry.steps.floorTop,width,height-geometry.steps.floorTop,levels.bottomFlow,.48);
    this.#cascade(ctx,0,geometry.steps.riser2Top,width,geometry.steps.floorTop-geometry.steps.riser2Top,levels.secondFall,effect,time);
    this.#wetFloor(ctx,width,height,geometry.steps.floorTop,levels.wet,effect.origin.u);
    ctx.restore();
  }

  #rimFilm(ctx,g,amount){
    if(amount<=0)return;
    const {outer:o,water:w}=g;
    ctx.fillStyle=`rgba(69,196,224,${Math.min(.42,amount*.3)})`;
    this.#quad(ctx,o.backL,o.backR,w.backR,w.backL);ctx.fill();
    this.#quad(ctx,o.backL,w.backL,w.nearL,o.nearL);ctx.fill();
    this.#quad(ctx,w.backR,o.backR,o.nearR,w.nearR);ctx.fill();
    const gradient=ctx.createLinearGradient(0,w.nearL.y,0,o.nearL.y);
    gradient.addColorStop(0,`rgba(174,244,255,${Math.min(.64,amount*.5)})`);
    gradient.addColorStop(.25,`rgba(26,170,210,${Math.min(.58,amount*.42)})`);
    gradient.addColorStop(1,`rgba(3,103,151,${Math.min(.4,amount*.28)})`);
    ctx.fillStyle=gradient;this.#quad(ctx,w.nearL,w.nearR,o.nearR,o.nearL);ctx.fill();
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

  #wetFloor(ctx,width,height,floorTop,amount,originU){
    if(amount<=0)return;
    const centerX=width*(.35+originU*.3);
    const gradient=ctx.createRadialGradient(centerX,floorTop,width*.04,centerX,floorTop,width*.72);
    gradient.addColorStop(0,`rgba(52,157,187,${Math.min(.34,amount*.28)})`);
    gradient.addColorStop(.62,`rgba(31,109,132,${Math.min(.24,amount*.18)})`);
    gradient.addColorStop(1,"rgba(18,75,91,0)");
    ctx.fillStyle=gradient;ctx.fillRect(0,floorTop,width,height-floorTop);
    ctx.strokeStyle=`rgba(206,242,244,${Math.min(.25,amount*.2)})`;
    ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(width*.16,floorTop+2);ctx.quadraticCurveTo(centerX,height*.965,width*.84,height*.985);ctx.stroke();
  }

  #quad(ctx,a,b,c,d){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();}
}

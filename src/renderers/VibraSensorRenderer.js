/** Draws the sloped infrared sensor block on the right side of the back rim. */
export class VibraSensorRenderer {
  geometry(g,width,height){
    const center=.83,half=.07;
    const baseFrontL=this.#mix(g.water.backL,g.water.backR,center-half);
    const baseFrontR=this.#mix(g.water.backL,g.water.backR,center+half);
    const baseBackL=this.#projectToY(baseFrontL,g.vanishing,g.outer.backL.y);
    const baseBackR=this.#projectToY(baseFrontR,g.vanishing,g.outer.backR.y);
    const leftDepth=Math.hypot(baseFrontL.x-baseBackL.x,baseFrontL.y-baseBackL.y);
    const rightDepth=Math.hypot(baseFrontR.x-baseBackR.x,baseFrontR.y-baseBackR.y);
    const blockHeight=(leftDepth+rightDepth)*.5;
    const frontDepth=baseFrontL.y-g.vanishing.y;
    const liftAtDepth=point=>({
      x:point.x,
      y:point.y-blockHeight*(point.y-g.vanishing.y)/frontDepth
    });
    const topBackL=liftAtDepth(baseBackL),topBackR=liftAtDepth(baseBackR);
    const breakY=baseBackL.y+(baseFrontL.y-baseBackL.y)*.4;
    const breakBaseL=this.#projectToY(baseFrontL,g.vanishing,breakY);
    const breakBaseR=this.#projectToY(baseFrontR,g.vanishing,breakY);
    const topBreakL=liftAtDepth(breakBaseL),topBreakR=liftAtDepth(breakBaseR);
    const topFrontL={x:baseFrontL.x,y:baseFrontL.y-blockHeight*.4};
    const topFrontR={x:baseFrontR.x,y:baseFrontR.y-blockHeight*.4};
    const slope=[topBreakL,topBreakR,topFrontR,topFrontL];
    const plate=this.#insetOnSlope(slope,.17,.17,.18,.16);
    // Preserve the sensor center while rotating the former horizontal slot.
    const slit=this.#insetOnSlope(plate,.44,.10,.44,.08);
    const columnBackL={x:plate[0].x,y:breakY};
    const columnBackR={x:plate[1].x,y:breakY};
    const columnFrontR={x:plate[2].x,y:baseFrontR.y};
    const columnFrontL={x:plate[3].x,y:baseFrontL.y};
    return{
      baseBackL,baseBackR,baseFrontL,baseFrontR,
      topBackL,topBackR,topBreakL,topBreakR,topFrontL,topFrontR,
      slope,plate,slit,columnBackL,columnBackR,columnFrontR,columnFrontL,width,height
    };
  }

  hitTest(x,y,g,width,height){return this.#inside({x,y},this.geometry(g,width,height).plate);}

  render(ctx,g,width,height,active,time){
    const s=this.geometry(g,width,height);
    ctx.save();ctx.lineJoin="round";

    const leftSteel=ctx.createLinearGradient(s.plate[0].x,0,s.plate[3].x,0);
    leftSteel.addColorStop(0,"#cbd2cf");leftSteel.addColorStop(1,"#848e8b");
    ctx.fillStyle=leftSteel;
    this.#polygon(ctx,[s.plate[0],s.plate[3],s.columnFrontL,s.columnBackL]);ctx.fill();
    const rightFace=ctx.createLinearGradient(s.plate[1].x,0,s.columnFrontR.x+width*.03,0);
    rightFace.addColorStop(0,"#505b58");rightFace.addColorStop(.72,"#707a76");rightFace.addColorStop(1,"rgba(54,63,60,0)");
    ctx.fillStyle=rightFace;
    this.#polygon(ctx,[s.plate[1],s.columnBackR,s.columnFrontR,s.plate[2]]);ctx.fill();
    const frontSteel=ctx.createLinearGradient(s.columnFrontL.x,0,s.columnFrontR.x,0);
    frontSteel.addColorStop(0,"#aeb8b5");frontSteel.addColorStop(.34,"#747f7c");
    frontSteel.addColorStop(.72,"#c6ceca");frontSteel.addColorStop(1,"#68726f");
    ctx.fillStyle=frontSteel;
    this.#polygon(ctx,[s.plate[3],s.plate[2],s.columnFrontR,s.columnFrontL]);ctx.fill();
    // Do not outline the lower/right base edges: those perspective lines would
    // make the opaque front face look transparent.
    ctx.strokeStyle="rgba(32,40,39,.42)";ctx.lineWidth=Math.max(1,width*.0012);
    ctx.beginPath();ctx.moveTo(s.plate[0].x,s.plate[0].y);ctx.lineTo(s.columnBackL.x,s.columnBackL.y);
    ctx.moveTo(s.plate[1].x,s.plate[1].y);ctx.lineTo(s.columnBackR.x,s.columnBackR.y);ctx.stroke();

    const steel=ctx.createLinearGradient(s.plate[0].x,s.plate[0].y,s.plate[2].x,s.plate[2].y);
    steel.addColorStop(0,"#d8ddda");steel.addColorStop(.42,"#8e9998");steel.addColorStop(.72,"#e3e7e2");steel.addColorStop(1,"#737e7d");
    ctx.fillStyle=steel;this.#polygon(ctx,s.plate);ctx.fill();
    // Let each panel edge inherit the adjacent column face instead of using
    // one uniform gray outline that visually disconnects the two pieces.
    ctx.lineWidth=Math.max(1,width*.0015);ctx.lineCap="round";
    ctx.strokeStyle="#f0f4ee";ctx.beginPath();ctx.moveTo(s.plate[0].x,s.plate[0].y);ctx.lineTo(s.plate[3].x,s.plate[3].y);ctx.stroke();
    ctx.strokeStyle="#58635f";ctx.beginPath();ctx.moveTo(s.plate[1].x,s.plate[1].y);ctx.lineTo(s.plate[2].x,s.plate[2].y);ctx.stroke();
    ctx.strokeStyle="#b7c0bb";ctx.beginPath();ctx.moveTo(s.plate[0].x,s.plate[0].y);ctx.lineTo(s.plate[1].x,s.plate[1].y);ctx.stroke();
    ctx.strokeStyle="#65706b";ctx.beginPath();ctx.moveTo(s.plate[3].x,s.plate[3].y);ctx.lineTo(s.plate[2].x,s.plate[2].y);ctx.stroke();

    ctx.fillStyle="#171b1a";this.#polygon(ctx,s.slit);ctx.fill();
    if(!active&&Math.floor(time/320)%2===0){
      ctx.save();ctx.shadowColor="#ff1e18";ctx.shadowBlur=Math.max(5,width*.009);
      ctx.fillStyle="#ff261e";this.#polygon(ctx,this.#lowerLed(s.slit));ctx.fill();ctx.restore();
    }
    ctx.restore();
  }

  #insetOnSlope(quad,left,top,right,bottom){
    const upperL=this.#mix(quad[0],quad[1],left),upperR=this.#mix(quad[0],quad[1],1-right);
    const lowerL=this.#mix(quad[3],quad[2],left),lowerR=this.#mix(quad[3],quad[2],1-right);
    return[
      this.#mix(upperL,lowerL,top),this.#mix(upperR,lowerR,top),
      this.#mix(upperR,lowerR,1-bottom),this.#mix(upperL,lowerL,1-bottom)
    ];
  }
  #lowerLed(quad){
    const topL=this.#mix(quad[0],quad[3],1/3),topR=this.#mix(quad[1],quad[2],1/3);
    return[
      this.#mix(topL,topR,.12),this.#mix(topL,topR,.88),
      this.#mix(quad[3],quad[2],.88),this.#mix(quad[3],quad[2],.12)
    ];
  }
  #polygon(ctx,points){ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);ctx.closePath();}
  #inside(point,polygon){
    let inside=false;
    for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
      const a=polygon[i],b=polygon[j];
      if(((a.y>point.y)!==(b.y>point.y))&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
    }
    return inside;
  }
  #projectToY(point,vanishing,y){
    const ratio=(y-vanishing.y)/(point.y-vanishing.y);
    return{x:vanishing.x+(point.x-vanishing.x)*ratio,y};
  }
  #mix(a,b,t){return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
}

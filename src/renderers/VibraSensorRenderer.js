/** Draws the sloped infrared sensor block on the right side of the back rim. */
export class VibraSensorRenderer {
  geometry(g,width,height){
    const center=.83,half=.07;
    const baseFrontL=this.#mix(g.water.backL,g.water.backR,center-half);
    const baseFrontR=this.#mix(g.water.backL,g.water.backR,center+half);
    const baseBackL=this.#projectToY(baseFrontL,g.vanishing,g.outer.backL.y);
    const baseBackR=this.#projectToY(baseFrontR,g.vanishing,g.outer.backR.y);
    const blockHeight=Math.max(8,height*.023);
    const frontDepth=baseFrontL.y-g.vanishing.y;
    const liftAtDepth=point=>({
      x:point.x,
      y:point.y-blockHeight*(point.y-g.vanishing.y)/frontDepth
    });
    const topBackL=liftAtDepth(baseBackL),topBackR=liftAtDepth(baseBackR);
    const breakY=baseBackL.y+(baseFrontL.y-baseBackL.y)*.33;
    const breakBaseL=this.#projectToY(baseFrontL,g.vanishing,breakY);
    const breakBaseR=this.#projectToY(baseFrontR,g.vanishing,breakY);
    const topBreakL=liftAtDepth(breakBaseL),topBreakR=liftAtDepth(breakBaseR);
    const topFrontL={x:baseFrontL.x,y:baseFrontL.y-blockHeight*.12};
    const topFrontR={x:baseFrontR.x,y:baseFrontR.y-blockHeight*.12};
    const slope=[topBreakL,topBreakR,topFrontR,topFrontL];
    const plate=this.#insetOnSlope(slope,.17,.17,.18,.16);
    const slit=this.#insetOnSlope(plate,.13,.40,.13,.38);
    return{
      baseBackL,baseBackR,baseFrontL,baseFrontR,
      topBackL,topBackR,topBreakL,topBreakR,topFrontL,topFrontR,
      slope,plate,slit,width,height
    };
  }

  hitTest(x,y,g,width,height){return this.#inside({x,y},this.geometry(g,width,height).plate);}

  render(ctx,g,width,height,active,time){
    const s=this.geometry(g,width,height);
    ctx.save();ctx.lineJoin="round";

    const stone=ctx.createLinearGradient(s.baseBackL.x,0,s.baseFrontR.x,0);
    stone.addColorStop(0,"#777b74");stone.addColorStop(.48,"#4a504d");stone.addColorStop(1,"#656963");
    ctx.fillStyle=stone;
    this.#polygon(ctx,[s.topFrontL,s.topFrontR,s.baseFrontR,s.baseFrontL]);ctx.fill();
    ctx.fillStyle="#5c615c";
    this.#polygon(ctx,[s.topBackL,s.topBreakL,s.topFrontL,s.baseFrontL,s.baseBackL]);ctx.fill();
    ctx.fillStyle="#454b47";
    this.#polygon(ctx,[s.topBreakR,s.topBackR,s.baseBackR,s.baseFrontR,s.topFrontR]);ctx.fill();

    const flat=ctx.createLinearGradient(0,s.topBackL.y,0,s.topBreakL.y);
    flat.addColorStop(0,"#7a7e77");flat.addColorStop(1,"#555b57");
    ctx.fillStyle=flat;this.#polygon(ctx,[s.topBackL,s.topBackR,s.topBreakR,s.topBreakL]);ctx.fill();
    const slope=ctx.createLinearGradient(0,s.topBreakL.y,0,s.topFrontL.y);
    slope.addColorStop(0,"#6d726c");slope.addColorStop(1,"#484e4a");
    ctx.fillStyle=slope;this.#polygon(ctx,s.slope);ctx.fill();
    ctx.strokeStyle="rgba(5,8,7,.78)";ctx.lineWidth=Math.max(1,width*.0012);ctx.stroke();

    const steel=ctx.createLinearGradient(s.plate[0].x,s.plate[0].y,s.plate[2].x,s.plate[2].y);
    steel.addColorStop(0,"#d8ddda");steel.addColorStop(.42,"#8e9998");steel.addColorStop(.72,"#e3e7e2");steel.addColorStop(1,"#737e7d");
    ctx.fillStyle=steel;this.#polygon(ctx,s.plate);ctx.fill();
    ctx.strokeStyle="rgba(25,32,31,.72)";ctx.lineWidth=Math.max(1,width*.0015);ctx.stroke();

    ctx.fillStyle="#171b1a";this.#polygon(ctx,s.slit);ctx.fill();
    if(!active&&Math.floor(time/320)%2===0){
      ctx.save();ctx.shadowColor="#ff1e18";ctx.shadowBlur=Math.max(5,width*.009);
      ctx.fillStyle="#ff261e";this.#polygon(ctx,this.#insetOnSlope(s.slit,.07,.14,.07,.14));ctx.fill();ctx.restore();
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

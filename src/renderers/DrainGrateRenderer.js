/** Draws the slatted drain beside the bath and its water-swallowing gaps. */
export class DrainGrateRenderer {
  renderBase(ctx,g){
    const shape=this.#shape(g);
    ctx.save();
    ctx.fillStyle="#171b1b";this.#quad(ctx,...shape.corners);ctx.fill();
    const light=ctx.createLinearGradient(shape.outerBack.x,shape.outerBack.y,shape.innerNear.x,shape.innerNear.y);
    light.addColorStop(0,"#eee9d9");light.addColorStop(.55,"#d6d4c9");light.addColorStop(1,"#b8bcb7");
    ctx.fillStyle=light;
    for(const band of this.#bands(shape,30,.68)){
      this.#quad(ctx,...band);ctx.fill();
    }
    ctx.strokeStyle="rgba(255,252,226,.45)";ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(shape.innerBack.x,shape.innerBack.y);ctx.lineTo(shape.innerNear.x,shape.innerNear.y);ctx.stroke();
    ctx.restore();
  }

  renderOpenings(ctx,g,amount){
    if(amount<=0)return;
    const shape=this.#shape(g);
    ctx.save();
    const darkness=Math.min(.92,.58+amount*.25);
    ctx.fillStyle=`rgba(4,10,11,${darkness})`;
    for(const gap of this.#gaps(shape,30,.68)){
      this.#quad(ctx,...gap);ctx.fill();
    }
    ctx.restore();
  }

  #shape(g){
    const backY=g.water.backL.y;
    const outerBack=this.#pointAtY(g.sideWalls.leftCorner,g.sideWalls.leftNear,backY);
    const rimBack=this.#pointAtY(g.outer.backL,g.outer.nearL,backY);
    const innerBack=this.#mix(rimBack,g.water.backL,.72);
    const nearY=g.water.nearL.y;
    const outerNear=this.#pointAtY(g.sideWalls.leftCorner,g.sideWalls.leftNear,nearY);
    const rimNear=this.#pointAtY(g.outer.backL,g.outer.nearL,nearY);
    const innerNear=this.#mix(rimNear,g.water.nearL,.72);
    return {innerBack,innerNear,outerBack,outerNear,corners:[outerBack,innerBack,innerNear,outerNear]};
  }

  #bands(shape,count,coverage){
    const bands=[];
    for(let index=0;index<count;index++){
      const start=(index+.12)/count,end=(index+.12+coverage)/count;
      bands.push(this.#slice(shape,start,end));
    }
    return bands;
  }

  #gaps(shape,count,coverage){
    const gaps=[];
    for(let index=0;index<count;index++){
      const start=(index+.12+coverage)/count,end=(index+1.12)/count;
      gaps.push(this.#slice(shape,start,end));
    }
    return gaps;
  }

  #slice(shape,start,end){
    return [
      this.#mix(shape.outerBack,shape.outerNear,start),
      this.#mix(shape.innerBack,shape.innerNear,start),
      this.#mix(shape.innerBack,shape.innerNear,end),
      this.#mix(shape.outerBack,shape.outerNear,end)
    ];
  }

  #quad(ctx,a,b,c,d){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();}
  #mix(a,b,t){return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
  #pointAtY(a,b,y){return this.#mix(a,b,(y-a.y)/(b.y-a.y));}
}

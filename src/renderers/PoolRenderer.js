import { ReservoirSurface } from "../effects/ReservoirSurface.js?v=0006d";

/** Draws the bath as a physical facility seen from a standing visitor. */
export class PoolRenderer {
  constructor(){
    this.surface=new ReservoirSurface();
  }

  update(dt){this.surface.update(dt);}

  render(ctx,width,height){
    const g=this.#geometry(width,height);
    this.#wall(ctx,width,height,g);
    this.#rimsBackAndSides(ctx,g);
    this.#water(ctx,g,height);
    this.#nearRim(ctx,g);
    this.#rimSurfaceLines(ctx,width,height,g);
    this.#steps(ctx,width,height,g);
    this.#handrail(ctx,width,height,g);
  }

  #geometry(w,h){
    const wallBottom=h*.52;
    const vanishing={x:w*.5,y:h*.26};
    const outerNearY=h*.80;
    const backY=wallBottom;
    const waterNearY=backY+(outerNearY-backY)*.67;
    const stepTopY=h*.76;
    const frontRimHeight=stepTopY-waterNearY;
    const waterNearL={x:frontRimHeight,y:waterNearY};
    const waterNearR={x:w-frontRimHeight,y:waterNearY};
    const outerAtWaterL=0;
    const outerAtWaterR=w;
    const outerRatio=(waterNearY-vanishing.y)/(outerNearY-vanishing.y);
    const outerNearL={x:vanishing.x+(outerAtWaterL-vanishing.x)/outerRatio,y:outerNearY};
    const outerNearR={x:vanishing.x+(outerAtWaterR-vanishing.x)/outerRatio,y:outerNearY};
    const waterBackY=waterNearY-h*.15;
    const wallGuideY=h*1.04;
    const leftGapNear={x:w*-.48,y:wallGuideY};
    const rightGapNear={x:w*1.48,y:wallGuideY};
    return {
      wallBottom,
      vanishing,
      sideWalls:{
        leftNear:leftGapNear,rightNear:rightGapNear,
        leftCorner:{x:this.#projectX(leftGapNear,vanishing,wallBottom),y:wallBottom},
        rightCorner:{x:this.#projectX(rightGapNear,vanishing,wallBottom),y:wallBottom}
      },
      outer:{
        backL:{x:this.#projectX(outerNearL,vanishing,backY),y:backY},
        backR:{x:this.#projectX(outerNearR,vanishing,backY),y:backY},
        nearR:outerNearR,
        nearL:outerNearL
      },
      water:{
        backL:{x:this.#projectX(waterNearL,vanishing,waterBackY),y:waterBackY},
        backR:{x:this.#projectX(waterNearR,vanishing,waterBackY),y:waterBackY},
        nearR:waterNearR,
        nearL:waterNearL
      },
      stepTop:stepTopY
    };
  }

  #wall(ctx,w,h,g){
    const gradient=ctx.createLinearGradient(0,0,0,g.wallBottom);
    gradient.addColorStop(0,"#d8d4cb");gradient.addColorStop(1,"#aaa9a4");
    ctx.fillStyle=gradient;ctx.fillRect(0,0,w,g.wallBottom+h*.15);
    ctx.strokeStyle="rgba(91,99,101,.32)";ctx.lineWidth=1;
    const tileW=Math.max(58,w/12),tileH=Math.max(38,h*.075);
    for(let y=0,row=0;y<g.wallBottom+h*.12;y+=tileH,row++){
      const offset=(row%2)*tileW*.5;
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();
      for(let x=-offset;x<w;x+=tileW){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+tileH);ctx.stroke();}
    }
    ctx.fillStyle=this.#stoneGradient(ctx,g);ctx.fillRect(0,g.wallBottom,w,h-g.wallBottom);
    const s=g.sideWalls;
    const sideShade=ctx.createLinearGradient(0,0,w,0);
    sideShade.addColorStop(0,"#858b8a");sideShade.addColorStop(.5,"#c4c2bb");sideShade.addColorStop(1,"#858b8a");
    ctx.fillStyle=sideShade;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(s.leftCorner.x,0);ctx.lineTo(s.leftCorner.x,s.leftCorner.y);ctx.lineTo(s.leftNear.x,s.leftNear.y);ctx.lineTo(0,h);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(w,0);ctx.lineTo(s.rightCorner.x,0);ctx.lineTo(s.rightCorner.x,s.rightCorner.y);ctx.lineTo(s.rightNear.x,s.rightNear.y);ctx.lineTo(w,h);ctx.closePath();ctx.fill();
    ctx.strokeStyle="rgba(70,76,76,.4)";ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(s.leftCorner.x,0);ctx.lineTo(s.leftCorner.x,s.leftCorner.y);ctx.lineTo(s.leftNear.x,s.leftNear.y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(s.rightCorner.x,0);ctx.lineTo(s.rightCorner.x,s.rightCorner.y);ctx.lineTo(s.rightNear.x,s.rightNear.y);ctx.stroke();
  }

  #rimsBackAndSides(ctx,g){
    const o=g.outer,w=g.water;
    ctx.fillStyle=this.#stoneGradient(ctx,g);
    this.#quad(ctx,o.backL,o.backR,w.backR,w.backL);ctx.fill();
    this.#quad(ctx,o.backL,w.backL,w.nearL,o.nearL);ctx.fill();
    this.#quad(ctx,w.backR,o.backR,o.nearR,w.nearR);ctx.fill();

  }

  #water(ctx,p,h){
    const w=p.water;
    ctx.save();this.#quad(ctx,w.backL,w.backR,w.nearR,w.nearL);ctx.clip();
    const water=ctx.createLinearGradient(0,w.backL.y,0,w.nearL.y);
    water.addColorStop(0,"#23b8d7");water.addColorStop(.5,"#078fc2");water.addColorStop(1,"#026997");
    ctx.fillStyle=water;ctx.fillRect(0,w.backL.y,Math.max(w.nearR.x,w.backR.x),w.nearL.y-w.backL.y+h*.06);

    // Submerged blue tiles make the depth readable through the full bath.
    ctx.strokeStyle="rgba(15,88,122,.38)";ctx.lineWidth=1;
    for(let row=1;row<9;row++){
      const v=row/9;
      const left=this.#mix(w.backL,w.nearL,v),right=this.#mix(w.backR,w.nearR,v);
      ctx.beginPath();ctx.moveTo(left.x,left.y);ctx.lineTo(right.x,right.y);ctx.stroke();
    }
    for(let col=1;col<13;col++){
      const u=col/13;
      const back=this.#mix(w.backL,w.backR,u),near=this.#mix(w.nearL,w.nearR,u);
      ctx.beginPath();ctx.moveTo(back.x,back.y);ctx.lineTo(near.x,near.y);ctx.stroke();
    }

    for(let row=1;row<18;row++){
      const v=row/18,left=this.#mix(w.backL,w.nearL,v),right=this.#mix(w.backR,w.nearR,v);
      ctx.beginPath();
      for(let col=0;col<=44;col++){
        const u=col/44,point=this.#mix(left,right,u);
        const wave=this.surface.value(u,v)*Math.min(20,h*.025);
        if(col===0)ctx.moveTo(point.x,point.y+wave);else ctx.lineTo(point.x,point.y+wave);
      }
      ctx.strokeStyle=`rgba(208,250,255,${.07+v*.17})`;ctx.lineWidth=1.35;ctx.stroke();
    }
    const sheen=ctx.createLinearGradient(w.nearL.x,w.nearL.y,w.backR.x,w.backR.y);
    sheen.addColorStop(0,"rgba(255,255,255,.04)");sheen.addColorStop(.48,"rgba(255,255,255,.24)");sheen.addColorStop(.58,"rgba(255,255,255,.03)");
    ctx.fillStyle=sheen;ctx.fillRect(0,w.backL.y,Math.max(w.nearR.x,w.backR.x),h);
    ctx.restore();
  }

  #nearRim(ctx,g){
    const o=g.outer,w=g.water;
    ctx.fillStyle=this.#stoneGradient(ctx,g);this.#quad(ctx,w.nearL,w.nearR,o.nearR,o.nearL);ctx.fill();
    ctx.strokeStyle="rgba(210,236,235,.48)";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(w.nearL.x,w.nearL.y);ctx.lineTo(w.nearR.x,w.nearR.y);ctx.stroke();
  }

  #rimSurfaceLines(ctx,w,h,g){
    const o=g.outer,water=g.water;
    ctx.strokeStyle="rgba(213,219,210,.28)";ctx.lineWidth=1;
    for(let x=0;x<=w;x+=w/3.25){
      const anchor={x,y:h};
      ctx.beginPath();
      ctx.moveTo(this.#projectX(anchor,g.vanishing,water.nearL.y),water.nearL.y);
      ctx.lineTo(this.#projectX(anchor,g.vanishing,o.nearL.y),o.nearL.y);ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(this.#projectX(anchor,g.vanishing,o.backL.y),o.backL.y);
      ctx.lineTo(this.#projectX(anchor,g.vanishing,water.backL.y),water.backL.y);ctx.stroke();
    }
    const sideYs=[water.backL.y,this.#mix(o.backL,o.nearL,.34).y,water.nearL.y];
    for(const y of sideYs){
      const leftWall=this.#pointAtY(g.sideWalls.leftCorner,g.sideWalls.leftNear,y);
      const leftInner=this.#pointAtY(water.backL,water.nearL,y);
      const rightWall=this.#pointAtY(g.sideWalls.rightCorner,g.sideWalls.rightNear,y);
      const rightInner=this.#pointAtY(water.backR,water.nearR,y);
      ctx.beginPath();ctx.moveTo(leftWall.x,y);ctx.lineTo(leftInner.x,y);ctx.stroke();
      ctx.beginPath();ctx.moveTo(rightInner.x,y);ctx.lineTo(rightWall.x,y);ctx.stroke();
    }
  }

  #steps(ctx,w,h,g){
    const top=g.stepTop;
    const treadTop=h*.80;
    const riser2Top=h*.88;
    const floorTop=h*.92;
    ctx.fillStyle=this.#stoneGradient(ctx,g);
    ctx.fillRect(0,treadTop,w,riser2Top-treadTop);
    ctx.fillRect(0,floorTop,w,h-floorTop);
    ctx.fillStyle="#555b59";
    ctx.fillRect(0,top,w,treadTop-top);
    ctx.fillRect(0,riser2Top,w,floorTop-riser2Top);

    ctx.strokeStyle="rgba(218,222,214,.27)";ctx.lineWidth=1;
    for(let x=0;x<=w;x+=w/3.25){
      const bottom={x,y:h};
      const rimX=this.#projectX(bottom,g.vanishing,top);
      const riser2X=this.#projectX(bottom,g.vanishing,riser2Top);
      ctx.beginPath();
      ctx.moveTo(rimX,top);ctx.lineTo(rimX,treadTop);
      ctx.lineTo(riser2X,riser2Top);
      ctx.lineTo(riser2X,floorTop);
      ctx.lineTo(x,h);ctx.stroke();
    }
    ctx.beginPath();
    for(const y of [top,treadTop,riser2Top,floorTop]){ctx.moveTo(0,y);ctx.lineTo(w,y);}
    ctx.stroke();

  }

  #handrail(ctx,w,h,g){
    const frontBase={x:w*.87,y:h*.985};
    const farBaseY=g.water.nearR.y;
    const farX=this.#projectX(frontBase,g.vanishing,farBaseY);
    const path=new Path2D();
    path.moveTo(farX,farBaseY);
    path.lineTo(farX,h*.615);
    path.bezierCurveTo(farX,h*.54,frontBase.x,h*.54,frontBase.x,h*.64);
    path.lineTo(frontBase.x,frontBase.y);
    const railWidth=Math.max(8,w*.010);
    ctx.save();
    ctx.fillStyle="rgba(35,44,46,.5)";
    ctx.beginPath();ctx.ellipse(frontBase.x,frontBase.y,railWidth*1.45,railWidth*.42,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#aebec1";ctx.lineWidth=Math.max(2,railWidth*.22);ctx.stroke();
    ctx.restore();
    this.#railStroke(ctx,path,w);
  }

  #railStroke(ctx,path,w){
    ctx.save();ctx.lineCap="butt";ctx.lineJoin="round";
    ctx.strokeStyle="rgba(8,18,22,.5)";ctx.lineWidth=Math.max(12,w*.015);ctx.stroke(path);
    ctx.strokeStyle="#aebec1";ctx.lineWidth=Math.max(8,w*.010);ctx.stroke(path);
    ctx.strokeStyle="rgba(250,255,255,.88)";ctx.lineWidth=Math.max(1.5,w*.002);ctx.stroke(path);
    ctx.restore();
  }

  #quad(ctx,a,b,c,d){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();}
  #mix(a,b,t){return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
  #pointAtY(a,b,y){return this.#mix(a,b,(y-a.y)/(b.y-a.y));}
  #projectX(point,vanishing,y){return vanishing.x+(point.x-vanishing.x)*(y-vanishing.y)/(point.y-vanishing.y);}
  #stoneGradient(ctx,g){
    const gradient=ctx.createLinearGradient(g.outer.nearL.x,0,g.outer.nearR.x,0);
    gradient.addColorStop(0,"#777b74");gradient.addColorStop(.48,"#4a504d");gradient.addColorStop(1,"#656963");
    return gradient;
  }
}

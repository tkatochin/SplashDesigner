/** Draws a dim, wave-distorted reflection of the tiled back wall. */
export class WaterReflectionRenderer {
  constructor(){
    this.texture=document.createElement("canvas");
    this.cacheKey="";
  }

  render(ctx,g,width,height,surface,time=performance.now()){
    this.#ensureTexture(width,height,g.wallBottom);
    const water=g.water,reach=.72,rows=14,cols=20;
    const texture=this.texture;
    ctx.save();
    ctx.globalCompositeOperation="source-over";
    for(let row=0;row<rows;row++){
      const v0=reach*row/rows,v1=reach*(row+1)/rows;
      const y0=this.#mix(water.backL,water.nearL,v0).y;
      const y1=this.#mix(water.backL,water.nearL,v1).y;
      const alpha=.34*Math.pow(1-(v0+v1)/(2*reach),1.25);
      const sourceY=texture.height*row/rows;
      const sourceH=texture.height/rows+1;
      for(let col=0;col<cols;col++){
        const u0=col/cols,u1=(col+1)/cols,u=(u0+u1)*.5,v=(v0+v1)*.5;
        const left=this.#mix(water.backL,water.nearL,v);
        const right=this.#mix(water.backR,water.nearR,v);
        const x0=left.x+(right.x-left.x)*u0;
        const x1=left.x+(right.x-left.x)*u1;
        const wave=surface.value(u,v);
        const slope=surface.value(Math.min(1,u+.025),v)-surface.value(Math.max(0,u-.025),v);
        const drift=Math.sin(time*.00032+u*8.3+v*5.1)*.45;
        ctx.globalAlpha=alpha;
        ctx.drawImage(
          texture,texture.width*u0,sourceY,texture.width/cols+1,sourceH,
          x0-slope*34+drift,y0+wave*Math.min(10,height*.012),x1-x0+1,y1-y0+1
        );
      }
    }
    ctx.restore();
    this.#glints(ctx,water,height,surface,time);
  }

  #ensureTexture(width,height,wallBottom){
    const reflectionHeight=Math.max(80,Math.round(Math.min(wallBottom*.62,height*.31)));
    const pixelWidth=Math.max(1,Math.round(width));
    const key=`${pixelWidth}:${reflectionHeight}:${Math.round(wallBottom)}`;
    if(key===this.cacheKey)return;
    this.cacheKey=key;

    const wall=document.createElement("canvas");
    wall.width=pixelWidth;wall.height=reflectionHeight;
    const wallCtx=wall.getContext("2d");
    const sourceTop=wallBottom-reflectionHeight;
    const gradient=wallCtx.createLinearGradient(0,-sourceTop,0,wallBottom-sourceTop);
    gradient.addColorStop(0,"#d8d4cb");gradient.addColorStop(1,"#aaa9a4");
    wallCtx.fillStyle=gradient;wallCtx.fillRect(0,0,pixelWidth,reflectionHeight);
    wallCtx.strokeStyle="rgba(72,81,82,.42)";wallCtx.lineWidth=1;
    const tileW=Math.max(58,width/12),tileH=Math.max(38,height*.075);
    const firstRow=Math.floor(sourceTop/tileH);
    for(let row=firstRow;;row++){
      const globalY=row*tileH,localY=globalY-sourceTop;
      if(localY>reflectionHeight)break;
      const offset=(row%2)*tileW*.5;
      wallCtx.beginPath();wallCtx.moveTo(0,localY);wallCtx.lineTo(pixelWidth,localY);wallCtx.stroke();
      for(let x=-offset;x<pixelWidth;x+=tileW){
        wallCtx.beginPath();wallCtx.moveTo(x,localY);wallCtx.lineTo(x,localY+tileH);wallCtx.stroke();
      }
    }

    this.texture.width=pixelWidth;this.texture.height=reflectionHeight;
    const reflection=this.texture.getContext("2d");
    reflection.translate(0,reflectionHeight);reflection.scale(1,-1);
    reflection.drawImage(wall,0,0);
    reflection.setTransform(1,0,0,1,0,0);
    reflection.fillStyle="rgba(0,74,99,.34)";reflection.fillRect(0,0,pixelWidth,reflectionHeight);
  }

  #glints(ctx,water,height,surface,time){
    ctx.save();ctx.lineCap="round";ctx.lineWidth=Math.max(1,height*.0013);
    for(let index=0;index<13;index++){
      const u=.06+((index*37)%89)/100;
      const v=.08+((index*29)%73)/100*.84;
      const left=this.#mix(water.backL,water.nearL,v),right=this.#mix(water.backR,water.nearR,v);
      const point=this.#mix(left,right,u);
      const wave=surface.value(u,v)*Math.min(12,height*.014);
      const shimmer=.5+.5*Math.sin(time*.0011+index*2.17);
      const length=(right.x-left.x)*(.018+.018*shimmer)*(1-v*.55);
      ctx.strokeStyle=`rgba(220,249,247,${(.025+.075*shimmer)*(1-v*.55)})`;
      ctx.beginPath();ctx.moveTo(point.x-length*.5,point.y+wave);ctx.lineTo(point.x+length*.5,point.y+wave);ctx.stroke();
    }
    ctx.restore();
  }

  #mix(a,b,t){return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
}

/** Draws a dim, wave-distorted reflection of the tiled back wall. */
export class WaterReflectionRenderer {
  constructor(){
    this.texture=document.createElement("canvas");
    this.cacheKey="";
  }

  render(ctx,g,width,height,surface,time=performance.now()){
    const water=g.water,reach=1,rows=30;
    const reflectionHeight=(water.nearL.y-water.backL.y)*reach;
    this.#ensureTexture(width,height,g.wallBottom,reflectionHeight);
    const texture=this.texture;
    ctx.save();
    ctx.globalCompositeOperation="source-over";
    for(let row=0;row<rows;row++){
      const v0=reach*row/rows,v1=reach*(row+1)/rows;
      const y0=this.#mix(water.backL,water.nearL,v0).y;
      const y1=this.#mix(water.backL,water.nearL,v1).y;
      const middle=(v0+v1)*.5;
      const baseAlpha=.58-.10*Math.min(1,middle/.66);
      const fade=this.#smooth(Math.max(0,Math.min(1,(middle-.66)/.34)));
      const alpha=baseAlpha*(1-fade);
      const sourceY=texture.height*row/rows;
      const sourceH=texture.height/rows+1;
      const v=(v0+v1)*.5;
      let wave=0;
      for(const u of [.1,.3,.5,.7,.9])wave+=surface.value(u,v);
      wave/=5;
      const leftWave=surface.value(.25,v),rightWave=surface.value(.75,v);
      const shiftX=(rightWave-leftWave)*9+Math.sin(time*.00025+v*5.1)*.18;
      const shiftY=wave*Math.min(9,height*.011);
      ctx.globalAlpha=alpha;
      ctx.drawImage(texture,0,sourceY,texture.width,sourceH,shiftX,y0+shiftY,width,y1-y0+1);
    }
    ctx.restore();
    this.#glints(ctx,water,height,surface,time);
  }

  #ensureTexture(width,height,wallBottom,visibleHeight){
    const reflectionHeight=Math.max(1,Math.round(visibleHeight));
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
    reflection.fillStyle="rgba(0,66,88,.16)";reflection.fillRect(0,0,pixelWidth,reflectionHeight);
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
  #smooth(t){return t*t*(3-2*t);}
}

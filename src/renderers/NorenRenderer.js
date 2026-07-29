/**
 * NorenRenderer
 * Renders and animates the entrance noren.
 */
export class NorenRenderer {
  constructor(options = {}) {
    this.color = options.color ?? "#223f73";
    this.textColor = options.textColor ?? "#ffffff";
    this.swayStrength = options.swayStrength ?? 6;
    this.left=new ClothPanel(-1);
    this.right=new ClothPanel(1);
    this.texture=document.createElement("canvas");
    this.textureKey="";
    this.art=new Image();
    this.ready=new Promise(resolve=>{
      this.art.onload=async()=>{
        try{await this.art.decode?.();}catch{}
        this.textureKey="";resolve(true);
      };
      this.art.onerror=()=>resolve(false);
    });
    this.art.src=new URL("../../assets/img/noren_art.png",import.meta.url).href;
  }

  update(dt,scene,width,height) {
    const cx = width / 2;
    const panelW=Math.min(width*0.47,430);
    const top=0;
    const panelH=height*.7;
    this.left.layout(cx-panelW,top,panelW,panelH);
    this.right.layout(cx,top,panelW,panelH);
    const rect=scene.engine.renderer.canvas.getBoundingClientRect();
    const px=scene.drag.pointerX*width;
    const py=scene.drag.pointerY*height;
    const side=scene.state==="idle"?scene.drag.side:scene.entranceSide;
    const gesture=scene.state==="idle"?scene.drag.gesture:scene.entranceGesture;
    this.left.update(dt,side<0?scene.openAmount:0,scene.drag.dragging&&side<0,px,py,gesture);
    this.right.update(dt,side>0?scene.openAmount:0,scene.drag.dragging&&side>0,px,py,gesture);
  }

  render(ctx, scene, width, height) {
    ctx.save();
    ctx.globalAlpha=scene.norenAlpha;
    const sway=Math.sin(performance.now()*.0017);
    ctx.filter=`brightness(${1.02+Math.max(0,sway)*.16})`;
    const panelW=Math.min(width*.47,430);
    const panelH=height*.7;
    this.#prepareTexture(panelW,panelH);
    this.#mesh(ctx,this.left,0,panelW,panelH);
    this.#mesh(ctx,this.right,panelW,panelW,panelH);
    ctx.restore();
  }

  #prepareTexture(panelW,panelH){
    const textureW=Math.max(2,Math.round(panelW*2));
    const textureH=Math.max(2,Math.round(panelH));
    const key=`${textureW}:${textureH}`;
    if(this.textureKey===key)return;
    this.textureKey=key;
    this.texture.width=textureW;this.texture.height=textureH;
    const ctx=this.texture.getContext("2d");
    const base=ctx.createLinearGradient(0,0,textureW,textureH);
    base.addColorStop(0,"#18345f");
    base.addColorStop(.46,"#203f70");
    base.addColorStop(1,"#142e56");
    ctx.fillStyle=base;ctx.fillRect(0,0,textureW,textureH);

    const light=ctx.createRadialGradient(textureW*.38,textureH*.22,0,textureW*.38,textureH*.22,textureW*.72);
    light.addColorStop(0,"rgba(255,255,255,.07)");
    light.addColorStop(.55,"rgba(255,255,255,.015)");
    light.addColorStop(1,"rgba(0,0,0,.1)");
    ctx.fillStyle=light;ctx.fillRect(0,0,textureW,textureH);

    const titleSize=Math.max(32,Math.min(72,panelW*.18));
    ctx.fillStyle="rgba(246,247,241,.94)";
    ctx.font=`700 ${titleSize}px Georgia, serif`;
    ctx.textAlign="left";ctx.textBaseline="top";
    ctx.fillText("Splash",panelW*.13,panelH*.08);
    ctx.fillText("Designer",panelW*.13,panelH*.08+titleSize*.94);

    if(this.art.complete&&this.art.naturalWidth){
      const size=Math.min(panelW*1.08,panelH*.56);
      const cx=panelW,cy=panelH*.59;
      ctx.drawImage(this.art,cx-size*.5,cy-size*.5,size,size);
    }
  }

  #mesh(ctx,panel,sourceOffset,panelW,panelH){
    const rows=panel.points.length-1;
    if(rows<1)return;
    const cols=panel.points[0].length-1;
    for(let row=0;row<rows;row++) for(let col=0;col<cols;col++){
      const a=panel.points[row][col],b=panel.points[row][col+1];
      const c=panel.points[row+1][col+1],d=panel.points[row+1][col];
      const sx0=sourceOffset+panelW*(col/cols),sx1=sourceOffset+panelW*((col+1)/cols);
      const sy0=panelH*(row/rows),sy1=panelH*((row+1)/rows);
      this.#triangle(ctx,[sx0,sy0,sx1,sy0,sx0,sy1],[a.x,a.y,b.x,b.y,d.x,d.y]);
      this.#triangle(ctx,[sx1,sy0,sx1,sy1,sx0,sy1],[b.x,b.y,c.x,c.y,d.x,d.y]);
    }
  }

  #triangle(ctx,source,dest){
    const [sx0,sy0,sx1,sy1,sx2,sy2]=source;
    const [dx0,dy0,dx1,dy1,dx2,dy2]=dest;
    const denominator=sx0*(sy1-sy2)+sx1*(sy2-sy0)+sx2*(sy0-sy1);
    if(Math.abs(denominator)<.001)return;
    const a=(dx0*(sy1-sy2)+dx1*(sy2-sy0)+dx2*(sy0-sy1))/denominator;
    const c=(dx0*(sx2-sx1)+dx1*(sx0-sx2)+dx2*(sx1-sx0))/denominator;
    const e=(dx0*(sx1*sy2-sx2*sy1)+dx1*(sx2*sy0-sx0*sy2)+dx2*(sx0*sy1-sx1*sy0))/denominator;
    const b=(dy0*(sy1-sy2)+dy1*(sy2-sy0)+dy2*(sy0-sy1))/denominator;
    const d=(dy0*(sx2-sx1)+dy1*(sx0-sx2)+dy2*(sx1-sx0))/denominator;
    const f=(dy0*(sx1*sy2-sx2*sy1)+dy1*(sx2*sy0-sx0*sy2)+dy2*(sx0*sy1-sx1*sy0))/denominator;
    ctx.save();ctx.beginPath();ctx.moveTo(dx0,dy0);ctx.lineTo(dx1,dy1);ctx.lineTo(dx2,dy2);ctx.closePath();ctx.clip();
    ctx.transform(a,b,c,d,e,f);ctx.drawImage(this.texture,0,0);ctx.restore();
  }
}
import { ClothPanel } from "../effects/ClothPanel.js?v=0006d";

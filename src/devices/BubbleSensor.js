/**
 * BubbleSensor
 * Infrared-style touch sensor for Bubble mode.
 */
export class BubbleSensor{
  constructor(){
    this.enabled=false;
    this.radius=22;
  }
  toggle(){ this.enabled=!this.enabled; }
  hitTest(px,py,x,y){
    const dx=px-x, dy=py-y;
    return dx*dx+dy*dy<=this.radius*this.radius;
  }
  render(ctx,x,y,timeMs){
    ctx.save();
    const pulse=0.5+0.5*Math.sin(timeMs/250);
    ctx.beginPath();
    ctx.arc(x,y,this.radius,0,Math.PI*2);
    ctx.fillStyle=this.enabled?"#ff4444":"#661111";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x,y,this.radius+6*pulse,0,Math.PI*2);
    ctx.strokeStyle="rgba(255,80,80,0.45)";
    ctx.stroke();
    ctx.restore();
  }
}

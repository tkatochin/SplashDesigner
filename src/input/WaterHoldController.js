/** Recognizes a deliberate, nearly stationary hold inside the bath water. */
export class WaterHoldController {
  constructor(canvas,{isEnabled,hitTest,onTrigger,holdMs=800,tolerance=12}){
    this.canvas=canvas;
    this.isEnabled=isEnabled;
    this.hitTest=hitTest;
    this.onTrigger=onTrigger;
    this.holdMs=holdMs;
    this.tolerance=tolerance;
    this.active=false;
    this.triggered=false;
    this.elapsed=0;
    this.point=null;
    this.startX=0;
    this.startY=0;
    this.suppressMenuUntil=0;

    this.onPointerDown=event=>{
      if(!this.isEnabled())return;
      const point=this.#canvasPoint(event);
      const waterPoint=this.hitTest(point.x,point.y);
      if(!waterPoint)return;
      this.active=true;
      this.triggered=false;
      this.elapsed=0;
      this.point={...point,...waterPoint};
      this.startX=point.x;
      this.startY=point.y;
      this.suppressMenuUntil=performance.now()+1800;
    };
    this.onPointerMove=event=>{
      if(!this.active)return;
      const point=this.#canvasPoint(event);
      if(Math.hypot(point.x-this.startX,point.y-this.startY)>this.tolerance){
        this.cancel();
        return;
      }
      const waterPoint=this.hitTest(point.x,point.y);
      if(!waterPoint){this.cancel();return;}
      this.point={...point,...waterPoint};
    };
    this.onPointerEnd=()=>this.cancel();
    this.onContextMenu=event=>{
      const onCanvas=event.target===canvas||canvas.contains?.(event.target);
      if(onCanvas||performance.now()<this.suppressMenuUntil){
        event.preventDefault();
        event.stopPropagation();
      }
    };
    canvas.addEventListener("pointerdown",this.onPointerDown);
    canvas.addEventListener("pointermove",this.onPointerMove);
    canvas.addEventListener("pointerup",this.onPointerEnd);
    canvas.addEventListener("pointercancel",this.onPointerEnd);
    document.addEventListener("contextmenu",this.onContextMenu,true);
  }

  update(dt){
    if(!this.active||this.triggered||!this.isEnabled())return;
    this.elapsed+=dt;
    if(this.elapsed>=this.holdMs){
      this.triggered=true;
      this.onTrigger(this.point);
    }
  }

  cancel(){
    this.active=false;
    this.triggered=false;
    this.elapsed=0;
    this.point=null;
  }

  destroy(){
    this.canvas.removeEventListener("pointerdown",this.onPointerDown);
    this.canvas.removeEventListener("pointermove",this.onPointerMove);
    this.canvas.removeEventListener("pointerup",this.onPointerEnd);
    this.canvas.removeEventListener("pointercancel",this.onPointerEnd);
    document.removeEventListener("contextmenu",this.onContextMenu,true);
  }

  #canvasPoint(event){
    const rect=this.canvas.getBoundingClientRect();
    return{x:event.clientX-rect.left,y:event.clientY-rect.top};
  }
}

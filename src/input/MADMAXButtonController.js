/** Turns a short press on the physical MADMAX button into one activation. */
export class MADMAXButtonController {
  constructor(canvas,{isEnabled,hitTest,onPress,onCancel,onActivate,tolerance=14}){
    this.canvas=canvas;this.isEnabled=isEnabled;this.hitTest=hitTest;
    this.onPress=onPress;this.onCancel=onCancel;this.onActivate=onActivate;this.tolerance=tolerance;
    this.active=false;this.pointerId=null;this.startX=0;this.startY=0;
    this.onDown=event=>{
      if(!this.isEnabled())return;
      const point=this.#point(event);if(!this.hitTest(point.x,point.y))return;
      if(this.onPress()===false)return;
      this.active=true;this.pointerId=event.pointerId;this.startX=point.x;this.startY=point.y;
      canvas.setPointerCapture?.(event.pointerId);event.preventDefault();
    };
    this.onMove=event=>{
      if(!this.active||event.pointerId!==this.pointerId)return;
      const point=this.#point(event);
      if(Math.hypot(point.x-this.startX,point.y-this.startY)>this.tolerance)this.#cancel();
    };
    this.onUp=event=>{
      if(!this.active||event.pointerId!==this.pointerId)return;
      const point=this.#point(event),activate=this.hitTest(point.x,point.y);
      this.active=false;this.pointerId=null;
      if(activate)this.onActivate();else this.onCancel();
    };
    this.onPointerCancel=()=>this.#cancel();
    canvas.addEventListener("pointerdown",this.onDown);canvas.addEventListener("pointermove",this.onMove);
    canvas.addEventListener("pointerup",this.onUp);canvas.addEventListener("pointercancel",this.onPointerCancel);
  }
  destroy(){
    this.canvas.removeEventListener("pointerdown",this.onDown);this.canvas.removeEventListener("pointermove",this.onMove);
    this.canvas.removeEventListener("pointerup",this.onUp);this.canvas.removeEventListener("pointercancel",this.onPointerCancel);
  }
  #cancel(){if(!this.active)return;this.active=false;this.pointerId=null;this.onCancel();}
  #point(event){const rect=this.canvas.getBoundingClientRect();return{x:event.clientX-rect.left,y:event.clientY-rect.top};}
}

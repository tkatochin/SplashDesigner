/** Converts a short pointer gesture on the infrared plate into a sensor trigger. */
export class VibraSensorController {
  constructor(canvas,{isEnabled,hitTest,onTrigger,tolerance=12}){
    this.canvas=canvas;this.isEnabled=isEnabled;this.hitTest=hitTest;
    this.onTrigger=onTrigger;this.tolerance=tolerance;
    this.active=false;this.pointerId=null;this.startX=0;this.startY=0;
    this.onDown=event=>{
      if(!this.isEnabled())return;
      const point=this.#point(event);
      if(!this.hitTest(point.x,point.y))return;
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
      const point=this.#point(event);
      const trigger=this.hitTest(point.x,point.y);
      this.#cancel();
      if(trigger)this.onTrigger();
    };
    this.onCancel=()=>this.#cancel();
    canvas.addEventListener("pointerdown",this.onDown);
    canvas.addEventListener("pointermove",this.onMove);
    canvas.addEventListener("pointerup",this.onUp);
    canvas.addEventListener("pointercancel",this.onCancel);
  }

  destroy(){
    this.canvas.removeEventListener("pointerdown",this.onDown);
    this.canvas.removeEventListener("pointermove",this.onMove);
    this.canvas.removeEventListener("pointerup",this.onUp);
    this.canvas.removeEventListener("pointercancel",this.onCancel);
  }

  #cancel(){this.active=false;this.pointerId=null;}
  #point(event){const rect=this.canvas.getBoundingClientRect();return{x:event.clientX-rect.left,y:event.clientY-rect.top};}
}

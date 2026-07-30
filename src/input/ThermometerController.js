/** Distinguishes a thermometer tap from an any-direction swipe. */
export class ThermometerController {
  constructor(canvas,{isEnabled,hitTest,onTap,onSwipe,threshold=12}){
    this.canvas=canvas;this.isEnabled=isEnabled;this.hitTest=hitTest;
    this.onTap=onTap;this.onSwipe=onSwipe;this.threshold=threshold;
    this.active=false;this.swiped=false;this.pointerId=null;this.startX=0;this.startY=0;
    this.onDown=event=>{
      if(!this.isEnabled())return;
      const p=this.#point(event);if(!this.hitTest(p.x,p.y))return;
      this.active=true;this.swiped=false;this.pointerId=event.pointerId;this.startX=p.x;this.startY=p.y;
      canvas.setPointerCapture?.(event.pointerId);event.preventDefault();
    };
    this.onMove=event=>{
      if(!this.active||event.pointerId!==this.pointerId)return;
      const p=this.#point(event);
      if(Math.hypot(p.x-this.startX,p.y-this.startY)>=this.threshold)this.swiped=true;
    };
    this.onEnd=event=>{
      if(!this.active||event.pointerId!==this.pointerId)return;
      const action=this.swiped?this.onSwipe:this.onTap;this.active=false;this.pointerId=null;action();
    };
    this.onCancel=()=>{this.active=false;this.swiped=false;this.pointerId=null;};
    canvas.addEventListener("pointerdown",this.onDown);
    canvas.addEventListener("pointermove",this.onMove);
    canvas.addEventListener("pointerup",this.onEnd);
    canvas.addEventListener("pointercancel",this.onCancel);
  }
  destroy(){
    this.canvas.removeEventListener("pointerdown",this.onDown);this.canvas.removeEventListener("pointermove",this.onMove);
    this.canvas.removeEventListener("pointerup",this.onEnd);this.canvas.removeEventListener("pointercancel",this.onCancel);
  }
  #point(event){const r=this.canvas.getBoundingClientRect();return{x:event.clientX-r.left,y:event.clientY-r.top};}
}

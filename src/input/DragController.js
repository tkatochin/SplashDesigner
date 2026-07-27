/**
 * DragController
 * Converts pointer drag into normalized progress (0..1).
 */
export class DragController {
  constructor(canvas){
    this.canvas=canvas;
    this.dragging=false;
    this.startX=0;
    this.progress=0;
    this.side=0;
    this.pointerX=0;
    this.pointerY=0;
    this.committed=false;
    this.travel=0;

    const point=e=>{
      const rect=canvas.getBoundingClientRect();
      this.pointerX=(e.clientX-rect.left)/rect.width;
      this.pointerY=(e.clientY-rect.top)/rect.height;
    };

    canvas.addEventListener("pointerdown",e=>{
      point(e);
      this.dragging=true;
      this.startX=e.clientX;
      this.side=this.pointerX<0.5?-1:1;
      this.committed=false;
      this.travel=0;
      canvas.setPointerCapture?.(e.pointerId);
    });

    canvas.addEventListener("pointermove",e=>{
      if(!this.dragging) return;
      point(e);
      this.travel=Math.max(this.travel,Math.abs(e.clientX-this.startX));
      const outward=(e.clientX-this.startX)*this.side;
      const distance=Math.max(96,canvas.getBoundingClientRect().width*0.28);
      this.progress=Math.min(1,Math.max(0,outward/distance));
    });

    const end=()=>{
      this.dragging=false;
      const tapped=this.travel<10&&this.pointerY<=.7;
      if(tapped){
        this.progress=1;
        this.committed=true;
      }else if(this.progress<0.58){
        this.progress=0;
      }else{
        this.progress=1;
        this.committed=true;
      }
    };
    canvas.addEventListener("pointerup",end);
    canvas.addEventListener("pointercancel",end);
  }

  reset(){
    this.progress=0;
    this.dragging=false;
    this.committed=false;
  }
}

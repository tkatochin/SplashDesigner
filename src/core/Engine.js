export class Engine {
  constructor(sceneManager){
    this.sceneManager=sceneManager;
    this.canvas=document.querySelector("canvas");
    if(!this.canvas){
      this.canvas=document.createElement("canvas");
      document.body.appendChild(this.canvas);
    }
    this.ctx=this.canvas.getContext("2d");
    this.renderer={canvas:this.canvas,ctx:this.ctx};
    this.width=0;
    this.height=0;
    this.pixelRatio=1;
    this._resize=()=>this.resize();
    window.addEventListener("resize",this._resize);
    this.resize();
    this._last=performance.now();
  }
  resize(){
    const width=Math.max(320,window.innerWidth);
    const height=Math.max(480,window.innerHeight);
    const ratio=Math.min(2,window.devicePixelRatio||1);
    this.width=width;
    this.height=height;
    this.pixelRatio=ratio;
    this.canvas.style.width=`${width}px`;
    this.canvas.style.height=`${height}px`;
    this.canvas.width=Math.round(width*ratio);
    this.canvas.height=Math.round(height*ratio);
    this.ctx.setTransform(ratio,0,0,ratio,0,0);
  }
  start(onFirstRender){
    let firstRenderPending=true;
    const loop=(t)=>{
      const dt=t-this._last;
      this._last=t;
      if(this.sceneManager.update)this.sceneManager.update(dt);
      this.ctx.setTransform(this.pixelRatio,0,0,this.pixelRatio,0,0);
      this.ctx.clearRect(0,0,this.width,this.height);
      if(this.sceneManager.render)this.sceneManager.render(this.ctx);
      if(firstRenderPending){
        firstRenderPending=false;
        requestAnimationFrame(()=>onFirstRender?.());
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

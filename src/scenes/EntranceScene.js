import VibraEffect from "./VibraEffect.js";
import { Scene } from "../core/Scene.js";
import { Camera } from "../core/Camera.js?v=0006c";
import { DragController } from "../input/DragController.js?v=0006e";
import { DragSpring } from "../input/DragSpring.js";
import { NorenRenderer } from "../renderers/NorenRenderer.js?v=0006f";
import { PoolRenderer } from "../renderers/PoolRenderer.js?v=0006v";

export class EntranceScene extends Scene {
  constructor(engine){
    super(engine);
    this.camera=new Camera();
    this.drag=null;
    this.spring=new DragSpring();
    this.noren=new NorenRenderer();
    this.pool=new PoolRenderer();
    this.openAmount=0;
    this.state="idle";
    this.transition=0;
    this.norenAlpha=1;
  }

  enter(){
    this.drag=new DragController(this.engine.renderer.canvas);
    this.spring.snap(0);
    this.state="idle";
  }

  update(dt){
    if(this.drag.committed&&this.state!=="entering"&&this.state!=="revealed"){
      this.state="entering";this.transition=0;this.camera.moveToZoom(1.22,1200);
    }
    this.spring.setTarget(this.state==="entering"||this.state==="revealed"?1:this.drag.progress);
    this.spring.update(dt);
    this.openAmount=this.spring.value;
    if(this.state==="entering"){
      this.transition=Math.min(1,this.transition+dt/1500);
      this.camera.update(dt);
      if(this.transition>=1)this.state="revealed";
    }
    this.norenAlpha=1-this.#smooth(this.#range(this.transition,.08,.55));
    this.noren.update(dt,this,this.engine.width,this.engine.height);
    this.pool.update(dt);
    if(this.state==="revealed"&&this.drag.dragging){
      this.pool.surface.disturb(this.drag.pointerX,this.drag.pointerY,.045);
    }
  }

  render(ctx){
    const width=this.engine.width,height=this.engine.height,t=performance.now();
    ctx.fillStyle="#050708";ctx.fillRect(0,0,width,height);
    const roomAlpha=this.#smooth(this.#range(this.transition,.52,1));
    if(roomAlpha>0){ctx.save();ctx.globalAlpha=roomAlpha;this.pool.render(ctx,width,height,t);ctx.restore();}
    this.camera.begin(ctx,width,height);
    if(this.norenAlpha>0)this.noren.render(ctx,this,width,height,t);
    this.camera.end(ctx);
    if(this.norenAlpha>0){
      ctx.save();ctx.globalAlpha=this.norenAlpha*.78;
      ctx.fillStyle="#d7d9d7";
      ctx.font=`${Math.max(11,Math.min(14,width*.026))}px sans-serif`;
      ctx.textAlign="right";ctx.textBaseline="bottom";
      ctx.fillText("© 2026 かとちん",width-14,height-12);
      ctx.restore();
    }
  }

  #range(value,start,end){return Math.max(0,Math.min(1,(value-start)/(end-start)));}
  #smooth(t){return t*t*(3-2*t);}
}


// ---- Patch0024 integration helpers ----
EntranceScene.prototype.initVibraEffect ??= function(){
  this.vibraEffect = new VibraEffect(this);
};

const __oldUpdate = EntranceScene.prototype.update;
EntranceScene.prototype.update = function(time, delta){
  if(__oldUpdate){ __oldUpdate.call(this, time, delta); }
  this.vibraEffect?.update(time, delta);
};

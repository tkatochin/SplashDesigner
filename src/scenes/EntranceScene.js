import { Scene } from "../core/Scene.js";
import { Camera } from "../core/Camera.js?v=0006c";
import { DragController } from "../input/DragController.js?v=0007b";
import { WaterHoldController } from "../input/WaterHoldController.js?v=0017e";
import { ThermometerController } from "../input/ThermometerController.js?v=0010a";
import { VibraSensorController } from "../input/VibraSensorController.js?v=0011c";
import { MADMAXButtonController } from "../input/MADMAXButtonController.js?v=0012c";
import { DragSpring } from "../input/DragSpring.js";
import { NorenRenderer } from "../renderers/NorenRenderer.js?v=0022c";
import { PoolRenderer } from "../renderers/PoolRenderer.js?v=0012c";
import { initializeAudio } from "./EntranceAudioBootstrap.js?v=0012c";

export class EntranceScene extends Scene {
  constructor(engine){
    super(engine);
    this.camera=new Camera();
    this.drag=null;
    this.waterHold=null;
    this.thermometerControl=null;
    this.vibraSensorControl=null;
    this.madmaxControl=null;
    this.vibraWasActive=false;
    this.madmaxWasFalling=false;
    this.spring=new DragSpring();
    this.noren=new NorenRenderer();
    this.pool=new PoolRenderer();
    this.openAmount=0;
    this.entranceSide=0;
    this.entranceGesture="pending";
    this.state="idle";
    this.transition=0;
    this.norenAlpha=1;
    this.bathAudioStarted=false;
    this.bucketTimer=0;
    initializeAudio(this);
  }

  enter(){
    const canvas=this.engine.renderer.canvas;
    this.drag=new DragController(canvas);
    this.waterHold=new WaterHoldController(canvas,{
      isEnabled:()=>this.state==="revealed",
      hitTest:(x,y)=>this.pool.waterPointAt(x,y,this.engine.width,this.engine.height),
      onTrigger:point=>{
        if(this.pool.triggerOverflow({origin:{u:point.u,v:point.v}}))this.playOverflowAudio?.();
      }
    });
    this.thermometerControl=new ThermometerController(canvas,{
      isEnabled:()=>this.state==="revealed",
      hitTest:(x,y)=>this.pool.thermometerHitTest(x,y,this.engine.width,this.engine.height),
      onTap:()=>{if(!this.pool.madmax.busy)this.pool.cycleTemperature();},
      onSwipe:()=>this.pool.toggleThermometerDisplay()
    });
    this.vibraSensorControl=new VibraSensorController(canvas,{
      isEnabled:()=>this.state==="revealed",
      hitTest:(x,y)=>this.pool.vibraSensorHitTest(x,y,this.engine.width,this.engine.height),
      onTrigger:()=>{
        if(this.pool.startVibra())this.startVibraAudio?.();
      }
    });
    this.madmaxControl=new MADMAXButtonController(canvas,{
      isEnabled:()=>this.state==="revealed"&&!this.pool.madmax.busy,
      hitTest:(x,y)=>this.pool.madmaxButtonHitTest(x,y,this.engine.width,this.engine.height),
      onPress:()=>this.pool.pressMADMAX(),
      onCancel:()=>this.pool.cancelMADMAXPress(),
      onActivate:()=>{
        if(this.pool.activateMADMAX())this.playMADMAXCountdownAudio?.();
      }
    });
    this.spring.snap(0);
    this.state="idle";
  }

  update(dt){
    if(this.drag.committed&&this.state!=="entering"&&this.state!=="revealed"){
      this.playEntranceAudio?.(this.drag.energetic);
      this.entranceSide=this.drag.side;
      this.entranceGesture=this.drag.gesture;
      this.state="entering";this.transition=0;this.camera.moveToZoom(1.22,1200);
    }
    const committedTarget=this.entranceGesture==="tap" ? .55 : 1;
    this.spring.setTarget(this.state==="entering"||this.state==="revealed"?committedTarget:this.drag.progress);
    this.spring.update(dt);
    this.openAmount=this.spring.value;
    if(this.state==="entering"){
      this.transition=Math.min(1,this.transition+dt/1500);
      this.camera.update(dt);
      if(this.transition>=1)this.state="revealed";
    }
    if(this.transition>=.52)this.startBathAudio?.();
    this.norenAlpha=1-this.#smooth(this.#range(this.transition,.08,.55));
    this.noren.update(dt,this,this.engine.width,this.engine.height);
    this.pool.update(dt);
    const vibraActive=this.pool.vibraSensor.active;
    if(this.vibraWasActive&&!vibraActive)this.stopVibraAudio?.();
    this.vibraWasActive=vibraActive;
    const madmaxFalling=this.pool.madmax.falling;
    if(!this.madmaxWasFalling&&madmaxFalling)this.startMADMAXWaterAudio?.();
    if(this.madmaxWasFalling&&!madmaxFalling)this.stopMADMAXWaterAudio?.();
    this.madmaxWasFalling=madmaxFalling;
    this.waterHold.update(dt);
    if(this.state==="revealed"&&this.drag.dragging&&!this.waterHold.triggered){
      const x=this.drag.pointerX*this.engine.width;
      const y=this.drag.pointerY*this.engine.height;
      const power=this.waterHold.active ? .022 : .045;
      this.pool.disturbAt(x,y,this.engine.width,this.engine.height,power);
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
  }

  leave(){
    window.clearTimeout(this.bucketTimer);
    this.removeAudioVisibilityListener?.();
    this.waterHold?.destroy();
    this.thermometerControl?.destroy();
    this.vibraSensorControl?.destroy();
    this.madmaxControl?.destroy();
    this.stopVibraAudio?.();
    this.stopMADMAXAudio?.();
    this.audio?.fadeOut("bath",400);
  }

  #range(value,start,end){return Math.max(0,Math.min(1,(value-start)/(end-start)));}
  #smooth(t){return t*t*(3-2*t);}
}

import { AudioManager } from "../audio/AudioManager.js?v=0012c";

/**
 * Patch 0013 additions for EntranceScene.
 * Integrates AudioManager bootstrap.
 */
export function initializeAudio(scene){
  scene.audio = new AudioManager();

  const asset=(name)=>new URL(`../../assets/se/${name}`,import.meta.url).href;
  scene.audio.register("noren",asset("Packaging_Air_Cushion01-13(Far-Rustle).mp3"),{volume:.72});
  scene.audio.register("bath",asset("arunangshubanerjee-loopable-bathing-sound-gentle-water-movement-and-splashing-ambience-336621.mp3"),{loop:true,volume:.28});
  scene.audio.register("bucket",asset("Hurooke01-1.mp3"),{volume:.42});
  scene.audio.register("welcome",asset("notanomori_201411211251280003.wav"),{volume:.72});
  scene.audio.register("vibra",asset("freesound_community-c02-bubbles-edit-35380.mp3"),{
    loop:true,loopStart:1,loopEndOffset:1,volume:.46
  });
  scene.audio.register("madmax-countdown",asset("freesound_community-robotic-countdown-43935.mp3"),{volume:.72});
  scene.audio.register("madmax-waterfall",asset("waterfall.mp3"),{volume:.82});
  for(let voice=1;voice<=3;voice++){
    scene.audio.register(`overflow-${voice}`,asset("u_moo3yn7s9y-big-splash-sound-202450.mp3"),{volume:.76});
  }
  scene.overflowVoice=0;
  scene.audioPausedByVisibility=false;
  scene.audioVisibilityResumePending=false;
  scene.audioVisibilityGeneration=0;
  scene.audioVisibilityRetryCount=0;
  scene.audioVisibilityRetryTimer=0;

  const canvas = scene.engine.renderer.canvas;
  const startOverlay=document.getElementById("audio-start");
  const startLabel=document.getElementById("audio-start-label");

  const removeUnlockListeners=()=>{
    canvas.removeEventListener("touchend",unlockTouch);
    canvas.removeEventListener("click",unlock);
    canvas.removeEventListener("pointerup",unlockPointer);
  };
  const unlock = async () => {
    const ready=await scene.audio.unlock();
    if(ready)removeUnlockListeners();
  };
  const unlockTouch=()=>unlock();
  const unlockPointer=event=>{if(event.pointerType!=="touch")unlock();};

  // iOS grants Web Audio activation most reliably from the native touchend event.
  canvas.addEventListener("touchend",unlockTouch,{passive:true});
  canvas.addEventListener("click",unlock);
  canvas.addEventListener("pointerup",unlockPointer);

  const removeVisibilityRetry=()=>{
    canvas.removeEventListener("touchend",retryVisibleAudio);
    canvas.removeEventListener("click",retryVisibleAudio);
    canvas.removeEventListener("pointerup",retryVisibleAudioPointer);
  };
  const resumeVisibleAudio=async()=>{
    if(document.hidden||!scene.audioPausedByVisibility||scene.audioVisibilityResumePending)return;
    const generation=scene.audioVisibilityGeneration;
    scene.audioVisibilityRetryCount+=1;
    scene.audioVisibilityResumePending=true;
    const ready=await scene.audio.resume({recover:true});
    scene.audioVisibilityResumePending=false;
    if(document.hidden||generation!==scene.audioVisibilityGeneration){
      scene.audio.suspend();
      return;
    }
    if(!ready){
      canvas.addEventListener("touchend",retryVisibleAudio,{passive:true});
      canvas.addEventListener("click",retryVisibleAudio);
      canvas.addEventListener("pointerup",retryVisibleAudioPointer);
      if(scene.audioVisibilityRetryCount<3){
        window.clearTimeout(scene.audioVisibilityRetryTimer);
        scene.audioVisibilityRetryTimer=window.setTimeout(resumeVisibleAudio,500*scene.audioVisibilityRetryCount);
      }
      return;
    }
    removeVisibilityRetry();
    scene.audioPausedByVisibility=false;
    scene.audioVisibilityRetryCount=0;
    if(scene.bathAudioStarted){
      scene.audio.fadeIn("bath",500);
      scheduleBucket(scene);
    }
    if(scene.pool?.vibraSensor.active)scene.audio.play("vibra");
    const madmax=scene.pool?.madmax;
    if(madmax?.state==="countdown")scene.audio.playSegment("madmax-countdown",madmax.elapsed/1000);
    if(madmax?.falling){
      const offset=10+(madmax.elapsed-3000)/1000;
      scene.audio.playSegment("madmax-waterfall",offset,30.041,{volume:.82});
    }
  };
  const retryVisibleAudio=()=>resumeVisibleAudio();
  const retryVisibleAudioPointer=event=>{if(event.pointerType!=="touch")resumeVisibleAudio();};
  const onVisibilityChange=()=>{
    scene.audioVisibilityGeneration+=1;
    if(document.hidden){
      window.clearTimeout(scene.bucketTimer);
      window.clearTimeout(scene.audioVisibilityRetryTimer);
      scene.bucketTimer=0;
      removeVisibilityRetry();
      scene.audioPausedByVisibility=scene.audio.ready;
      scene.audio.stopAll();
      scene.audio.suspend();
      return;
    }
    scene.audioVisibilityRetryCount=0;
    resumeVisibleAudio();
  };
  document.addEventListener("visibilitychange",onVisibilityChange);
  scene.removeAudioVisibilityListener=()=>{
    document.removeEventListener("visibilitychange",onVisibilityChange);
    window.clearTimeout(scene.audioVisibilityRetryTimer);
    removeVisibilityRetry();
  };

  if(startOverlay&&startLabel){
    scene.markEntranceReady=()=>{
      if(startOverlay.dataset.state!=="loading")return;
      startOverlay.dataset.state="ready";
      startOverlay.disabled=false;
      startLabel.textContent="Tap to start";
    };
    startOverlay.addEventListener("click",async()=>{
      if(startOverlay.dataset.state!=="ready")return;
      startOverlay.dataset.state="preparing";
      startOverlay.disabled=true;
      startLabel.textContent="";
      const ready=await scene.audio.unlock();
      if(!ready){
        startOverlay.dataset.state="ready";
        startOverlay.disabled=false;
        startLabel.textContent="Tap to start";
        return;
      }
      removeUnlockListeners();
      startOverlay.classList.add("is-leaving");
      window.setTimeout(()=>{startOverlay.hidden=true;},230);
    });
  }

  scene.playEntranceAudio=async(energetic=false)=>{
    await scene.audio.unlock();
    scene.audio.play("noren");
    window.setTimeout(()=>scene.audio.fadeOut("noren",100),650);
    if(energetic){
      window.setTimeout(()=>scene.audio.play("welcome"),280);
    }
  };

  scene.startBathAudio=()=>{
    if(scene.bathAudioStarted)return;
    scene.bathAudioStarted=true;
    scene.audio.fadeIn("bath",1400);
    scheduleBucket(scene,3500,7000);
  };

  scene.playOverflowAudio=()=>{
    scene.overflowVoice=scene.overflowVoice%3+1;
    scene.audio.playSegment(`overflow-${scene.overflowVoice}`,2,6,{volume:.76});
  };

  scene.startVibraAudio=()=>scene.audio.play("vibra");
  scene.stopVibraAudio=()=>scene.audio.stop("vibra");
  scene.playMADMAXCountdownAudio=()=>scene.audio.play("madmax-countdown");
  scene.startMADMAXWaterAudio=()=>scene.audio.playSegment("madmax-waterfall",10,30.041,{volume:.82});
  scene.stopMADMAXWaterAudio=()=>scene.audio.stop("madmax-waterfall");
  scene.stopMADMAXAudio=()=>{
    scene.audio.stop("madmax-countdown");scene.audio.stop("madmax-waterfall");
  };
}

function scheduleBucket(scene,minDelay=18000,maxDelay=36000){
  window.clearTimeout(scene.bucketTimer);
  const delay=minDelay+Math.random()*(maxDelay-minDelay);
  scene.bucketTimer=window.setTimeout(async()=>{
    if(!scene.active||document.hidden)return;
    await scene.audio.play("bucket");
    scheduleBucket(scene);
  },delay);
}

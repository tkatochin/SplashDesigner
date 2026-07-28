import { AudioManager } from "../audio/AudioManager.js?v=0007c";

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
  for(let voice=1;voice<=3;voice++){
    scene.audio.register(`overflow-${voice}`,asset("u_moo3yn7s9y-big-splash-sound-202450.mp3"),{volume:.76});
  }
  scene.overflowVoice=0;

  const canvas = scene.engine.renderer.canvas;

  const unlock = async () => {
    const ready=await scene.audio.unlock();
    if(ready){
      canvas.removeEventListener("pointerup",unlock);
    }
  };

  // Mobile browser modes reliably grant media activation when the gesture completes.
  // Keep the listener until an attempt succeeds so a rejected gesture can be retried.
  canvas.addEventListener("pointerup",unlock);

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
}

function scheduleBucket(scene,minDelay=18000,maxDelay=36000){
  window.clearTimeout(scene.bucketTimer);
  const delay=minDelay+Math.random()*(maxDelay-minDelay);
  scene.bucketTimer=window.setTimeout(async()=>{
    if(!scene.active)return;
    await scene.audio.play("bucket");
    scheduleBucket(scene);
  },delay);
}

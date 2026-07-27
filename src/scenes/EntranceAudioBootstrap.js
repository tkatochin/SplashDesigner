import { AudioManager } from "../audio/AudioManager.js";

/**
 * Patch 0013 additions for EntranceScene.
 * Integrates AudioManager bootstrap.
 */
export function initializeAudio(scene){
  scene.audio = new AudioManager();

  const canvas = scene.engine.renderer.canvas;

  const unlock = async () => {
    await scene.audio.unlock();
    scene.audio.vibrate(12);
    canvas.removeEventListener("pointerdown", unlock);
  };

  canvas.addEventListener("pointerdown", unlock, { once:true });
}

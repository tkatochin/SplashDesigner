/**
 * AudioManager
 * Unlocks WebAudio after the user's first interaction.
 */
export class AudioManager {
  constructor() {
    this.context = null;
    this.unlocked = false;
  }

  async unlock() {
    if (this.unlocked) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;

    this.context = new Ctx();
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
    this.unlocked = true;
  }

  vibrate(ms=20){
    if(navigator.vibrate){
      navigator.vibrate(ms);
    }
  }

  get ready(){
    return this.unlocked;
  }
}

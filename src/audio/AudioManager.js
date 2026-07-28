/**
 * AudioManager
 * Unlocks WebAudio after the user's first interaction.
 */
export class AudioManager {
  constructor() {
    this.context = null;
    this.unlocked = false;
    this.sounds = new Map();
    this.fades = new Map();
    this.unlocking = null;
  }

  register(key, url, options = {}) {
    if (this.sounds.has(key)) return this.sounds.get(key);
    const audio = new Audio(url);
    audio.preload = "auto";
    audio.loop = options.loop ?? false;
    audio.volume = Math.max(0, Math.min(1, options.volume ?? 1));
    this.sounds.set(key, { audio, defaultVolume: audio.volume });
    return audio;
  }

  async unlock() {
    if (this.unlocked) return true;
    if (this.unlocking) return this.unlocking;
    this.unlocking = this.#unlock().finally(() => {
      if (!this.unlocked) this.unlocking = null;
    });
    return this.unlocking;
  }

  async #unlock() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(Ctx)this.context ??= new Ctx();

    // Start every gated operation synchronously while transient user activation exists.
    // In particular, resume WebAudio before an HTMLMediaElement play can consume it.
    const resume = this.context?.state === "suspended"
      ? this.context.resume().then(()=>true).catch(()=>false)
      : Promise.resolve(Boolean(this.context));
    const primes=[];
    for(const sound of this.sounds.values()){
      const {audio}=sound;
      audio.muted=true;
      primes.push(audio.play().then(()=>true).catch(()=>false));
    }

    const [contextReady,...mediaReady]=await Promise.all([resume,...primes]);
    for(const sound of this.sounds.values()){
      const {audio}=sound;
      audio.pause();
      audio.currentTime=0;
      audio.muted=false;
    }
    this.unlocked=primes.length>0 ? mediaReady.some(Boolean) : contextReady||!Ctx;
    return this.unlocked;
  }

  async play(key, options = {}) {
    const sound = this.sounds.get(key);
    if (!sound || !this.unlocked) return false;
    const { audio, defaultVolume } = sound;
    this.#cancelFade(key);
    audio.loop = options.loop ?? audio.loop;
    audio.volume = Math.max(0, Math.min(1, options.volume ?? defaultVolume));
    if (options.restart ?? true) audio.currentTime = 0;
    try {
      await audio.play();
      return true;
    } catch {
      return false;
    }
  }

  stop(key) {
    const sound = this.sounds.get(key);
    if (!sound) return;
    this.#cancelFade(key);
    sound.audio.pause();
    sound.audio.currentTime = 0;
  }

  async fadeIn(key, duration = 1200) {
    const sound = this.sounds.get(key);
    if (!sound) return false;
    const target = sound.defaultVolume;
    sound.audio.volume = 0;
    const started = await this.play(key, { restart: false, volume: 0 });
    if (!started) return false;
    this.#fade(key, 0, target, duration);
    return true;
  }

  fadeOut(key, duration = 500) {
    const sound = this.sounds.get(key);
    if (!sound || sound.audio.paused) return;
    this.#fade(key, sound.audio.volume, 0, duration, () => this.stop(key));
  }

  #fade(key, from, to, duration, done) {
    this.#cancelFade(key);
    const sound = this.sounds.get(key);
    if (!sound) return;
    const startedAt = performance.now();
    const tick = now => {
      const progress = Math.min(1, (now - startedAt) / Math.max(1, duration));
      sound.audio.volume = from + (to - from) * progress;
      if (progress < 1) {
        this.fades.set(key, requestAnimationFrame(tick));
      } else {
        this.fades.delete(key);
        done?.();
      }
    };
    this.fades.set(key, requestAnimationFrame(tick));
  }

  #cancelFade(key) {
    const frame = this.fades.get(key);
    if (frame != null) cancelAnimationFrame(frame);
    this.fades.delete(key);
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

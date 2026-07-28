/** Unlocks and plays all app audio through one Web Audio context. */
export class AudioManager {
  constructor(){
    this.context=null;
    this.unlocked=false;
    this.unlocking=null;
    this.sounds=new Map();
    this.buffers=new Map();
    this.bufferPromises=new Map();
    this.nodes=new Map();
    this.fades=new Map();
    this.segmentTimers=new Map();
  }

  register(key,url,options={}){
    if(this.sounds.has(key))return this.sounds.get(key).audio;
    const audio=new Audio(url);
    audio.preload="auto";
    audio.loop=options.loop??false;
    audio.volume=this.#clamp(options.volume??1);
    this.sounds.set(key,{audio,url,loop:audio.loop,defaultVolume:audio.volume});
    return audio;
  }

  async unlock(){
    if(this.unlocked)return true;
    if(this.unlocking)return this.unlocking;
    this.unlocking=this.#unlock().finally(()=>{
      if(!this.unlocked)this.unlocking=null;
    });
    return this.unlocking;
  }

  async #unlock(){
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(Ctx)this.context??=new Ctx();

    // Every gated operation starts synchronously inside touchend/click.
    const resume=this.context?.state==="suspended"
      ? this.context.resume().then(()=>this.context.state==="running").catch(()=>false)
      : Promise.resolve(this.context?.state==="running");

    // iOS Safari needs an actual Web Audio source to start inside the button click.
    // A one-sample silent buffer is enough and does not produce an audible sound.
    if(this.context){
      try{
        const silent=this.context.createBuffer(1,1,22050);
        const source=this.context.createBufferSource();
        source.buffer=silent;source.connect(this.context.destination);source.start(0);
      }catch{}
    }
    // Never prime real media elements when Web Audio is available. Some iOS
    // versions can audibly play them despite volume=0 after a reload.
    const fallbackPrimes=[];
    if(!this.context){
      for(const sound of this.sounds.values()){
        const {audio}=sound;
        audio.muted=true;
        fallbackPrimes.push(audio.play().then(()=>true).catch(()=>false));
      }
    }

    const [contextReady,...mediaReady]=await Promise.all([resume,...fallbackPrimes]);
    for(const sound of this.sounds.values()){
      sound.audio.pause();sound.audio.currentTime=0;sound.audio.muted=false;
      sound.audio.volume=sound.defaultVolume;
    }

    let decoded=0;
    if(contextReady){
      const results=await Promise.all([...this.sounds].map(async([key,sound])=>{
        try{
          const buffer=await this.#loadBuffer(sound.url);
          this.buffers.set(key,buffer);
          return true;
        }catch{return false;}
      }));
      decoded=results.filter(Boolean).length;
    }
    this.unlocked=decoded>0||mediaReady.some(Boolean);
    return this.unlocked;
  }

  async play(key,options={}){
    const sound=this.sounds.get(key);
    if(!sound||!this.unlocked)return false;
    const volume=this.#clamp(options.volume??sound.defaultVolume);
    const loop=options.loop??sound.loop;
    const restart=options.restart??true;
    this.#cancelFade(key);
    if(this.buffers.has(key))return this.#playBuffer(key,{volume,loop,restart});

    const {audio}=sound;
    audio.loop=loop;audio.volume=volume;
    if(restart)audio.currentTime=0;
    try{await audio.play();return true;}catch{return false;}
  }

  async playSegment(key,start=0,end=Infinity,options={}){
    const sound=this.sounds.get(key);
    if(!sound||!this.unlocked)return false;
    const volume=this.#clamp(options.volume??sound.defaultVolume);
    this.#cancelFade(key);
    if(this.buffers.has(key)){
      const duration=Number.isFinite(end)?Math.max(0,end-start):undefined;
      return this.#playBuffer(key,{volume,loop:false,restart:true,offset:Math.max(0,start),duration});
    }

    const {audio}=sound;
    this.#clearSegmentTimer(key);audio.pause();audio.currentTime=Math.max(0,start);
    audio.loop=false;audio.volume=volume;
    try{
      await audio.play();
      if(Number.isFinite(end)&&end>start){
        const stop=()=>{if(audio.currentTime>=end-.04)this.stop(key);};
        audio.addEventListener("timeupdate",stop);
        const timer=window.setTimeout(()=>{
          audio.removeEventListener("timeupdate",stop);this.stop(key);
        },(end-start)*1000+120);
        this.segmentTimers.set(key,{timer,stop});
      }
      return true;
    }catch{return false;}
  }

  stop(key){
    const sound=this.sounds.get(key);
    if(!sound)return;
    this.#cancelFade(key);this.#clearSegmentTimer(key);this.#stopNode(key);
    sound.audio.pause();sound.audio.currentTime=0;
  }

  async fadeIn(key,duration=1200){
    const sound=this.sounds.get(key);
    if(!sound)return false;
    const started=await this.play(key,{restart:false,volume:0});
    if(!started)return false;
    this.#fade(key,0,sound.defaultVolume,duration);
    return true;
  }

  fadeOut(key,duration=500){
    const sound=this.sounds.get(key);
    if(!sound)return;
    const node=this.nodes.get(key);
    if(!node&&sound.audio.paused)return;
    const from=node?.gain.gain.value??sound.audio.volume;
    this.#fade(key,from,0,duration,()=>this.stop(key));
  }

  async #loadBuffer(url){
    if(!this.bufferPromises.has(url)){
      this.bufferPromises.set(url,(async()=>{
        const response=await fetch(url);
        if(!response.ok)throw new Error(`Audio fetch failed: ${response.status}`);
        return this.context.decodeAudioData(await response.arrayBuffer());
      })());
    }
    return this.bufferPromises.get(url);
  }

  #playBuffer(key,{volume,loop,restart,offset=0,duration}={}){
    const existing=this.nodes.get(key);
    if(existing&&!restart){existing.gain.gain.value=volume;return true;}
    this.#stopNode(key);
    const source=this.context.createBufferSource();
    const gain=this.context.createGain();
    source.buffer=this.buffers.get(key);source.loop=loop;gain.gain.value=volume;
    source.connect(gain);gain.connect(this.context.destination);
    const node={source,gain};this.nodes.set(key,node);
    source.onended=()=>{if(this.nodes.get(key)===node)this.nodes.delete(key);};
    if(duration===undefined)source.start(0,offset);else source.start(0,offset,duration);
    return true;
  }

  #stopNode(key){
    const node=this.nodes.get(key);
    if(!node)return;
    try{node.source.stop();}catch{}
    node.source.disconnect();node.gain.disconnect();this.nodes.delete(key);
  }

  #fade(key,from,to,duration,done){
    this.#cancelFade(key);
    const sound=this.sounds.get(key);
    if(!sound)return;
    const startedAt=performance.now();
    const tick=now=>{
      const progress=Math.min(1,(now-startedAt)/Math.max(1,duration));
      const volume=from+(to-from)*progress;
      const node=this.nodes.get(key);
      if(node)node.gain.gain.value=volume;else sound.audio.volume=volume;
      if(progress<1)this.fades.set(key,requestAnimationFrame(tick));
      else{this.fades.delete(key);done?.();}
    };
    this.fades.set(key,requestAnimationFrame(tick));
  }

  #cancelFade(key){
    const frame=this.fades.get(key);
    if(frame!=null)cancelAnimationFrame(frame);
    this.fades.delete(key);
  }

  #clearSegmentTimer(key){
    const segment=this.segmentTimers.get(key);
    if(!segment)return;
    window.clearTimeout(segment.timer);
    this.sounds.get(key)?.audio.removeEventListener("timeupdate",segment.stop);
    this.segmentTimers.delete(key);
  }

  #clamp(value){return Math.max(0,Math.min(1,value));}

  vibrate(ms=20){if(navigator.vibrate)navigator.vibrate(ms);}
  get ready(){return this.unlocked;}
}

export default class VibraEffect{
  constructor(scene){
    this.scene=scene;
    this.enabled=false;
    this.elapsed=0;
  }
  start(){this.enabled=true;}
  stop(){this.enabled=false;}
  update(time,delta){
    if(!this.enabled)return;
    this.elapsed+=delta;
    const cam=this.scene.cameras?.main;
    if(cam){
      const x=Math.sin(this.elapsed*0.03)*0.8;
      const y=Math.cos(this.elapsed*0.025)*0.6;
      cam.setScroll(cam.scrollX+x,cam.scrollY+y);
    }
  }
}

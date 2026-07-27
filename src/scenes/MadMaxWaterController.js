export default class MadMaxWaterController {
  constructor(scene){
    this.scene=scene;
    this.enabled=false;
  }
  start(){
    this.enabled=true;
    console.log("[MADMAX] water start");
  }
  stop(){
    this.enabled=false;
    console.log("[MADMAX] water stop");
  }
  toggle(){
    this.enabled?this.stop():this.start();
  }
}

// Patch 0025
// SaunaEffectCoordinator
import MadMaxWaterController from "./MadMaxWaterController.js";
import RedAmbientLight from "./RedAmbientLight.js";
import BgmController from "./BgmController.js";
import VibraEffect from "./VibraEffect.js";

export default class SaunaEffectCoordinator {
  constructor(scene, audioManager){
    this.scene = scene;
    this.water = new MadMaxWaterController(scene);
    this.light = new RedAmbientLight(scene);
    this.bgm = new BgmController(audioManager);
    this.vibra = new VibraEffect(scene);
  }

  startMadMax(){
    this.water.start();
    this.light.fadeIn();
    this.bgm.fadeIn("bgm", 1500);
    this.vibra.start();
  }

  stopMadMax(){
    this.water.stop();
    this.light.fadeOut();
    this.bgm.fadeOut("bgm", 1500);
    this.vibra.stop();
  }

  update(time, delta){
    this.vibra.update(time, delta);
  }
}

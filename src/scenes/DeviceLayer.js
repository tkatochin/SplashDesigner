import { BubbleSensor } from "../devices/BubbleSensor.js";
import { MadMaxButton } from "../devices/MadMaxButton.js";

/**
 * DeviceLayer
 * Temporary integration layer for bath devices.
 */
export class DeviceLayer {
  constructor(){
    this.bubble=new BubbleSensor();
    this.madmax=new MadMaxButton();
  }

  render(ctx,time){
    this.bubble.render(ctx,140,88,time);
    this.madmax.update(time);
    this.madmax.render(ctx,260,80);
  }

  pointerDown(x,y,time){
    if(this.bubble.hitTest(x,y,140,88)){
      this.bubble.toggle();
      return true;
    }
    if(this.madmax.hitTest(x,y,260,80)){
      this.madmax.press(time);
      return true;
    }
    return false;
  }
}

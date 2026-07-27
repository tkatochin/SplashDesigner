/**
 * WaterThermometer
 * Interactive water temperature device.
 * Tap to toggle NORMAL <-> SINGLE.
 */
export class WaterThermometer {
  constructor() {
    this.single = false;
    this.normalTemp = 16;
    this.singleTemp = 9;
  }

  toggle() {
    this.single = !this.single;
  }

  get temperature() {
    return this.single ? this.singleTemp : this.normalTemp;
  }

  render(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = "#222";
    ctx.fillRect(x, y, 68, 96);
    ctx.fillStyle = "#7ff";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(this.temperature + "°", x+34, y+58);
    ctx.font = "12px sans-serif";
    ctx.fillText(this.single ? "SINGLE" : "NORMAL", x+34, y+80);
    ctx.restore();
  }

  hitTest(px,py,x,y){
    return px>=x && px<=x+68 && py>=y && py<=y+96;
  }
}

/**
 * MadMaxButton
 * Wall-mounted waterfall trigger.
 */
export class MadMaxButton {
  constructor() {
    this.pressed = false;
    this.pressDepth = 0;
    this.durationMs = 3000;
    this.startedAt = 0;
  }

  press(now = performance.now()) {
    this.pressed = true;
    this.pressDepth = 1;
    this.startedAt = now;
  }

  update(now = performance.now()) {
    if (!this.pressed) return;
    const t = (now - this.startedAt) / this.durationMs;
    this.pressDepth = Math.max(0, 1 - t);
    if (t >= 1) {
      this.pressed = false;
      this.pressDepth = 0;
    }
  }

  get active() {
    return this.pressed;
  }

  render(ctx,x,y){
    ctx.save();
    ctx.translate(x,y);
    ctx.fillStyle="#444";
    ctx.fillRect(-40,-16,80,32);
    ctx.fillStyle="#c62828";
    ctx.fillRect(-36+this.pressDepth*2,-12,72-this.pressDepth*4,24);
    ctx.fillStyle="white";
    ctx.font="bold 12px sans-serif";
    ctx.textAlign="center";
    ctx.fillText("MAD MAX",0,4);
    ctx.restore();
  }

  hitTest(px,py,x,y){
    return px>=x-40 && px<=x+40 && py>=y-16 && py<=y+16;
  }
}

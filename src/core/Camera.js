export class Camera {
  constructor() {
    this.zoom = 1.0;
    this._startZoom = 1.0;
    this._targetZoom = 1.0;
    this._duration = 0;
    this._elapsed = 0;
    this.forward = 0;
  }

  moveToZoom(zoom, duration = 0) {
    this._startZoom = this.zoom;
    this._targetZoom = zoom;
    this._duration = Math.max(0, duration);
    this._elapsed = 0;

    if (this._duration === 0) {
      this.zoom = zoom;
    }
  }

  update(dt) {
    if (this._elapsed >= this._duration || this._duration === 0) return;

    this._elapsed += dt;
    const t = Math.min(1, this._elapsed / this._duration);

    // SmoothStep
    const s = t * t * (3 - 2 * t);
    this.zoom = this._startZoom + (this._targetZoom - this._startZoom) * s;
    this.forward = s;
  }

  begin(ctx, width, height) {
    ctx.save();
    ctx.translate(width * 0.5, height * 0.5);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-width * 0.5, -height * 0.5);
  }

  end(ctx) {
    ctx.restore();
  }
}

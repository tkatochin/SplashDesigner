/**
 * DragSpring
 * Smoothly follows drag progress to give cloth inertia.
 */
export class DragSpring {
  constructor() {
    this.value = 0;
    this.target = 0;
    this.velocity = 0;
    this.stiffness = 18;
    this.damping = 0.82;
  }

  setTarget(v) {
    this.target = Math.max(0, Math.min(1, v));
  }

  update(dt) {
    const s = Math.min(dt / 1000, 0.05);
    const force = (this.target - this.value) * this.stiffness;
    this.velocity += force * s;
    this.velocity *= this.damping;
    this.value += this.velocity * s * 60;

    if (Math.abs(this.target - this.value) < 0.0001 && Math.abs(this.velocity) < 0.0001) {
      this.value = this.target;
      this.velocity = 0;
    }
  }

  snap(v) {
    this.value = v;
    this.target = v;
    this.velocity = 0;
  }
}

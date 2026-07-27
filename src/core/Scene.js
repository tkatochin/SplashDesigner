export class Scene {
  constructor(engine = null) {
    this.engine = engine;
    this.active = false;
  }

  _activate() {
    this.active = true;
    if (typeof this.enter === "function") {
      this.enter();
    }
  }

  _deactivate() {
    this.active = false;
    if (typeof this.leave === "function") {
      this.leave();
    }
  }

  enter() {}
  leave() {}
  update(dt) {}
  render(ctx) {}
}

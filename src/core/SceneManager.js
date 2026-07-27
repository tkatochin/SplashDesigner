/**
 * SceneManager
 * Owns the active scene and drives the update/render loop.
 */
export class SceneManager {
  constructor(engine){
    this.engine=engine;
    this.current=null;
  }

  change(scene){
    if(this.current){
      this.current.exit();
    }
    this.current=scene;
    this.current._activate();
  }

  update(deltaTime){
    if(!this.current) return;
    this.current.update(deltaTime);
  }

  render(ctx){
    if(!this.current) return;
    this.current.render(ctx);
  }
}

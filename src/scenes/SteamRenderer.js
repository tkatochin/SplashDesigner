
export default class SteamRenderer{
  constructor(scene){
    this.scene=scene;
    this.particles=[];
    this.running=false;
  }

  start(){
    if(this.running) return;
    this.running=true;
    this.timer=this.scene.time.addEvent({
      delay:120,
      loop:true,
      callback:()=>this.spawn()
    });
  }

  stop(){
    this.running=false;
    this.timer?.remove(false);
  }

  spawn(){
    const p=this.scene.add.circle(
      Phaser.Math.Between(80,720),
      520,
      Phaser.Math.Between(8,18),
      0xffffff,
      0.18
    );
    this.particles.push(p);

    this.scene.tweens.add({
      targets:p,
      y:Phaser.Math.Between(120,220),
      alpha:0,
      scale:2,
      duration:Phaser.Math.Between(2200,3200),
      onComplete:()=>{
        p.destroy();
        this.particles=this.particles.filter(x=>x!==p);
      }
    });
  }
}

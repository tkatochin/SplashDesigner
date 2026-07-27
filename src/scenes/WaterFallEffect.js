export default class WaterFallEffect{
  constructor(scene,x=400,y=40,height=420){
    this.scene=scene;
    this.x=x;
    this.y=y;
    this.height=height;
    this.graphics=scene.add.graphics();
    this.running=false;
  }

  start(){
    if(this.running) return;
    this.running=true;
    this.timer=this.scene.time.addEvent({
      delay:33,
      loop:true,
      callback:()=>this.draw()
    });
  }

  stop(){
    this.running=false;
    this.timer?.remove(false);
    this.graphics.clear();
  }

  draw(){
    this.graphics.clear();
    this.graphics.lineStyle(4,0x88ddff,0.7);
    for(let i=0;i<10;i++){
      const ox=(Math.random()-0.5)*24;
      this.graphics.beginPath();
      this.graphics.moveTo(this.x+ox,this.y);
      this.graphics.lineTo(this.x+ox,this.y+this.height);
      this.graphics.strokePath();
    }
  }
}

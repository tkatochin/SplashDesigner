export default class ControlPanelUI{
  constructor(scene){
    this.scene=scene;

    this.container=scene.add.container(16,16).setDepth(2000);

    const bg=scene.add.rectangle(0,0,240,180,0x000000,0.55)
      .setOrigin(0,0);

    this.temp=scene.add.text(12,12,"TEMP : 90°C",{fontSize:"20px",color:"#ffffff"});
    this.mode=scene.add.text(12,46,"MODE : READY",{fontSize:"18px",color:"#88ff88"});
    this.timer=scene.add.text(12,80,"TIME : 00:00",{fontSize:"18px",color:"#ffffff"});
    this.status=scene.add.text(12,114,"SYSTEM OK",{fontSize:"18px",color:"#66ccff"});

    this.container.add([bg,this.temp,this.mode,this.timer,this.status]);
  }

  setTemperature(v){
    this.temp.setText(`TEMP : ${v}°C`);
  }

  setMode(v){
    this.mode.setText(`MODE : ${v}`);
  }

  setTimer(sec){
    const m=String(Math.floor(sec/60)).padStart(2,"0");
    const s=String(sec%60).padStart(2,"0");
    this.timer.setText(`TIME : ${m}:${s}`);
  }

  setStatus(text){
    this.status.setText(text);
  }
}

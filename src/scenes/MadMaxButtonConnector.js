export default class MadMaxButtonConnector{
  constructor(button,effects){
    this.button=button;
    this.effects=effects;
    this.active=false;
  }

  onPressed(){
    this.active=!this.active;
    if(this.active){
      this.effects.startMadMax();
    }else{
      this.effects.stopMadMax();
    }
  }

  bind(){
    if(this.button?.on){
      this.button.on("pointerdown",()=>this.onPressed());
    }else if(this.button){
      this.button.onclick=()=>this.onPressed();
    }
  }
}

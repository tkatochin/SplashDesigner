export default class EventSequence {
  constructor(){
    this.state={};
  }

  async execute(step){
    switch(step.type){
      case "wait":
        await new Promise(r=>setTimeout(r, step.duration??0));
        break;
      case "callback":
        if(typeof step.fn==="function"){
          await step.fn(this.state);
        }
        break;
      case "state":
        this.state[step.key]=step.value;
        break;
      case "if":
        if(step.condition?.(this.state)){
          await this.play(step.then??[]);
        }
        break;
      case "parallel":
        await Promise.all((step.steps??[]).map(s=>this.execute(s)));
        break;
      default:
        console.warn("Unknown EventSequence step:",step.type);
    }
  }

  async play(sequence=[]){
    for(const step of sequence){
      await this.execute(step);
    }
  }
}

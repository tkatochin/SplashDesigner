export default class SettingsManager{
  constructor(storageKey="SplashDesigner"){
    this.storageKey=storageKey;
    this.settings={
      bgm:true,
      se:true,
      vibration:true,
      temperature:90
    };
  }

  load(){
    try{
      const data=localStorage.getItem(this.storageKey);
      if(data){
        this.settings={...this.settings,...JSON.parse(data)};
      }
    }catch(e){
      console.warn("Settings load failed",e);
    }
    return this.settings;
  }

  save(){
    try{
      localStorage.setItem(this.storageKey,JSON.stringify(this.settings));
    }catch(e){
      console.warn("Settings save failed",e);
    }
  }

  get(key){
    return this.settings[key];
  }

  set(key,value){
    this.settings[key]=value;
    this.save();
  }
}

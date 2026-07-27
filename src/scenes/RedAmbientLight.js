export default class RedAmbientLight{
 constructor(scene){
   this.scene=scene;
   this.level=0;
 }
 setLevel(v){
   this.level=Math.max(0,Math.min(1,v));
 }
 fadeIn(){this.setLevel(1);}
 fadeOut(){this.setLevel(0);}
 render(g){
   // TODO Phaser Graphics overlay
 }
}

export default class TutorialOverlay{
  constructor(scene){
    this.scene=scene;

    this.container=scene.add.container(0,0).setDepth(5000).setVisible(false);

    const w=scene.scale.width;
    const h=scene.scale.height;

    const bg=scene.add.rectangle(0,0,w,h,0x000000,0.75).setOrigin(0);

    this.text=scene.add.text(
      w/2,h/2,
      "",
      {
        fontSize:"26px",
        color:"#ffffff",
        align:"center",
        wordWrap:{width:w-120}
      }
    ).setOrigin(0.5);

    this.container.add([bg,this.text]);

    bg.setInteractive();
    bg.on("pointerdown",()=>this.hide());
  }

  show(message){
    this.text.setText(message);
    this.container.setVisible(true)
  }

  hide(){
    this.container.setVisible(false);
  }
}

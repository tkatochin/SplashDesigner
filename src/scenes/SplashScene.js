
export default class SplashScene extends Phaser.Scene {
  constructor() {
    super("SplashScene");
    this.madmaxRunning = false;
  }

  create() {
    this.cameras.main.setBackgroundColor("#101820");

    this.title = this.add.text(24, 24, "Splash Designer", {
      fontSize: "28px",
      color: "#ffffff"
    });

    this.status = this.add.text(24, 70, "READY", {
      fontSize: "18px",
      color: "#88ff88"
    });

    this.startButton = this.add.text(24, 120, "[ START MADMAX ]", {
      fontSize: "22px",
      backgroundColor: "#cc0000",
      color: "#ffffff",
      padding: { left: 12, right: 12, top: 8, bottom: 8 }
    }).setInteractive();

    this.startButton.on("pointerdown", () => this.startMadMax());
  }

  startMadMax() {
    if (this.madmaxRunning) return;

    this.madmaxRunning = true;
    this.status.setText("MADMAX RUNNING");

    this.events.emit("madmax-start");

    this.time.delayedCall(10000, () => {
      this.madmaxRunning = false;
      this.status.setText("READY");
      this.events.emit("madmax-end");
    });
  }
}

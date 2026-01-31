import BaseFightScene from "./BaseFightScene";

export default class PagodaScene extends BaseFightScene {
  constructor() {
    super("PagodaScene");
  }

  protected createStage(): void {
   // background (loaded in BootScene)
    this.add
      .image(400, 300, "bg-bridge")
      .setDisplaySize(800, 600)
      .setDepth(-10);

      const groundY = 450; // this stage's ground
    this.groundY = groundY; 

    // ground line (visual reference only)
    this.add
      .rectangle(400, 600, 800, 10, 0x444444)
      .setDepth(0);

      this.add
      .image(400, 300, "fg-bridge")
      .setDisplaySize(800, 600)
      .setDepth(2);
  }
}

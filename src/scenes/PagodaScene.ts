import BaseFightScene from "./BaseFightScene";

export default class PagodaScene extends BaseFightScene {
  constructor() {
    super("PagodaScene");
  }

  protected createStage(): void {
    // background (loaded in BootScene), scaled down to 70%
    this.add
      .image(400, 300, "bg-pagoda")
      .setScale(0.5)
      .setDepth(-10);

    const groundY = 530; // this stage's ground
    this.groundY = groundY;

    // ground line (visual reference only)
    this.add
      .rectangle(400, 600, 800, 10, 0x444444)
      .setDepth(0);
  }
}

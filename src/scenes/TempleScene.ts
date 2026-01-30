import BaseFightScene from "./BaseFightScene";

export default class TempleScene extends BaseFightScene {
  constructor() {
    super("TempleScene");
  }

  

  protected createStage(): void {
    
    // background (loaded in BootScene)
    this.add
      .image(400, 300, "bg-bamboo")
      .setDisplaySize(800, 600)
      .setDepth(-10);

      const groundY = 490; // this stage's ground
      this.groundY = groundY; 

    // ground line (visual reference only)
    this.add
      .rectangle(400, 600, 800, 10, 0x444444)
      .setDepth(0);

  }
}

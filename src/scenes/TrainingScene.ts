import BaseFightScene from "./BaseFightScene";

export default class TrainingScene extends BaseFightScene {
  constructor() {
    super("TrainingScene");
  }

  protected createStage() {
    this.add.rectangle(400, 300, 800, 600, 0x222222);

    // ground line (visual only for now)
    this.add.rectangle(400, 600, 800, 10, 0x444444);
  }
}

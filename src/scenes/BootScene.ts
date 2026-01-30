import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.image(
      "bg-training",
      "assets/backgrounds/pondbg.png"
    );
    this.load.image(
      "fg-training",
      "assets/backgrounds/pondfg.png"
    );
    this.load.image(
      "bg-pagoda",
      "assets/backgrounds/dojobg.png"
    );
    this.load.image(
      "bg-temple",
      "assets/backgrounds/templebg.png"
    );
    this.load.image(
      "bg-bamboo",
      "assets/backgrounds/bamboobg.png"
    );
    this.load.spritesheet("player_idle", "assets/animations/player_idle.png", {
        frameWidth: 150,
        frameHeight: 150, 
    });

    this.load.spritesheet("loadingscreen", "assets/animations/load.png", {
      frameWidth: 800,
      frameHeight: 600,
    });
    // this.load.spritesheet("player_run", "assets/player_run.png", {
    // frameWidth: 150,
    // frameHeight: 150,
    // });
    // this.load.spritesheet("player_block", "assets/player_block.png", {
    // frameWidth: 150,
    // frameHeight: 150,
    // });
    // this.load.spritesheet("player_low_light", "assets/player_low_light.png", {
    // frameWidth: 200,
    // frameHeight: 150,
    // });
    // this.load.spritesheet("player_dash_back", "assets/player_back.png", {
    //     frameWidth: 150,
    //     frameHeight: 150,
    // });
    // this.load.spritesheet("player_mid_light", "assets/player_mid_light.png", {
    //     frameWidth: 200,
    //     frameHeight: 150,
    // });
    // this.load.spritesheet("player_low_heavy", "assets/player_low_heavy.png", {
    //     frameWidth: 200,
    //     frameHeight: 150, 
    // });
    // this.load.spritesheet("player_high_heavy", "assets/player_high_heavy.png", {
    //     frameWidth: 200,
    //     frameHeight: 210, 
    // });
    // this.load.spritesheet("player_high_light", "assets/player_high_light.png", {
    //     frameWidth: 200,
    //     frameHeight: 197, 
    // });
  }

  create() {
    this.scene.start("MainMenu");
  }
}

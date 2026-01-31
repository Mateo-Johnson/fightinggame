import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {

    this.load.spritesheet("p1_idle_0", "assets/animations/p1/idle/idle_0.png", {
        frameWidth: 111,
        frameHeight: 138, 
    });
    this.load.spritesheet("p1_idle_1", "assets/animations/p1/idle/idle_1.png", {
        frameWidth: 111,
        frameHeight: 138, 
    });
    this.load.spritesheet("p1_idle_2", "assets/animations/p1/idle/idle_2.png", {
        frameWidth: 111,
        frameHeight: 138, 
    });
    this.load.spritesheet("p1_idle_3", "assets/animations/p1/idle/idle_3.png", {
        frameWidth: 111,
        frameHeight: 138, 
    });
    this.load.spritesheet("p1_idle_4", "assets/animations/p1/idle/idle_4.png", {
        frameWidth: 111,
        frameHeight: 138, 
    });
    this.load.spritesheet("p1_idle_5", "assets/animations/p1/idle/idle_5.png", {
        frameWidth: 111,
        frameHeight: 138, 
    });
    this.load.spritesheet("p1_idle_6", "assets/animations/p1/idle/idle_6.png", {
        frameWidth: 111,
        frameHeight: 138, 
    });
    this.load.spritesheet("p1_idle_7", "assets/animations/p1/idle/idle_7.png", {
        frameWidth: 111,
        frameHeight: 138, 
    });
    this.load.spritesheet("p1_idle_8", "assets/animations/p1/idle/idle_8.png", {
        frameWidth: 111,
        frameHeight: 138, 
    });

    // walks
    this.load.spritesheet("p1_walk_0", "assets/animations/p1/walk/walk_0.png", {
        frameWidth: 116,
        frameHeight: 138, 
    });
    this.load.spritesheet("p1_walk_1", "assets/animations/p1/walk/walk_1.png", {
        frameWidth: 116,
        frameHeight: 138, 
    });
    this.load.spritesheet("p1_walk_2", "assets/animations/p1/walk/walk_2.png", {
        frameWidth: 116,
        frameHeight: 138, 
    });
    this.load.spritesheet("p1_walk_3", "assets/animations/p1/walk/walk_3.png", {
        frameWidth: 116,
        frameHeight: 138, 
    });
    this.load.spritesheet("p1_walk_4", "assets/animations/p1/walk/walk_4.png", {
        frameWidth: 116,
        frameHeight: 138, 
    });
    this.load.spritesheet("p1_walk_5", "assets/animations/p1/walk/walk_5.png", {
        frameWidth: 116,
        frameHeight: 138, 
    });
    this.load.spritesheet("p1_walk_6", "assets/animations/p1/walk/walk_6.png", {
        frameWidth: 116,
        frameHeight: 138, 
    });
    this.load.spritesheet("p1_walk_7", "assets/animations/p1/walk/walk_7.png", {
        frameWidth: 116,
        frameHeight: 138, 
    });
    this.load.spritesheet("p1_walk_8", "assets/animations/p1/walk/walk_8.png", {
        frameWidth: 116,
        frameHeight: 138, 
    });

    this.load.spritesheet("p2_idle_0", "assets/animations/p2/idle/idle_0.png", {
        frameWidth: 95,
        frameHeight: 155, 
    });
    this.load.spritesheet("p2_idle_1", "assets/animations/p2/idle/idle_1.png", {
        frameWidth: 95,
        frameHeight: 155, 
    });
    this.load.spritesheet("p2_idle_2", "assets/animations/p2/idle/idle_2.png", {
        frameWidth: 95,
        frameHeight: 155, 
    });
    this.load.spritesheet("p2_idle_3", "assets/animations/p2/idle/idle_3.png", {
        frameWidth: 95,
        frameHeight: 155, 
    });
    this.load.spritesheet("p2_idle_4", "assets/animations/p2/idle/idle_4.png", {
        frameWidth: 95,
        frameHeight: 155, 
    });
    this.load.spritesheet("p2_idle_5", "assets/animations/p2/idle/idle_5.png", {
        frameWidth: 95,
        frameHeight: 155, 
    });
    this.load.spritesheet("p2_idle_6", "assets/animations/p2/idle/idle_6.png", {
        frameWidth: 95,
        frameHeight: 155, 
    });
    this.load.spritesheet("p2_idle_7", "assets/animations/p2/idle/idle_7.png", {
        frameWidth: 95,
        frameHeight: 155, 
    });
    this.load.spritesheet("p2_idle_8", "assets/animations/p2/idle/idle_8.png", {
        frameWidth: 95,
        frameHeight: 155, 
    });

    this.load.spritesheet("p2_walk_0", "assets/animations/p2/walk/walk_0.png", {
        frameWidth: 99,
        frameHeight: 160, 
    });
    this.load.spritesheet("p2_walk_1", "assets/animations/p2/walk/walk_1.png", {
        frameWidth: 99,
        frameHeight: 160, 
    });
    this.load.spritesheet("p2_walk_2", "assets/animations/p2/walk/walk_2.png", {
        frameWidth: 99,
        frameHeight: 160, 
    });
    this.load.spritesheet("p2_walk_3", "assets/animations/p2/walk/walk_3.png", {
        frameWidth: 99,
        frameHeight: 160, 
    });
    this.load.spritesheet("p2_walk_4", "assets/animations/p2/walk/walk_4.png", {
        frameWidth: 99,
        frameHeight: 160, 
    });
    this.load.spritesheet("p2_walk_5", "assets/animations/p2/walk/walk_5.png", {
        frameWidth: 99,
        frameHeight: 160, 
    });
    this.load.spritesheet("p2_walk_6", "assets/animations/p2/walk/walk_6.png", {
        frameWidth: 99,
        frameHeight: 160, 
    });
    this.load.spritesheet("p2_walk_7", "assets/animations/p2/walk/walk_7.png", {
        frameWidth: 99,
        frameHeight: 160, 
    });
    this.load.spritesheet("p2_walk_8", "assets/animations/p2/walk/walk_8.png", {
        frameWidth: 99,
        frameHeight: 160, 
    });


    this.load.spritesheet("p1_dash", "assets/animations/p1/run.png", {
        frameWidth: 107,
        frameHeight: 130, 
    });

    this.load.spritesheet("p1_block_high", "assets/animations/p1/block_high.png", {
        frameWidth: 94,
        frameHeight: 116, 
    });
    this.load.spritesheet("p2_block_high", "assets/animations/p2/block_high.png", {
        frameWidth: 94,
        frameHeight: 173, 
    });

    this.load.spritesheet("p1_dead", "assets/animations/p1/dead.png", {
        frameWidth: 146,
        frameHeight: 132,
    });
    this.load.spritesheet("p2_dead", "assets/animations/p2/dead.png", {
        frameWidth: 194,
        frameHeight: 179,
    });

    this.load.spritesheet("p1_attack_light_mid", "assets/animations/p1/light_mid.png", {
        frameWidth: 197,
        frameHeight: 132, 
    });
    this.load.spritesheet("p2_attack_light_mid", "assets/animations/p2/light_mid.png", {
        frameWidth: 170,
        frameHeight: 159, 
    });



    this.load.image(
      "bg-training",
      "assets/backgrounds/pondbg.png"
    );
    this.load.image(
      "bg-bridge",
      "assets/backgrounds/bridgebg.png"
    );
    this.load.image(
      "fg-bridge",
      "assets/backgrounds/bridgefg.png"
    )
    this.load.image(
      "fg-training",
      "assets/backgrounds/pondfg.png"
    );
    this.load.image(
      "bg-bamboo",
      "assets/backgrounds/bamboobg.png"
    );

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

import MainMenu from "./scenes/MainMenu";
import TrainingScene from "./scenes/TrainingScene";
import BootScene from "./scenes/BootScene";
import TempleScene from "./scenes/TempleScene";
import PagodaScene from "./scenes/PagodaScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#1d1d1d",
  parent: "game",
  scene: [BootScene, MainMenu, TrainingScene, TempleScene, PagodaScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  }
};

new Phaser.Game(config);
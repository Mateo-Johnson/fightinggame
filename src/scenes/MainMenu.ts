import Phaser from "phaser";

export default class MainMenu extends Phaser.Scene {
  private options: Phaser.GameObjects.Text[] = [];
  private selectedIndex = 0;

  private readonly menuItems = [
    "Start Game",
    "Training",
    "Options",
    "Credits",
    "Quit"
  ];

  constructor() {
    super("MainMenu");
  }

  create() {
    const { width, height } = this.scale;

    // Title
    this.add.text(width / 2, 120, "my game", {
      fontSize: "48px",
      color: "#ffffff"
    }).setOrigin(0.5);

    // Menu items
    const startY = 220;
    const spacing = 50;

    this.menuItems.forEach((label, index) => {
      const text = this.add.text(width / 2, startY + index * spacing, label, {
        fontSize: "28px",
        color: "#888888"
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      // Mouse hover
      text.on("pointerover", () => {
        this.select(index);
      });

      // Mouse click
      text.on("pointerdown", () => {
        this.activate(index);
      });

      this.options.push(text);
    });

    this.updateSelection();

    // Keyboard input
    const keys = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER
    }) as any;

    keys.up.on("down", () => this.moveSelection(-1));
    keys.down.on("down", () => this.moveSelection(1));
    keys.enter.on("down", () => this.activate(this.selectedIndex));
  }

  private moveSelection(dir: number) {
    this.selectedIndex =
      (this.selectedIndex + dir + this.options.length) %
      this.options.length;

    this.updateSelection();
  }

  private select(index: number) {
    this.selectedIndex = index;
    this.updateSelection();
  }

  private updateSelection() {
    this.options.forEach((item, index) => {
      item.setColor(index === this.selectedIndex ? "#ffffff" : "#888888");
      item.setScale(index === this.selectedIndex ? 1.1 : 1.0);
    });
  }

  private activate(index: number) {
    const choice = this.menuItems[index];

    switch (choice) {
      case "Start Game":
        this.scene.start("GameScene");
        break;

      case "Training":
        this.scene.start("TrainingScene");
        break;

      case "Options":
        console.log("Options selected");
        break;

      case "Credits":
        console.log("Credits selected");
        break;

      case "Quit":
        console.log("Quit selected");
        break;
    }
  }
}

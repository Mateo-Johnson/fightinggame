import BaseFightScene from "./BaseFightScene";

/**
 * STAGE TEMPLATE
 *
 * Copy this file and rename it.
 * This class should ONLY define:
 * - visuals
 * - arena bounds
 * - camera behavior
 * - stage-specific hazards (optional)
 *
 * NEVER put combat logic here.
 */
export default class SceneTemplate extends BaseFightScene {
  constructor() {
    super("SceneTemplate");
  }

  protected createStage() {
    // ================= VISUALS =================
    // Background (placeholder)
    this.add.rectangle(400, 300, 800, 600, 0x111111);

    // Optional midground / foreground layers
    // this.add.rectangle(400, 200, 800, 200, 0x222222);

    // ================= ARENA =================
    // Visual ground (not physics)
    this.add.rectangle(400, 600, 800, 10, 0x333333);

    // World bounds (affects camera + movement if you clamp positions)
    this.physics.world.setBounds(0, 0, 800, 600);

    // ================= CAMERA =================
    const cam = this.cameras.main;
    cam.setBounds(0, 0, 800, 600);
    cam.centerOn(400, 300);
    cam.setZoom(1);

    // ================= STAGE RULES =================
    // Examples (disabled by default):
    //
    // this.enableWallClamp();
    // this.addHazards();
  }

  // ================= OPTIONAL HELPERS =================

  // Example: keep fighters inside arena
  protected enableWallClamp() {
    this.events.on("update", () => {
      this.player.sprite.x = Phaser.Math.Clamp(
        this.player.sprite.x,
        40,
        760
      );
      this.dummy.sprite.x = Phaser.Math.Clamp(
        this.dummy.sprite.x,
        40,
        760
      );
    });
  }

  // Example: stage-specific hazards
  protected addHazards() {
    // Stub only. Implement per stage.
    // e.g. lava floor, moving saw, wind zones
  }
}

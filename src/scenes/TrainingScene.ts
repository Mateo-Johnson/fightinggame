import Phaser from "phaser";
import Player from "../playable/Player";
import Dummy from "../playable/Dummy";

export default class TrainingScene extends Phaser.Scene {
  private player!: Player;
  private dummy!: Dummy;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: any;

  constructor() {
    super("TrainingScene");
  }

  create() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys({
      light: Phaser.Input.Keyboard.KeyCodes.Z,
      heavy: Phaser.Input.Keyboard.KeyCodes.X,
      block: Phaser.Input.Keyboard.KeyCodes.SPACE,
      dash: Phaser.Input.Keyboard.KeyCodes.F,
      parry: Phaser.Input.Keyboard.KeyCodes.C,
    });

    // Animations (unchanged, just trimmed here for sanity)
    this.anims.create({
      key: "player_idle",
      frames: this.anims.generateFrameNumbers("player_idle", { start: 0, end: 5 }),
      frameRate: 12,
      repeat: -1,
    });

    this.player = new Player(this, 200, 450);
    this.dummy = new Dummy(this, 500, 450);
  }

  update(_: number, delta: number) {
    const dt = delta / 1000;
    const input = { cursors: this.cursors, keys: this.keys };

    this.player.update(dt, input);
    this.dummy.update(dt);

    this.handlePlayerHits();
    this.handleDummyHits();
  }

  // ---------------- Player → Dummy ----------------

  private handlePlayerHits() {
    if (!this.player.isAttacking()) return;

    const attackBox = this.player.getAttackHitbox().getBounds();
    const dummyBox = this.dummy.getHitbox().getBounds();

    if (!Phaser.Geom.Intersects.RectangleToRectangle(attackBox, dummyBox)) {
      return;
    }

    const direction = this.player.getFacing();
    const damage = this.player.getAttackDamage();

    // You no longer have access to attack type here — on purpose.
    // If you want different knockback per attack, expose it from Player.
    const knockback = damage < 100 ? 200 : 450;
    const hitstun = damage < 100 ? 0.15 : 0.25;

    this.dummy.applyKnockback(direction, knockback, hitstun);
    this.dummy.applyDamage(damage);
  }

  // ---------------- Dummy → Player ----------------

private handleDummyHits() {
  if (!this.dummy.isAttacking()) return;

  const attackBox = this.dummy.getAttackHitbox().getBounds();

  // BLOCK CHECK
  if (this.player.blockHitbox.visible) {
    const blockBox = this.player.blockHitbox.getBounds();

    if (Phaser.Geom.Intersects.RectangleToRectangle(attackBox, blockBox)) {
      console.log("BLOCKED");
      return; // stop the hit here
    }
  }

  // NORMAL HIT
  const playerBox = this.player.sprite.getBounds();

  if (!Phaser.Geom.Intersects.RectangleToRectangle(attackBox, playerBox)) {
    return;
  }

  const direction = this.dummy.getFacing();

  this.player.applyHit(
    direction,
    160,
    0.15,
    20,
    false
  );
}
}

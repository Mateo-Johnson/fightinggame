import Phaser from "phaser";
import Player from "../playable/Player";
import Dummy from "../playable/Dummy";

export default abstract class BaseFightScene extends Phaser.Scene {
  protected player!: Player;
  protected dummy!: Dummy;

  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected keys!: any;

  private dummyAttackResolved = false;
  private playerAttackResolved = false;

  constructor(key: string) {
    super(key);
  }

  create() {
    this.setupInput();
    this.createStage(); // 👈 overridden by subclasses
    this.createFighters();
  }

  update(_: number, delta: number) {
    const dt = delta / 1000;
    const input = { cursors: this.cursors, keys: this.keys };

    this.player.update(dt, input);
    this.dummy.update(dt);

    if (!this.dummy.isAttacking()) this.dummyAttackResolved = false;
    if (!this.player.isAttacking()) this.playerAttackResolved = false;

    this.resolveCombat();
  }

  // ---------- INPUT ----------
  protected setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys({
      light: Phaser.Input.Keyboard.KeyCodes.Z,
      heavy: Phaser.Input.Keyboard.KeyCodes.X,
      block: Phaser.Input.Keyboard.KeyCodes.SPACE,
      dash: Phaser.Input.Keyboard.KeyCodes.F,
      parry: Phaser.Input.Keyboard.KeyCodes.C,
    });
  }

  // ---------- FIGHTERS ----------
  protected createFighters() {
    this.player = new Player(this, 200, 450);
    this.dummy = new Dummy(this, this.player, 500, 450);
  }

  // ---------- COMBAT ----------
  protected resolveCombat() {
    this.resolveDummyAttack();
    this.resolvePlayerAttack();
  }

  protected resolveDummyAttack() {
    if (!this.dummy.isAttacking() || this.dummyAttackResolved) return;

    const attackBox = this.dummy.getAttackHitbox().getBounds();

    if (this.player.blockHitbox.visible) {
      const blockBox = this.player.blockHitbox.getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(attackBox, blockBox)) {
        this.dummyAttackResolved = true;
        return;
      }
    }

    const playerBox = this.player.sprite.getBounds();
    if (!Phaser.Geom.Intersects.RectangleToRectangle(attackBox, playerBox)) return;

    this.dummyAttackResolved = true;

    const direction = this.player.sprite.x > this.dummy.sprite.x ? 1 : -1;

    this.player.applyHit(
      direction,
      160,
      0.15,
      20,
      false,
      this.dummy.getAttackStance()
    );
  }

  protected resolvePlayerAttack() {
    if (!this.player.isAttacking() || this.playerAttackResolved) return;

    const attackBox = this.player.getAttackHitbox().getBounds();
    const dummyBox = this.dummy.getHitbox().getBounds();

    if (!Phaser.Geom.Intersects.RectangleToRectangle(attackBox, dummyBox)) return;

    this.playerAttackResolved = true;

    const direction = this.dummy.sprite.x > this.player.sprite.x ? 1 : -1;
    const damage = this.player.getAttackDamage();

    const knockback = damage < 100 ? 200 : 450;
    const hitstun = damage < 100 ? 0.15 : 0.25;

    this.dummy.applyKnockback(direction, knockback, hitstun);
    this.dummy.applyDamage(damage);
  }

  // ---------- STAGE ----------
  protected abstract createStage(): void;
}

import Phaser from "phaser";
import Player from "../playable/Player";

export default abstract class BaseFightScene extends Phaser.Scene {
  protected player1!: Player;
  protected player2!: Player;

  private p1HealthText!: Phaser.GameObjects.Text;
  private p2HealthText!: Phaser.GameObjects.Text;

  constructor(key: string) {
    super(key);
  }

  create() {
    this.createStage(); // implemented in subclass
    this.createFighters();

    // Health display
    this.p1HealthText = this.add.text(20, 20, "", { fontSize: "20px", color: "#ffffff" });
    this.p2HealthText = this.add.text(500, 20, "", { fontSize: "20px", color: "#ff0000" });
  }

  update(_: number, delta: number) {
    const dt = delta / 1000;

    // Update both players
    this.player1.update(dt, this.player2);
    this.player2.update(dt, this.player1);

    // Resolve combat hits
    this.resolveHit(this.player1, this.player2);
    this.resolveHit(this.player2, this.player1);

    // Update health display
    this.p1HealthText.setText(`P1: ${this.player1.getHealth()}`);
    this.p2HealthText.setText(`P2: ${this.player2.getHealth()}`);
  }

  protected createFighters() {
    this.player1 = new Player(this, 200, 450, "p1");
    this.player2 = new Player(this, 600, 450, "p2");
  }

  private resolveHit(attacker: Player, defender: Player) {
    if (!attacker.isAttacking()) return;

    const attackBox = attacker.getAttackHitbox().getBounds();
    const defenderBox = defender.sprite.getBounds();

    if (!Phaser.Geom.Intersects.RectangleToRectangle(attackBox, defenderBox)) return;

    const direction = defender.sprite.x > attacker.sprite.x ? 1 : -1;
    const damage = attacker.getAttackDamage();
    const knockback = damage < 100 ? 160 : 250;
    const hitstun = damage < 100 ? 0.15 : 0.25;

    defender.applyHit(direction, knockback, hitstun, damage, false, attacker.getAttackStance());
  }

  protected abstract createStage(): void;
}

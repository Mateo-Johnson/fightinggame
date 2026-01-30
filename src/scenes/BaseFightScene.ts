import Phaser from "phaser";
import Player from "../playable/Player";

export default abstract class BaseFightScene extends Phaser.Scene {
  protected player1!: Player;
  protected player2!: Player;
  protected groundY!: number;

  private p1HealthText!: Phaser.GameObjects.Text;
  private p2HealthText!: Phaser.GameObjects.Text;

  create() {
    this.createStage();
    this.createFighters();

    this.p1HealthText = this.add.text(20, 20, "", {
      fontSize: "20px",
      color: "#ffffff",
    });

    this.p2HealthText = this.add.text(500, 20, "", {
      fontSize: "20px",
      color: "#ff0000",
    });
  }

  update(_: number, delta: number) {
    const dt = delta / 1000;

    this.player1.update(dt);
    this.player2.update(dt);

    this.resolveCombat(this.player1, this.player2);
    this.resolveCombat(this.player2, this.player1);

    this.keepPlayerInBounds(this.player1);
    this.keepPlayerInBounds(this.player2);

    this.p1HealthText.setText(`P1: ${this.player1.getHealth()}`);
    this.p2HealthText.setText(`P2: ${this.player2.getHealth()}`);
  }

  protected createFighters() {
    this.player1 = new Player(this, 200, this.groundY, "p1", this.groundY);
    this.player2 = new Player(this, 600, this.groundY, "p2", this.groundY);

    this.player1.opponent = this.player2;
    this.player2.opponent = this.player1;
  }

  private resolveCombat(attacker: Player, defender: Player) {
    const attack = attacker.getActiveAttack();
    if (!attack) return;

    const aBox = attacker.getAttackHitbox().getBounds();
    const dBox = defender.sprite.getBounds();

    if (!Phaser.Geom.Intersects.RectangleToRectangle(aBox, dBox)) return;

    attack.hasHit = true;
    defender.resolveIncomingAttack(attack);
  }

  protected abstract createStage(): void;

  private keepPlayerInBounds(player: Player) {
    const sprite = player.sprite;
    const leftLimit = 0;
    const rightLimit = this.scale.width;
    const halfWidth = sprite.displayWidth / 2;

    if (sprite.x - halfWidth < leftLimit) {
      sprite.x = leftLimit + halfWidth;
    } else if (sprite.x + halfWidth > rightLimit) {
      sprite.x = rightLimit - halfWidth;
    }

    const topLimit = 0;
    const bottomLimit = this.groundY;

    if (sprite.y - sprite.displayHeight / 2 < topLimit) {
      sprite.y = topLimit + sprite.displayHeight / 2;
    } else if (sprite.y > bottomLimit) {
      sprite.y = bottomLimit;
    }
  }
}

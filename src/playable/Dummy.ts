import Phaser from "phaser";

export type DummyState =
  | "idle"
  | "attack"
  | "block"
  | "hit"
  | "stagger"
  | "dead";

export default class Dummy {
  public sprite: Phaser.GameObjects.Rectangle;
  public hitbox: Phaser.GameObjects.Rectangle;
  public attackHitbox: Phaser.GameObjects.Rectangle;

  private state: DummyState = "idle";
  private facing: -1 | 1 = -1;

  private velocityY = 0;
  private knockbackX = 0;

  private readonly GRAVITY = 100;
  private readonly GROUND_Y = 573;

  private hitstun = 0;
  private hitstop = 0;

  private health = 120;

  private guard = 100;
  private readonly GUARD_MAX = 100;
  private guardBroken = false;
  private guardBreakTime = 0;

  // AI
  private actionTimer = 0;

  // attack timing
  private attackActiveTimer = 0;
  private attackTotalTimer = 0;
  private attackActive = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.rectangle(x, y, 50, 50, 0xff0000);
    this.hitbox = scene.add.rectangle(x, y, 40, 20, 0xff00ff).setVisible(false);

    this.attackHitbox = scene
      .add.rectangle(x, y, 60, 20, 0xffaa00)
      .setVisible(false);
  }

  update(dt: number) {
    if (this.state === "dead") return;

    if (this.hitstop > 0) {
      this.hitstop -= dt;
      return;
    }

    if (this.hitstun > 0) {
      this.hitstun -= dt;
      if (this.hitstun <= 0) this.state = "idle";
    }

    if (this.guardBroken) {
      this.guardBreakTime -= dt;
      if (this.guardBreakTime <= 0) {
        this.guardBroken = false;
        this.state = "idle";
      }
    }

    // gravity
    this.velocityY += this.GRAVITY * dt;
    this.sprite.y += this.velocityY;

    if (this.sprite.y >= this.GROUND_Y) {
      this.sprite.y = this.GROUND_Y;
      this.velocityY = 0;
    }

    // AI
    this.actionTimer -= dt;
    if (this.actionTimer <= 0) {
      this.chooseAction();
    }

    // attack timing
    if (this.state === "attack") {
      this.attackTotalTimer -= dt;

      if (!this.attackActive) {
        this.attackActiveTimer -= dt;
        if (this.attackActiveTimer <= 0) {
          this.attackActive = true;
          this.attackHitbox.setVisible(true);
        }
      } else {
        if (this.attackActiveTimer <= -0.12) {
          this.attackHitbox.setVisible(false);
          this.attackActive = false;
        }
      }

      this.updateAttackHitbox();
      if (this.attackTotalTimer <= 0) this.endAttack();
    }

    // keep hitbox following
    this.hitbox.x = this.sprite.x;
    this.hitbox.y = this.sprite.y;
  }

  private chooseAction() {
    this.actionTimer = Phaser.Math.Between(0.8, 2.0);

    const r = Phaser.Math.Between(0, 3);

    if (this.guardBroken) return;

    if (r === 0) this.startBlock();
    else if (r === 1) this.startAttack();
    else this.state = "idle";
  }

  private startAttack() {
    this.state = "attack";
    this.attackTotalTimer = 0.6;
    this.attackActiveTimer = 0.2;
    this.attackActive = false;
  }

  private endAttack() {
    this.state = "idle";
    this.attackHitbox.setVisible(false);
    this.attackActive = false;
  }

  private startBlock() {
    this.state = "block";
    this.actionTimer = 0.4;
  }

  public applyKnockback(direction: -1 | 1, force: number, hitstun: number) {
    if (this.state === "dead") return;
    this.state = "hit";
    this.knockbackX = direction * force;
    this.velocityY = -10;
    this.hitstun = hitstun;
    this.hitstop = 0.05;
  }

  public applyDamage(amount: number) {
    if (this.state === "dead") return;
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.state = "dead";
      this.hitbox.setVisible(false);
      this.attackHitbox.setVisible(false);
      this.sprite.setVisible(false);
    }
  }

  private updateAttackHitbox() {
    const x = this.sprite.x + this.facing * 40;
    this.attackHitbox.x = x;
    this.attackHitbox.y = this.sprite.y;
    this.attackHitbox.width = 60;
    this.attackHitbox.height = 20;
  }

  public getHitbox() {
    return this.hitbox;
  }

  public getAttackHitbox() {
    return this.attackHitbox;
  }

  public getFacing(): -1 | 1 {
    return this.facing;
  }

  public isAttacking() {
    return this.state === "attack" && this.attackActive;
  }

  public isBlocking() {
    return this.state === "block";
  }

  public isDead() {
    return this.state === "dead";
  }

  public getHealth() {
    return this.health;
  }

  public getGuard() {
    return this.guard;
  }
}

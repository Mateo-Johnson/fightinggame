import Phaser from "phaser";

export type Stance = "low" | "mid" | "high";
export type AttackType = "light" | "heavy";

type PlayerState =
  | "idle"
  | "dash"
  | "attack"
  | "block"
  | "parry"
  | "hit"
  | "stagger"
  | "dead";

export default class Player {
  private scene: Phaser.Scene;

  public sprite: Phaser.GameObjects.Sprite;
  public attackHitbox: Phaser.GameObjects.Rectangle;
  public blockHitbox: Phaser.GameObjects.Rectangle;

  private state: PlayerState = "idle";
  private facing: -1 | 1 = 1;
  private velocityY = 0;

  private dashTime = 0;
  private dashCooldown = 0;
  private dashDir: -1 | 1 = 1;
  private dashSpeed = 0;

  private attackCooldown = 0;
  private attackType: AttackType = "light";
  private attackStance: Stance = "mid";

  private blockTime = 0;
  private blockCooldown = 0;

  private stance: Stance = "mid";

  private combo = 0;
  private comboTimer = 0;

  private parryTime = 0;
  private parryCooldown = 0;

  private hitstop = 0;
  private hitstun = 0;

  private guard = 100;
  private readonly GUARD_MAX = 100;
  private guardBroken = false;
  private guardBreakTime = 0;

  private health = 100;

  private attackActiveTimer = 0;
  private attackActive = false;
  private attackTotalTimer = 0;

  private readonly SPEED = 200;
  private readonly GRAVITY = 100;
  private readonly GROUND_Y = 600;

  private readonly DASH_SPEED = 600;
  private readonly DASH_DURATION = 0.15;
  private readonly DASH_COOLDOWN = 0.5;

  private readonly BACK_DASH_SPEED = 300;
  private readonly BACK_DASH_DURATION = 0.1;

  private readonly LIGHT_COOLDOWN = 0.4;
  private readonly HEAVY_COOLDOWN = 1.0;

  private readonly BLOCK_DURATION = 0.2;
  private readonly BLOCK_COOLDOWN = 0.2;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    this.sprite = scene.add.sprite(x, y, "player_idle");
    this.sprite.setOrigin(0.5, 1);

    this.attackHitbox = scene.add.rectangle(0, 0, 60, 20, 0xffff00).setVisible(false);
    this.blockHitbox = scene.add.rectangle(0, 0, 40, 20, 0x00ff00).setVisible(false);
  }

  update(dt: number, input: any) {
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

    this.velocityY += this.GRAVITY * dt;
    this.sprite.y += this.velocityY;

    if (this.sprite.y >= this.GROUND_Y) {
      this.sprite.y = this.GROUND_Y;
      this.velocityY = 0;
    }

    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.blockCooldown = Math.max(0, this.blockCooldown - dt);
    this.parryCooldown = Math.max(0, this.parryCooldown - dt);

    this.comboTimer = Math.max(0, this.comboTimer - dt);
    if (this.comboTimer === 0) this.combo = 0;

    this.guard = Math.min(this.GUARD_MAX, this.guard + 15 * dt);

    if (input.cursors.up.isDown) this.stance = "high";
    else if (input.cursors.down.isDown) this.stance = "low";
    else this.stance = "mid";

    switch (this.state) {
      case "idle":
        this.handleMovement(input, dt);
        this.handleDash(input);
        this.handleBlock(input);
        this.handleParry(input);
        this.handleAttack(input);

        if (this.state !== "idle") break;

        if (input.cursors.left.isDown || input.cursors.right.isDown) {
          this.sprite.play("walk", true);
        } else {
          this.sprite.play("player_idle", true);
        }
        break;

      case "dash":
        this.dashTime -= dt;
        this.sprite.x += this.dashDir * this.dashSpeed * dt;
        this.sprite.play(this.dashDir === this.facing ? "run" : "player_dash_back", true);
        if (this.dashTime <= 0) this.state = "idle";
        break;

      case "block":
        this.blockTime -= dt;
        this.sprite.play("block", true);
        this.updateHitbox(this.blockHitbox);
        if (this.blockTime <= 0) this.endBlock();
        break;

      case "parry":
        this.parryTime -= dt;
        this.sprite.play("parry", true);
        if (this.parryTime <= 0) this.state = "idle";
        break;

      case "attack":
        this.attackTotalTimer -= dt;

        if (!this.attackActive) {
          this.attackActiveTimer -= dt;
          if (this.attackActiveTimer <= 0) {
            this.attackActive = true;
            this.attackHitbox.setVisible(true);
          }
        } else {
          // disable after active window ends
          if (this.attackActiveTimer <= -0.12) {
            this.attackHitbox.setVisible(false);
            this.attackActive = false;
          }
        }

        this.updateHitbox(this.attackHitbox);

        if (this.attackTotalTimer <= 0) {
          this.endAttack();
        }
        break;

      case "hit":
        // handled above by hitstun timer
        break;

      case "stagger":
        // same as hit but longer
        this.hitstun -= dt;
        if (this.hitstun <= 0) this.state = "idle";
        break;
    }

    this.sprite.setFlipX(this.facing === -1);
  }

  private handleMovement(input: any, dt: number) {
    if (input.cursors.left.isDown) {
      this.sprite.x -= this.SPEED * dt;
      this.facing = -1;
    }
    if (input.cursors.right.isDown) {
      this.sprite.x += this.SPEED * dt;
      this.facing = 1;
    }
  }

  private handleDash(input: any) {
    if (Phaser.Input.Keyboard.JustDown(input.keys.dash) && this.dashCooldown <= 0) {
      let dir = this.facing;
      let speed = this.DASH_SPEED;
      let duration = this.DASH_DURATION;

      if (
        (input.cursors.left.isDown && this.facing === 1) ||
        (input.cursors.right.isDown && this.facing === -1) ||
        (!input.cursors.left.isDown && !input.cursors.right.isDown)
      ) {
        dir = this.facing === 1 ? -1 : 1;
        speed = this.BACK_DASH_SPEED;
        duration = this.BACK_DASH_DURATION;
      }

      this.startDash(dir, speed, duration);
    }
  }

  private handleBlock(input: any) {
    if (Phaser.Input.Keyboard.JustDown(input.keys.block) && this.blockCooldown <= 0) {
      this.startBlock();
    }
  }

  private handleParry(input: any) {
    if (Phaser.Input.Keyboard.JustDown(input.keys.parry) && this.parryCooldown <= 0) {
      this.startParry();
    }
  }

  private handleAttack(input: any) {
    if (this.attackCooldown > 0) return;
    if (input.cursors.left.isDown || input.cursors.right.isDown) return;

    if (Phaser.Input.Keyboard.JustDown(input.keys.light)) this.startAttack("light");
    if (Phaser.Input.Keyboard.JustDown(input.keys.heavy)) this.startAttack("heavy");
  }

  private startDash(dir: -1 | 1, speed: number, duration: number) {
    this.state = "dash";
    this.dashDir = dir;
    this.dashSpeed = speed;
    this.dashTime = duration;
    this.dashCooldown = this.DASH_COOLDOWN;
  }

  private getAttackAnimKey(): string {
    return `player_${this.attackStance}_${this.attackType}`;
  }

  private startAttack(type: AttackType) {
    this.state = "attack";
    this.attackType = type;
    this.attackStance = this.stance;

    this.attackCooldown = type === "light" ? this.LIGHT_COOLDOWN : this.HEAVY_COOLDOWN;

    this.combo++;
    this.comboTimer = 0.6;

    this.attackTotalTimer = type === "light" ? 0.35 : 0.6;
    this.attackActiveTimer = type === "light" ? 0.12 : 0.18;
    this.attackActive = false;

    const animKey = this.getAttackAnimKey();
    this.sprite.play(animKey);
  }

  private endAttack() {
    this.state = "idle";
    this.attackHitbox.setVisible(false);
    this.attackActive = false;
  }

  private startBlock() {
    if (this.guardBroken) return;
    this.state = "block";
    this.blockTime = this.BLOCK_DURATION;
    this.blockCooldown = this.BLOCK_COOLDOWN;
    this.blockHitbox.setVisible(true);
  }

  private endBlock() {
    this.state = "idle";
    this.blockHitbox.setVisible(false);
  }

  private startParry() {
    if (this.guardBroken) return;
    this.state = "parry";
    this.parryTime = 0.15;
    this.parryCooldown = 0.6;
  }

  public applyHit(
    direction: -1 | 1,
    force: number,
    hitstun: number,
    damage: number,
    isAirborne: boolean
  ) {
    if (this.state === "dead") return;

    if (this.state === "parry") {
      this.state = "idle";
      this.hitstop = 0.08;
      return;
    }

    if (this.state === "block") {
      this.guard -= damage * 0.8;
      if (this.guard <= 0) {
        this.guardBroken = true;
        this.guardBreakTime = 0.8;
        this.state = "stagger";
        this.hitstun = 0.6;
      }
      return;
    }

    this.health -= damage;
    if (this.health <= 0) {
      this.health = 0;
      this.state = "dead";
      this.sprite.setVisible(false);
      this.attackHitbox.setVisible(false);
      this.blockHitbox.setVisible(false);
      return;
    }

    this.state = "hit";
    this.hitstun = hitstun;
    this.hitstop = 0.06;
    this.velocityY = isAirborne ? -180 : -120;
  }

  private updateHitbox(box: Phaser.GameObjects.Rectangle) {
    const offsetX = (this.sprite.displayWidth / 2) + (box.width / 2) - 90;
    const x = this.sprite.x + this.facing * offsetX;

    const baseY = this.sprite.y - this.sprite.displayHeight * 0.5;
    const stanceOffset = this.sprite.displayHeight * 0.25;

    if (this.state === "attack") {
      box.x = x;
      const stance = this.attackStance;

      if (stance === "high") box.y = baseY - stanceOffset;
      else if (stance === "low") box.y = baseY + stanceOffset;
      else box.y = baseY;

      box.x += this.facing * 10;
      box.width = 60;
      box.height = 20;
    } else if (this.state === "block") {
      box.x = x;

      if (this.stance === "high") box.y = baseY - stanceOffset * 0.5;
      else if (this.stance === "low") box.y = baseY + stanceOffset * 0.5;
      else box.y = baseY;

      box.x += this.facing * 5;
      box.width = 40;
      box.height = 30;
    }
  }

  public getFacing(): -1 | 1 {
    return this.facing;
  }

  public getAttackType(): AttackType {
    return this.attackType;
  }

  public isCurrentlyAttacking() {
    return this.state === "attack" && this.attackActive;
  }

  public getAttackHitbox() {
    return this.attackHitbox;
  }

  public isBlocking() {
    return this.state === "block";
  }

  public isParrying() {
    return this.state === "parry";
  }

  public getAttackDamage(): number {
    const base = this.attackType === "light" ? 60 : 120;
    const comboBonus = 1 + Math.min(0.5, this.combo * 0.1);
    return base * comboBonus;
  }

  public getGuard(): number {
    return this.guard;
  }

  public isDead() {
    return this.state === "dead";
  }
}

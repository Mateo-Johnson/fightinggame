import Phaser from "phaser";

export type Stance = "low" | "mid" | "high";
export type AttackType = "light" | "heavy";

type State =
  | "idle"
  | "dash"
  | "attack"
  | "block"
  | "parry"
  | "hit"
  | "dead";

type AttackPhase = "startup" | "active" | "recovery";

export default class Player {
  private scene: Phaser.Scene;

  public sprite: Phaser.GameObjects.Rectangle;
  public attackHitbox: Phaser.GameObjects.Rectangle;
  public blockHitbox: Phaser.GameObjects.Rectangle;

  private state: State = "idle";
  private facing: -1 | 1 = 1;

  private velocityY = 0;

  // Timers
  private dashTimer = 0;
  private dashCooldown = 0;

  private blockTimer = 0;
  private blockCooldown = 0;

  private parryTimer = 0;
  private parryCooldown = 0;

  private attackTimer = 0;
  private attackPhase: AttackPhase = "startup";

  private hitstop = 0;
  private hitstun = 0;

  private combo = 0;
  private comboTimer = 0;

  private health = 100;

  // Attack info
  private attackType: AttackType = "light";
  private attackStance: Stance = "mid";
  private stance: Stance = "mid";

  // Constants
  private readonly SPEED = 200;
  private readonly GRAVITY = 100;
  private readonly GROUND_Y = 600;

  private readonly DASH_SPEED = 600;
  private readonly DASH_TIME = 0.15;
  private readonly DASH_COOLDOWN = 0.5;

  private readonly BACK_DASH_SPEED = 300;
  private readonly BACK_DASH_TIME = 0.1;

  private readonly BLOCK_TIME = 0.2;
  private readonly BLOCK_COOLDOWN = 0.2;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    this.sprite = scene.add
      .rectangle(x, y, 40, 60, 0x0000ff)
      .setOrigin(0.5, 1);

    this.attackHitbox = scene.add
      .rectangle(0, 0, 60, 20, 0xffff00)
      .setVisible(false);

    this.blockHitbox = scene.add
      .rectangle(0, 0, 40, this.sprite.height / 3, 0x00ff00)
      .setOrigin(0.5, 1)
      .setVisible(false);
  }

  update(dt: number, input: any) {
    if (this.state === "dead") return;

    if (this.hitstop > 0) {
      this.hitstop -= dt;
      return;
    }

    this.updateTimers(dt);
    this.updateGravity(dt);
    this.updateStance(input);

    switch (this.state) {
      case "idle":
        this.updateMovement(input, dt);
        this.tryDash(input);
        this.tryAttack(input);
        this.tryBlock(input);
        this.tryParry(input);
        break;

      case "dash":
        this.updateDash(dt);
        break;

      case "attack":
        this.updateAttack(dt);
        break;

      case "block":
        this.updateBlock(dt);
        break;

      case "parry":
        this.updateParry(dt);
        break;

      case "hit":
        if (this.hitstun <= 0) this.state = "idle";
        break;
    }
  }

  // ---------------- Core ----------------

  private updateTimers(dt: number) {
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.blockCooldown = Math.max(0, this.blockCooldown - dt);
    this.parryCooldown = Math.max(0, this.parryCooldown - dt);
    this.comboTimer = Math.max(0, this.comboTimer - dt);
    this.hitstun = Math.max(0, this.hitstun - dt);

    if (this.comboTimer === 0) this.combo = 0;
  }

  private updateGravity(dt: number) {
    this.velocityY += this.GRAVITY * dt;
    this.sprite.y += this.velocityY;

    if (this.sprite.y >= this.GROUND_Y) {
      this.sprite.y = this.GROUND_Y;
      this.velocityY = 0;
    }
  }

  private updateStance(input: any) {
    if (input.cursors.up.isDown) this.stance = "high";
    else if (input.cursors.down.isDown) this.stance = "low";
    else this.stance = "mid";
  }

  // ---------------- Movement ----------------

  private updateMovement(input: any, dt: number) {
    if (input.cursors.left.isDown) {
      this.sprite.x -= this.SPEED * dt;
      this.facing = -1;
    }
    if (input.cursors.right.isDown) {
      this.sprite.x += this.SPEED * dt;
      this.facing = 1;
    }
  }

  private tryDash(input: any) {
    if (!Phaser.Input.Keyboard.JustDown(input.keys.dash)) return;
    if (this.dashCooldown > 0) return;

    const forward =
      (input.cursors.right.isDown && this.facing === 1) ||
      (input.cursors.left.isDown && this.facing === -1);

    this.state = "dash";
    this.dashTimer = forward ? this.DASH_TIME : this.BACK_DASH_TIME;
    this.dashCooldown = this.DASH_COOLDOWN;

    this.velocityY = 0;
  }

  private updateDash(dt: number) {
    this.dashTimer -= dt;
    const speed =
      this.dashTimer > this.BACK_DASH_TIME
        ? this.DASH_SPEED
        : this.BACK_DASH_SPEED;

    this.sprite.x += this.facing * speed * dt;

    if (this.dashTimer <= 0) this.state = "idle";
  }

  // ---------------- Attack ----------------

  private tryAttack(input: any) {
    if (this.attackTimer > 0) return;

    if (Phaser.Input.Keyboard.JustDown(input.keys.light)) {
      this.startAttack("light");
    } else if (Phaser.Input.Keyboard.JustDown(input.keys.heavy)) {
      this.startAttack("heavy");
    }
  }

  private startAttack(type: AttackType) {
    this.state = "attack";
    this.attackType = type;
    this.attackStance = this.stance;

    this.attackPhase = "startup";
    this.attackTimer = type === "light" ? 0.12 : 0.18;

    this.combo++;
    this.comboTimer = 0.6;
  }

  private updateAttack(dt: number) {
    this.attackTimer -= dt;

    if (this.attackPhase === "startup" && this.attackTimer <= 0) {
      this.attackPhase = "active";
      this.attackTimer = this.attackType === "light" ? 0.12 : 0.18;
      this.attackHitbox.setVisible(true);
    } else if (this.attackPhase === "active" && this.attackTimer <= 0) {
      this.attackPhase = "recovery";
      this.attackTimer = this.attackType === "light" ? 0.11 : 0.24;
      this.attackHitbox.setVisible(false);
    } else if (this.attackPhase === "recovery" && this.attackTimer <= 0) {
      this.state = "idle";
    }

    if (this.attackPhase === "active") {
      this.updateAttackHitbox();
    }
  }

  private updateAttackHitbox() {
    const x =
      this.sprite.x +
      this.facing *
        (this.sprite.width / 2 + this.attackHitbox.width / 2 + 10);

    const baseY = this.sprite.y - this.sprite.height * 0.5;
    const offset = this.sprite.height * 0.25;

    this.attackHitbox.x = x;
    this.attackHitbox.y =
      this.attackStance === "high"
        ? baseY - offset
        : this.attackStance === "low"
        ? baseY + offset
        : baseY;
  }

  // ---------------- Block / Parry ----------------

  private tryBlock(input: any) {
    if (!Phaser.Input.Keyboard.JustDown(input.keys.block)) return;
    if (this.blockCooldown > 0) return;

    this.state = "block";
    this.blockTimer = this.BLOCK_TIME;
    this.blockCooldown = this.BLOCK_COOLDOWN;
    this.blockHitbox.setVisible(true);
  }

  private updateBlock(dt: number) {
    this.blockTimer -= dt;
    this.updateBlockHitbox();

    if (this.blockTimer <= 0) {
      this.blockHitbox.setVisible(false);
      this.state = "idle";
    }
  }

  private tryParry(input: any) {
    if (!Phaser.Input.Keyboard.JustDown(input.keys.parry)) return;
    if (this.parryCooldown > 0) return;

    this.state = "parry";
    this.parryTimer = 0.15;
    this.parryCooldown = 0.6;
  }

  private updateParry(dt: number) {
    this.parryTimer -= dt;
    if (this.parryTimer <= 0) this.state = "idle";
  }

  // ---------------- Hitboxes ----------------

  private updateBlockHitbox() {
    const x =
      this.sprite.x +
      this.facing *
        (this.sprite.width / 2 + this.blockHitbox.width / 2 + 10);

    const bottom = this.sprite.y;
    const third = this.sprite.height / 3;

    let bottomY: number;

    switch (this.stance) {
      case "high":
        bottomY = bottom - third * 2;
        break;
      case "mid":
        bottomY = bottom - third;
        break;
      case "low":
        bottomY = bottom;
        break;
    }

    this.blockHitbox.x = x;
    this.blockHitbox.y = bottomY;
  }

  // ---------------- Combat ----------------

  public applyHit(
    direction: -1 | 1,
    force: number,
    hitstun: number,
    damage: number,
    airborne: boolean
  ) {
    if (this.state === "dead") return;

    if (this.state === "parry") {
      this.hitstop = 0.08;
      this.state = "idle";
      return;
    }

    if (this.state === "block") {
      this.blockHitbox.setVisible(false);
      this.state = "idle";
      return;
    }

    this.health -= damage;
    if (this.health <= 0) {
      this.state = "dead";
      this.sprite.setVisible(false);
      this.attackHitbox.setVisible(false);
      this.blockHitbox.setVisible(false);
      return;
    }

    this.state = "hit";
    this.hitstun = hitstun;
    this.hitstop = 0.06;
    this.velocityY = airborne ? -180 : -120;
  }

  // ---------------- Queries ----------------

  public isAttacking() {
    return this.state === "attack" && this.attackPhase === "active";
  }

  public getAttackDamage() {
    const base = this.attackType === "light" ? 60 : 120;
    return base * (1 + Math.min(0.5, this.combo * 0.1));
  }

  public isDead() {
    return this.state === "dead";
  }

  public getAttackHitbox() {
    return this.attackHitbox;
  }

  public getFacing(): -1 | 1 {
    return this.facing;
  }
}

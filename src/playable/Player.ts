import Phaser from "phaser";

export type Stance = "low" | "mid" | "high";
export type AttackType = "light" | "heavy";

type State = "idle" | "dash" | "attack" | "block" | "hit" | "dead";
type AttackPhase = "startup" | "active" | "recovery";

interface InputMap {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  keys: any;
}

export default class Player {
  private scene: Phaser.Scene;
  public sprite: Phaser.GameObjects.Rectangle;
  public attackHitbox: Phaser.GameObjects.Rectangle;
  public telegraphHitbox: Phaser.GameObjects.Rectangle;
  public blockHitbox: Phaser.GameObjects.Rectangle;

  private state: State = "idle";
  private facing: -1 | 1 = 1;

  private velocityX = 0;
  private velocityY = 0;

  private dashTimer = 0;
  private dashCooldown = 0;

  private blockTimer = 0;
  private blockCooldown = 0;
  private perfectBlockWindow = 0.15;
  private lastBlockTime = 0;
  private partialBlockMultiplier = 0.5;

  private attackTimer = 0;
  private attackCooldown = 0;
  private attackPhase: AttackPhase = "startup";
  private attackHitThisFrame = false;

  private telegraphTimer = 0;

  private hitstop = 0;
  private hitstun = 0;

  private health = 200;

  private attackType: AttackType = "light";
  private attackStance: Stance = "mid";
  private stance: Stance = "mid";

  private readonly SPEED = 200;
  private readonly GRAVITY = 100;
  private readonly GROUND_Y = 600;

  private readonly FORWARD_DASH_SPEED = 900;
  private readonly FORWARD_DASH_TIME = 0.15;
  private readonly BACK_DASH_SPEED = 400;
  private readonly BACK_DASH_TIME = 0.1;
  private readonly DASH_COOLDOWN = 0.5;

  private readonly BLOCK_TIME = 0.2;
  private readonly BLOCK_COOLDOWN = 0.5;

  private readonly LIGHT_ATTACK_COOLDOWN = 0.5;
  private readonly HEAVY_ATTACK_COOLDOWN = 1;

  private dashDirection: -1 | 1 = 1;

  public input!: InputMap;

  constructor(scene: Phaser.Scene, x: number, y: number, playerTag: string) {
    this.scene = scene;

    this.sprite = scene.add
      .rectangle(x, y, 40, 60, playerTag === "p1" ? 0x0000ff : 0xff0000)
      .setOrigin(0.5, 1);

    this.attackHitbox = scene
      .add.rectangle(0, 0, 60, 20, 0xffff00)
      .setVisible(false);

    this.telegraphHitbox = scene
      .add.rectangle(0, 0, 60, 20, 0xffff00, 0.3) // pale telegraph
      .setVisible(false);

    this.blockHitbox = scene
      .add.rectangle(0, 0, 40, this.sprite.height / 3, 0x00ff00)
      .setOrigin(0.5, 1)
      .setVisible(false);

    if (playerTag === "p1") {
      this.input = {
        cursors: scene.input.keyboard!.createCursorKeys(),
        keys: scene.input.keyboard!.addKeys({
          light: Phaser.Input.Keyboard.KeyCodes.Z,
          heavy: Phaser.Input.Keyboard.KeyCodes.X,
          block: Phaser.Input.Keyboard.KeyCodes.SPACE,
          dash: Phaser.Input.Keyboard.KeyCodes.F,
        }),
      };
    } else {
      this.input = {
        cursors: {
          up: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
          down: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
          left: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
          right: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        } as Phaser.Types.Input.Keyboard.CursorKeys,
        keys: scene.input.keyboard!.addKeys({
          light: Phaser.Input.Keyboard.KeyCodes.J,
          heavy: Phaser.Input.Keyboard.KeyCodes.K,
          block: Phaser.Input.Keyboard.KeyCodes.L,
          dash: Phaser.Input.Keyboard.KeyCodes.I,
        }),
      };
    }
  }

  update(dt: number, opponent: Player) {
    if (this.state === "dead") return;

    if (this.hitstop > 0) {
      this.hitstop -= dt;
      return;
    }

    this.updateTimers(dt);
    this.updateGravity(dt);
    this.updateStance();

    const canAct = this.hitstun <= 0;

    switch (this.state) {
      case "idle":
        if (canAct) {
          this.updateMovement(dt);
          this.tryDash(opponent);
          this.tryAttack();
          this.tryBlock();
        }
        break;
      case "dash":
        this.updateDash(dt);
        break;
      case "attack":
        this.updateAttack(dt, opponent);
        break;
      case "block":
        this.updateBlock(dt);
        break;
      case "hit":
        if (this.hitstun <= 0) this.state = "idle";
        break;
    }
  }

  private updateTimers(dt: number) {
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.blockCooldown = Math.max(0, this.blockCooldown - dt);
    this.hitstun = Math.max(0, this.hitstun - dt);
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    if (this.blockTimer > 0) this.blockTimer -= dt;
    this.lastBlockTime = Math.max(0, this.lastBlockTime - dt);
    if (this.dashTimer > 0) this.dashTimer -= dt;
    if (this.telegraphTimer > 0) this.telegraphTimer -= dt;
  }

  private updateGravity(dt: number) {
    this.velocityY += this.GRAVITY * dt;
    this.sprite.y += this.velocityY;
    this.sprite.x += this.velocityX * dt;
    this.velocityX *= 0.9;

    if (this.sprite.y >= this.GROUND_Y) {
      this.sprite.y = this.GROUND_Y;
      this.velocityY = 0;
    }
  }

  private updateStance() {
    const input = this.input.cursors;
    if (input.up?.isDown) this.stance = "high";
    else if (input.down?.isDown) this.stance = "low";
    else this.stance = "mid";
  }

  private updateMovement(dt: number) {
    const input = this.input.cursors;
    if (input.left?.isDown) {
      this.sprite.x -= this.SPEED * dt;
      this.facing = -1;
    }
    if (input.right?.isDown) {
      this.sprite.x += this.SPEED * dt;
      this.facing = 1;
    }
  }

  private tryDash(opponent: Player) {
    if (!Phaser.Input.Keyboard.JustDown(this.input.keys.dash)) return;
    if (this.dashCooldown > 0) return;

    const input = this.input.cursors;
    this.dashDirection = input.left?.isDown ? -1 : input.right?.isDown ? 1 : this.facing;

    const towardOpponent = (opponent.sprite.x - this.sprite.x) * this.dashDirection > 0;
    if (towardOpponent) {
      this.velocityX = this.FORWARD_DASH_SPEED * this.dashDirection;
      this.dashTimer = this.FORWARD_DASH_TIME;
    } else {
      this.velocityX = this.BACK_DASH_SPEED * this.dashDirection;
      this.dashTimer = this.BACK_DASH_TIME;
    }

    this.state = "dash";
    this.dashCooldown = this.DASH_COOLDOWN;
  }

  private updateDash(dt: number) {
    this.sprite.x += this.velocityX * dt;
    this.velocityX *= 0.9;
    if (this.dashTimer <= 0) {
      this.state = "idle";
      this.velocityX = 0;
    }
  }

  private tryAttack() {
    if (this.attackCooldown > 0) return;
    if (Phaser.Input.Keyboard.JustDown(this.input.keys.light)) {
      this.startAttack("light");
      this.attackCooldown = this.LIGHT_ATTACK_COOLDOWN;
    } else if (Phaser.Input.Keyboard.JustDown(this.input.keys.heavy)) {
      this.startAttack("heavy");
      this.attackCooldown = this.HEAVY_ATTACK_COOLDOWN;
    }
  }

  private startAttack(type: AttackType) {
    this.state = "attack";
    this.attackType = type;
    this.attackStance = this.stance;
    this.attackPhase = "startup";
    this.attackTimer = 0.3; // telegraph duration

    this.attackHitThisFrame = false;
    this.attackHitbox.setVisible(false);

    // show telegraph
    this.telegraphHitbox.setVisible(true);
    this.telegraphTimer = 0.3;
    this.updateTelegraphHitbox();
  }

  private updateAttack(dt: number, opponent: Player) {
    if (this.attackPhase === "startup") {
      this.updateTelegraphHitbox();
      if (this.telegraphTimer <= 0) {
        this.telegraphHitbox.setVisible(false);
        this.attackPhase = "active";
        this.attackTimer = this.attackType === "light" ? 0.12 : 0.18;
        this.attackHitbox.setVisible(true);
        this.updateAttackHitbox();
      }
    } 
    else if (this.attackPhase === "active") {
      if (!this.attackHitThisFrame) {
        this.updateAttackHitbox();
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.attackHitbox.getBounds(), opponent.sprite.getBounds())) {
          opponent.applyHit(this.facing, 10, 0.2, this.getAttackDamage(), false, this.attackStance);
          this.attackHitThisFrame = true;
          this.attackHitbox.setVisible(false);
        }
      }

      if (this.attackHitThisFrame || this.attackTimer <= 0) {
        this.attackPhase = "recovery";
        this.attackTimer = this.attackType === "light" ? 0.11 : 0.24;
        this.attackHitbox.setVisible(false);
      }
    } 
    else if (this.attackPhase === "recovery" && this.attackTimer <= 0) {
      this.state = "idle";
    }
  }

  private updateAttackHitbox() {
    const x = this.sprite.x + this.facing * (this.sprite.width / 2 + this.attackHitbox.width / 2 + 2);
    const baseY = this.sprite.y - this.sprite.height * 0.5;
    const offset = this.sprite.height * 0.25;
    this.attackHitbox.x = x;
    this.attackHitbox.y =
      this.attackStance === "high" ? baseY - offset : this.attackStance === "low" ? baseY + offset : baseY;
  }

  private updateTelegraphHitbox() {
    const x = this.sprite.x + this.facing * (this.sprite.width / 2 + this.telegraphHitbox.width / 2 + 2);
    const baseY = this.sprite.y - this.sprite.height * 0.5;
    const offset = this.sprite.height * 0.25;
    this.telegraphHitbox.x = x;
    this.telegraphHitbox.y =
      this.attackStance === "high" ? baseY - offset : this.attackStance === "low" ? baseY + offset : baseY;
  }

  private tryBlock() {
    if (!Phaser.Input.Keyboard.JustDown(this.input.keys.block)) return;
    if (this.blockCooldown > 0) return;

    this.state = "block";
    this.blockTimer = this.BLOCK_TIME;
    this.blockCooldown = this.BLOCK_COOLDOWN;
    this.lastBlockTime = this.perfectBlockWindow;
    this.blockHitbox.setVisible(true);
  }

  private updateBlock(dt: number) {
    this.updateBlockHitbox();
    if (this.blockTimer <= 0) {
      this.blockHitbox.setVisible(false);
      this.state = "idle";
    }
    if (this.lastBlockTime > 0) this.lastBlockTime -= dt;
  }

  private updateBlockHitbox() {
    const x = this.sprite.x;
    const bottom = this.sprite.y;
    const third = this.sprite.height / 3;
    let bottomY: number;
    switch (this.stance) {
      case "high": bottomY = bottom - third * 2; break;
      case "mid": bottomY = bottom - third; break;
      case "low": bottomY = bottom; break;
    }
    this.blockHitbox.x = x;
    this.blockHitbox.y = bottomY;
  }

  public applyHit(direction: -1 | 1, force: number, hitstun: number, damage: number, airborne: boolean, attackStance: Stance) {
    if (this.state === "dead") return;

    if (this.state === "block" && this.lastBlockTime > 0) {
      const stanceOrder: Stance[] = ["low", "mid", "high"];
      const stanceDistance = Math.abs(stanceOrder.indexOf(this.stance) - stanceOrder.indexOf(attackStance));

      if (stanceDistance === 0) {
        this.hitstun = 0;
        this.hitstop = 0.06;
        this.velocityX = 0;
        this.velocityY = 0;
        this.state = "idle";
        this.blockHitbox.setVisible(false);
        return;
      } else if (stanceDistance === 1) {
        this.health -= damage * this.partialBlockMultiplier;
        this.hitstun = 0.1;
        this.hitstop = 0.03;
        this.velocityX = 0;
        this.velocityY = 0;
        this.state = "idle";
        this.blockHitbox.setVisible(false);
        return;
      }
    }

    this.health -= damage;
    if (this.health <= 0) {
      this.state = "dead";
      this.sprite.setVisible(false);
      this.attackHitbox.setVisible(false);
      this.blockHitbox.setVisible(false);
      this.telegraphHitbox.setVisible(false);
      return;
    }

    this.state = "hit";
    this.hitstun = hitstun;
    this.hitstop = 0.06;
    this.velocityX = direction * force;
    this.velocityY = airborne ? -10 : -10;
  }

  public isAttacking() { return this.state === "attack" && this.attackPhase === "active"; }
  public getStance(): Stance { return this.stance; }
  public getAttackStance(): Stance { return this.attackStance; }
  public getHealth(): number { return this.health; }
  public getAttackDamage(): number { return this.attackType === "light" ? 50 : 100; }
  public getAttackHitbox() { return this.attackHitbox; }
}

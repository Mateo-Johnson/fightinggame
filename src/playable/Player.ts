import Phaser from "phaser";

export type Stance = "low" | "mid" | "high";
export type AttackType = "light" | "heavy";
export type State =
  | "idle"
  | "dash"
  | "attack"
  | "block"
  | "hit"
  | "stunned"
  | "dead";

export type AttackPhase = "startup" | "active" | "recovery";

export type AttackData = {
  id: number;
  owner: Player;
  type: AttackType;
  stance: Stance;
  damage: number;
  hitstun: number;
  knockback: number;
  hasHit: boolean;
};

interface InputMap {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  keys: any;
}

export default class Player {
  private static ATTACK_ID = 0;

  // ===== CORE =====
  private scene: Phaser.Scene;
  public sprite: Phaser.GameObjects.Sprite;
  public opponent!: Player;
  private groundY: number;

  // ===== STATE =====
  private state: State = "idle";
  private attackPhase: AttackPhase = "startup";
  private facing: -1 | 1 = 1;

  // ===== MOTION =====
  private velocityX = 0;
  private velocityY = 0;

  // ===== TIMERS =====
  private dashTimer = 0;
  private dashCooldown = 0;
  private blockTimer = 0;
  private blockCooldown = 0;
  private lastBlockTime = 0;
  private stunTimer = 0;
  private attackTimer = 0;
  private attackCooldown = 0;
  private hitstop = 0;
  private hitstun = 0;

  // ===== COMBAT =====
  private currentAttack?: AttackData;
  private health = 20;

  // ===== STANCE =====
  private stance: Stance = "mid";
  private attackStance: Stance = "mid";

  // ===== HITBOXES =====
  public attackHitbox: Phaser.GameObjects.Rectangle;
  public blockHitbox: Phaser.GameObjects.Rectangle;

  // ===== STAMINA =====
  private stamina = 40;
  public readonly maxStamina = 40;
  private staminaBlocks: Phaser.GameObjects.Rectangle[] = [];
  private readonly STAMINA_UNIT = 5;
  private readonly STAMINA_REGEN_RATE = 1;

  // ===== CONSTANTS =====
  private readonly SPEED = 200;
  private readonly GRAVITY = 100;
  private readonly FORWARD_DASH_SPEED = 1000;
  private readonly BACK_DASH_SPEED = 500;
  private readonly DASH_COOLDOWN = 0.5;
  private readonly BLOCK_TIME = 0.4;
  private readonly BLOCK_COOLDOWN = 0.3;
  private readonly PERFECT_BLOCK_WINDOW = 0.12;

  public input!: InputMap;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    tag: "p1" | "p2",
    groundY: number
  ) {
    this.scene = scene;
    this.groundY = groundY;

    // VISUAL ONLY (animation handler controls anims)
    this.sprite = scene.add
      .sprite(x, y, "player", 0)
      .setOrigin(0.5, 1);

        if (tag === "p1") {
    const scale = 0.85; // 80% size
    this.sprite.setScale(scale);
        }


    // HITBOXES
    this.attackHitbox = scene.add
      .rectangle(0, 0, 60, 20, 0xffff00)
      .setVisible(false);

    this.blockHitbox = scene.add
      .rectangle(0, 0, 40, this.sprite.displayHeight / 3, 0x00ff00)
      .setOrigin(0.5, 1)
      .setVisible(false);

    // INPUT
    if (tag === "p1") {
      this.input = {
        cursors: scene.input.keyboard!.createCursorKeys(),
        keys: scene.input.keyboard!.addKeys({
          light: Phaser.Input.Keyboard.KeyCodes.Z,
          heavy: Phaser.Input.Keyboard.KeyCodes.X,
          block: Phaser.Input.Keyboard.KeyCodes.SPACE,
          dash: Phaser.Input.Keyboard.KeyCodes.F,
        }),
      };
      this.createStaminaUI(20, 40);
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
      this.createStaminaUI(600, 20);
    }
  }

  // ================= UPDATE =================

  update(dt: number) {
    if (this.state === "dead") return;

    if (this.hitstop > 0) {
      this.hitstop -= dt;
      return;
    }

    this.updateTimers(dt);
    this.updatePhysics(dt);
    this.updateStance();
    this.regenStamina(dt);
    this.updateStaminaUI();
    this.resolvePlayerPush();

    if (this.state === "stunned") {
      if (this.stunTimer <= 0) this.state = "idle";
      return;
    }

    if (this.hitstun > 0) return;
    if (this.state === "hit") this.state = "idle";

    switch (this.state) {
      case "idle":
        this.handleMovement(dt);
        this.tryDash();
        this.tryAttack();
        this.tryBlock();
        break;

      case "dash":
        if (this.dashTimer <= 0) {
          this.state = "idle";
          this.velocityX = 0;
        }
        break;

      case "attack":
        this.updateAttack();
        break;

      case "block":
        this.updateBlockHitbox();
        if (this.blockTimer <= 0) {
          this.state = "idle";
          this.blockHitbox.setVisible(false);
        }
        break;
    }
  }

  // ================= MOTION =================

  private updatePhysics(dt: number) {
    this.velocityY += this.GRAVITY * dt;
    this.sprite.x += this.velocityX * dt;
    this.sprite.y += this.velocityY;
    this.velocityX *= 0.85;

    this.sprite.setFlipX(this.facing === -1);

    if (this.sprite.y >= this.groundY) {
      this.sprite.y = this.groundY;
      this.velocityY = 0;
    }
  }

  private handleMovement(dt: number) {
    const c = this.input.cursors;
    if (c.left?.isDown) {
      this.sprite.x -= this.SPEED * dt;
      this.facing = -1;
    }
    if (c.right?.isDown) {
      this.sprite.x += this.SPEED * dt;
      this.facing = 1;
    }
  }

  // ================= DASH =================

  private tryDash() {
    if (this.dashCooldown > 0) return;
    if (!Phaser.Input.Keyboard.JustDown(this.input.keys.dash)) return;

    const towardOpponent =
      (this.opponent.sprite.x > this.sprite.x ? 1 : -1) === this.facing;

    this.state = "dash";
    this.dashCooldown = this.DASH_COOLDOWN;
    this.dashTimer = towardOpponent ? 0.12 : 0.08;
    this.velocityX =
      (towardOpponent ? this.FORWARD_DASH_SPEED : this.BACK_DASH_SPEED) *
      this.facing;
  }

  // ================= ATTACK =================

  private tryAttack() {
    if (this.attackCooldown > 0) return;

    if (Phaser.Input.Keyboard.JustDown(this.input.keys.light) && this.stamina >= 10) {
      this.spendStamina(10);
      this.beginAttack("light");
    }

    if (Phaser.Input.Keyboard.JustDown(this.input.keys.heavy) && this.stamina >= 20) {
      this.spendStamina(20);
      this.beginAttack("heavy");
    }
  }

  private beginAttack(type: AttackType) {
    this.state = "attack";
    this.attackPhase = "startup";
    this.attackStance = this.stance;

    this.currentAttack = {
      id: Player.ATTACK_ID++,
      owner: this,
      type,
      stance: this.attackStance,
      damage: type === "light" ? 10 : 20,
      hitstun: type === "light" ? 0.15 : 0.25,
      knockback: type === "light" ? 160 : 260,
      hasHit: false,
    };

    this.attackTimer = type === "light" ? 0.12 : 0.18;
    this.attackCooldown = type === "light" ? 0.35 : 0.6;
  }

  private updateAttack() {
    if (this.attackTimer > 0) return;

    if (this.attackPhase === "startup") {
      this.attackPhase = "active";
      this.attackTimer = this.currentAttack!.type === "light" ? 0.12 : 0.18;
      this.attackHitbox.setVisible(true);
    } else if (this.attackPhase === "active") {
      this.attackPhase = "recovery";
      this.attackTimer = this.currentAttack!.type === "light" ? 0.1 : 0.25;
      this.attackHitbox.setVisible(false);
    } else {
      this.state = "idle";
      this.currentAttack = undefined;
    }

    this.updateAttackHitbox();
  }

  // ================= BLOCK =================

  private tryBlock() {
    if (this.blockCooldown > 0) return;
    if (!Phaser.Input.Keyboard.JustDown(this.input.keys.block)) return;
    if (this.stamina < 5) return;

    this.spendStamina(5);
    this.state = "block";
    this.blockTimer = this.BLOCK_TIME;
    this.lastBlockTime = this.PERFECT_BLOCK_WINDOW;
    this.blockCooldown = this.BLOCK_COOLDOWN;
    this.blockHitbox.setVisible(true);
  }

  // ================= COLLISION / COMBAT =================

  public resolveIncomingAttack(attack: AttackData) {
    const blocking = this.state === "block";
    const stanceMatch = this.stance === attack.stance;
    const perfect = blocking && this.lastBlockTime > 0;

    if (perfect) {
      this.hitstop = 0.06;
      this.state = "idle";
      this.gainStamina(5);
      return;
    }

    if (blocking && attack.type === "heavy" && stanceMatch) {
      this.state = "stunned";
      this.stunTimer = 1;
      return;
    }

    if (blocking && stanceMatch) {
      this.hitstun = 0.1;
      this.hitstop = 0.04;
      return;
    }

    this.health -= attack.damage;
    this.state = "hit";
    this.hitstun = attack.hitstun;
    this.hitstop = 0.05;
    this.velocityX =
      attack.knockback *
      (this.sprite.x > attack.owner.sprite.x ? 1 : -1);

    if (this.health <= 0) {
      this.state = "dead";
      this.sprite.setVisible(false);
    }
  }

  // ================= HITBOX HELPERS =================

  private updateAttackHitbox() {
    this.attackHitbox.x = this.sprite.x + this.facing * 45;

    const baseY = this.sprite.y - this.sprite.displayHeight / 2;
    const offset = this.sprite.displayHeight / 4;

    this.attackHitbox.y =
      this.attackStance === "high"
        ? baseY - offset
        : this.attackStance === "low"
        ? baseY + offset
        : baseY;
  }

  private updateBlockHitbox() {
    const bottom = this.sprite.y;
    const third = this.sprite.displayHeight / 3;

    this.blockHitbox.x = this.sprite.x;
    this.blockHitbox.y =
      this.stance === "high"
        ? bottom - third * 2
        : this.stance === "low"
        ? bottom
        : bottom - third;
  }

  private resolvePlayerPush() {
    const a = this.sprite.getBounds();
    const b = this.opponent.sprite.getBounds();
    if (!Phaser.Geom.Intersects.RectangleToRectangle(a, b)) return;

    const overlap = a.width / 2 + b.width / 2 - Math.abs(a.centerX - b.centerX);
    const push = overlap / 2;

    if (a.centerX < b.centerX) {
      this.sprite.x -= push;
      this.opponent.sprite.x += push;
    } else {
      this.sprite.x += push;
      this.opponent.sprite.x -= push;
    }
  }

  // ================= STAMINA =================

  private createStaminaUI(x: number, y: number) {
    for (let i = 0; i < this.maxStamina / this.STAMINA_UNIT; i++) {
      this.staminaBlocks.push(
        this.scene.add.rectangle(x + i * 12, y, 10, 10, 0x00ff00)
      );
    }
  }

  private spendStamina(v: number) {
    this.stamina = Math.max(0, this.stamina - v);
  }

  private gainStamina(v: number) {
    this.stamina = Math.min(this.maxStamina, this.stamina + v);
  }

  private regenStamina(dt: number) {
    this.gainStamina(this.STAMINA_REGEN_RATE * dt);
  }

  private updateStaminaUI() {
    const units = Math.floor(this.stamina / this.STAMINA_UNIT);
    this.staminaBlocks.forEach((b, i) => b.setVisible(i < units));
  }

  // ================= TIMERS =================

  private updateTimers(dt: number) {
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.blockCooldown = Math.max(0, this.blockCooldown - dt);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.hitstun = Math.max(0, this.hitstun - dt);
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.lastBlockTime = Math.max(0, this.lastBlockTime - dt);
    this.blockTimer = Math.max(0, this.blockTimer - dt);
    this.dashTimer = Math.max(0, this.dashTimer - dt);
    this.stunTimer = Math.max(0, this.stunTimer - dt);
  }

  private updateStance() {
    const c = this.input.cursors;
    if (c.up?.isDown) this.stance = "high";
    else if (c.down?.isDown) this.stance = "low";
    else this.stance = "mid";
  }

  // ================= READ-ONLY API FOR ANIMATION HANDLER =================

  public getState() {
    return this.state;
  }

  public getAttackPhase() {
    return this.attackPhase;
  }

  public getCurrentAttackType(): AttackType | null {
    return this.currentAttack?.type ?? null;
  }

  public getFacing() {
    return this.facing;
  }

  public isBlocking() {
    return this.state === "block";
  }

  public isStunned() {
    return this.state === "stunned";
  }

  public getHealth() {
    return this.health;
  }

  public getAttackHitbox() {
    return this.attackHitbox;
  }
  public getVelocityX() { 
    return this.velocityX; 
  }

  public getActiveAttack(): AttackData | null { 
    if ( 
      this.state === "attack" && 
      this.attackPhase === "active" && 
      this.currentAttack && !this.currentAttack.hasHit 
    ) { 
      return this.currentAttack; 
    } 
    return null; 
  }
}

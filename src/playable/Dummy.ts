// import Phaser from "phaser";
// import Player, { type Stance } from "./Player";

// export type DummyState =
//   | "idle"
//   | "move"
//   | "attack"
//   | "block"
//   | "hit"
//   | "dead";

// export default class Dummy {
//   public sprite: Phaser.GameObjects.Rectangle;
//   public hitbox: Phaser.GameObjects.Rectangle;
//   public attackHitbox: Phaser.GameObjects.Rectangle;

//   private state: DummyState = "idle";
//   private facing: -1 | 1 = -1;
//   private stance: Stance = "mid";

//   private velocityX = 0;
//   private velocityY = 0;

//   private readonly SPEED = 140;
//   private readonly GRAVITY = 100;
//   private readonly GROUND_Y = 600;

//   private hitstun = 0;
//   private hitstop = 0;
//   private health = 120;

//   private decisionTimer = 0;
//   private attackActive = false;
//   private attackTimer = 0;

//   private player: Player;

//   constructor(scene: Phaser.Scene, player: Player, x: number, y: number) {
//     this.player = player;

//     this.sprite = scene.add.rectangle(x, y, 50, 50, 0xff0000);
//     this.sprite.setOrigin(0.5, 1);

//     this.hitbox = scene.add.rectangle(x, y, 40, 50, 0xff00ff).setVisible(false);

//     this.attackHitbox = scene
//       .add.rectangle(0, 0, 60, 20, 0xffaa00)
//       .setVisible(false);
//   }

//   update(dt: number) {
//     if (this.state === "dead") return;

//     this.updateFacing();

//     if (this.hitstop > 0) {
//       this.hitstop -= dt;
//       return;
//     }

//     if (this.hitstun > 0) {
//       this.hitstun -= dt;
//       if (this.hitstun <= 0) this.state = "idle";
//     }

//     this.updateAI(dt);
//     this.updatePhysics(dt);

//     this.hitbox.x = this.sprite.x;
//     this.hitbox.y = this.sprite.y;
//   }

//   private updateAI(dt: number) {
//     if (this.state === "hit") return;

//     this.decisionTimer -= dt;
//     if (this.decisionTimer > 0) return;

//     this.decisionTimer = 0.15;

//     const dist = Math.abs(this.player.sprite.x - this.sprite.x);

//     if (dist > 140) {
//       this.state = "move";
//       this.velocityX = this.facing * this.SPEED;
//       return;
//     }

//     if (dist < 70) {
//       if (Math.random() < 0.6) {
//         this.startBlock();
//       } else {
//         this.state = "move";
//         this.velocityX = -this.facing * this.SPEED;
//       }
//       return;
//     }

//     if (this.player.isAttacking()) {
//       if (Math.random() < 0.7) this.startBlock();
//       return;
//     }

//     if (Math.random() < 0.5) this.startAttack();
//   }

//   private updateFacing() {
//     this.facing = this.player.sprite.x > this.sprite.x ? 1 : -1;
//   }

//   private startAttack() {
//     this.state = "attack";
//     this.attackTimer = 0.4;
//     this.attackActive = false;
//     this.stance = Phaser.Math.RND.pick(["low", "mid", "high"]);
//   }

//   private updateAttack(dt: number) {
//     this.attackTimer -= dt;

//     if (!this.attackActive && this.attackTimer < 0.25) {
//       this.attackActive = true;
//       this.attackHitbox.setVisible(true);
//     }

//     if (this.attackTimer <= 0) {
//       this.attackHitbox.setVisible(false);
//       this.attackActive = false;
//       this.state = "idle";
//     }

//     this.updateAttackHitbox();
//   }

//   private updateAttackHitbox() {
//     this.attackHitbox.x =
//       this.sprite.x + this.facing * (this.sprite.width / 2 + 30);
//     this.attackHitbox.y = this.sprite.y - 25;
//   }

//   private startBlock() {
//     this.state = "block";
//     this.decisionTimer = 0.3;
//   }

//   private updatePhysics(dt: number) {
//     if (this.state === "attack") this.updateAttack(dt);

//     this.sprite.x += this.velocityX * dt;
//     this.velocityX *= 0.9;

//     this.velocityY += this.GRAVITY * dt;
//     this.sprite.y += this.velocityY;

//     if (this.sprite.y >= this.GROUND_Y) {
//       this.sprite.y = this.GROUND_Y;
//       this.velocityY = 0;
//     }
//   }

//   public applyKnockback(direction: -1 | 1, force: number, hitstun: number) {
//     if (this.state === "dead") return;

//     this.state = "hit";
//     this.velocityX = direction * force;
//     this.velocityY = -15;
//     this.hitstun = hitstun;
//     this.hitstop = 0.05;
//   }

//   public applyDamage(amount: number) {
//     this.health -= amount;
//     if (this.health <= 0) {
//       this.state = "dead";
//       this.sprite.setVisible(false);
//       this.attackHitbox.setVisible(false);
//     }
//   }

//   public isAttacking() {
//     return this.state === "attack" && this.attackActive;
//   }

//   public getAttackHitbox() {
//     return this.attackHitbox;
//   }

//   public getAttackStance(): Stance {
//     return this.stance;
//   }

//   public getFacing(): -1 | 1 {
//     return this.facing;
//   }

//   public getHitbox() {
//     return this.hitbox;
//   }

//   public getHealth(): number {
//     return this.health;
//   }

// }

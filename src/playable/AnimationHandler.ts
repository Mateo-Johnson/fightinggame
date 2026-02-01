// animation/PlayerAnimationHandler.ts
import Phaser from "phaser";
import Player from "../playable/Player";
import type { PlayerAnimState, PlayerTag } from "./AnimationTypes";

export default class PlayerAnimationHandler {
  private player: Player;
  private tag: PlayerTag;

  private currentAnim?: PlayerAnimState;

  constructor(player: Player, tag: PlayerTag) {
    this.player = player;
    this.tag = tag;
  }

  update() {
    const next = this.resolveState();
    if (next === this.currentAnim) return;

    this.currentAnim = next;
    this.play(next);
  }

  // ================= STATE TRANSLATION =================

  private resolveState(): PlayerAnimState {
    const state = this.player.getState();
    const staminaBoxes = this.player.getStamina(); // 0–8

    switch (state) {
      case "idle":
        return this.player.getIsMoving()
          ? (`walk_${staminaBoxes}` as PlayerAnimState)
          : (`idle_${staminaBoxes}` as PlayerAnimState);

      case "dash":
        return "dash";

      case "attack": {
        const type = this.player.getCurrentAttackType();
        const stance = this.player.attackStance;

        if (!type) {
          return `idle_${staminaBoxes}` as PlayerAnimState;
        }

        return `attack_${type}_${stance}` as PlayerAnimState;
      }

      case "block": {
        const stance = this.player.stance;
        return `block_${stance}` as PlayerAnimState;
      }

      case "hit":
        return "hit";

      case "stunned":
        return "stunned";

      case "dead":
        return "dead";

      default:
        return `idle_${staminaBoxes}` as PlayerAnimState;
    }
  }

  // ================= PLAYBACK =================

  private play(anim: PlayerAnimState) {
    const sprite = this.player.sprite;

    sprite.setFlipX(this.player.getFacing() === -1);

    if (this.tag === "p1") {
      this.playP1(anim, sprite);
    } else {
      this.playP2(anim, sprite);
    }
  }

  // ================= P1 =================

  private playP1(anim: PlayerAnimState, sprite: Phaser.GameObjects.Sprite) {
    switch (anim) {
      // ---- Idle (stamina-based) ----
      case "idle_8":
      case "idle_7":
      case "idle_6":
      case "idle_5":
      case "idle_4":
      case "idle_3":
      case "idle_2":
      case "idle_1":
      case "idle_0":
        sprite.anims.play(`p1_${anim}`, true);
        break;

      // ---- Walk (stamina-based) ----
      case "walk_8":
      case "walk_7":
      case "walk_6":
      case "walk_5":
      case "walk_4":
      case "walk_3":
      case "walk_2":
      case "walk_1":
      case "walk_0":
        sprite.anims.play(`p1_${anim}`, true);
        break;

      // ---- Dash ----
      case "dash":
        sprite.anims.play("p1_dash", true);
        break;

      // ---- Attacks ----
      case "attack_light_low":
        sprite.anims.play("p1_attack_light_low", true);
        break;
      case "attack_light_mid":
        sprite.anims.play("p1_attack_light_mid", true);
        break;
      case "attack_light_high":
        sprite.anims.play("p1_attack_light_high", true);
        break;
      case "attack_heavy_low":
        sprite.anims.play("p1_attack_heavy_low", true);
        break;
      case "attack_heavy_mid":
        sprite.anims.play("p1_attack_heavy_mid", true);
        break;
      case "attack_heavy_high":
        sprite.anims.play("p1_attack_heavy_high", true);
        break;

      // ---- Block ----
      case "block_low":
        sprite.anims.play("p1_block_low", true);
        break;
      case "block_mid":
        sprite.anims.play("p1_block_mid", true);
        break;
      case "block_high":
        sprite.anims.play("p1_block_high", true);
        break;

      // ---- Reactions ----
      case "hit":
        sprite.anims.play("p1_hit", true);
        break;
      case "stunned":
        sprite.anims.play("p1_stunned", true);
        break;
      case "dead":
        sprite.anims.play("p1_dead");
        break;
    }
  }

  // ================= P2 =================

  private playP2(anim: PlayerAnimState, sprite: Phaser.GameObjects.Sprite) {
    switch (anim) {
      // ---- Idle (stamina-based) ----
      case "idle_8":
      case "idle_7":
      case "idle_6":
      case "idle_5":
      case "idle_4":
      case "idle_3":
      case "idle_2":
      case "idle_1":
      case "idle_0":
        sprite.anims.play(`p2_${anim}`, true);
        break;

      // ---- Walk (stamina-based) ----
      case "walk_8":
      case "walk_7":
      case "walk_6":
      case "walk_5":
      case "walk_4":
      case "walk_3":
      case "walk_2":
      case "walk_1":
      case "walk_0":
        sprite.anims.play(`p2_${anim}`, true);
        break;

      // ---- Dash ----
      case "dash":
        sprite.anims.play("p2_dash", true);
        break;

      // ---- Attacks ----
      case "attack_light_low":
        sprite.anims.play("p2_attack_light_low", true);
        break;
      case "attack_light_mid":
        sprite.anims.play("p2_attack_light_mid", true);
        break;
      case "attack_light_high":
        sprite.anims.play("p2_attack_light_high", true);
        break;
      case "attack_heavy_low":
        sprite.anims.play("p2_attack_heavy_low", true);
        break;
      case "attack_heavy_mid":
        sprite.anims.play("p2_attack_heavy_mid", true);
        break;
      case "attack_heavy_high":
        sprite.anims.play("p2_attack_heavy_high", true);
        break;

      // ---- Block ----
      case "block_low":
        sprite.anims.play("p2_block_low", true);
        break;
      case "block_mid":
        sprite.anims.play("p2_block_mid", true);
        break;
      case "block_high":
        sprite.anims.play("p2_block_high", true);
        break;

      // ---- Reactions ----
      case "hit":
        sprite.anims.play("p2_hit", true);
        break;
      case "stunned":
        sprite.anims.play("p2_stunned", true);
        break;
      case "dead":
        sprite.x += sprite.flipX ? -50 : 50;

        sprite.setScale(0.9);
        sprite.anims.play("p2_dead");
        break;
    }
  }
}

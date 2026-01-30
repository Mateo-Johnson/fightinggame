// animation/PlayerAnimationHandler.ts
import Phaser from "phaser";
import Player from "../playable/Player";
import type { PlayerAnimState, PlayerTag } from "./AnimationTypes";

export default class PlayerAnimationHandler {
  private scene: Phaser.Scene;
  private player: Player;
  private tag: PlayerTag;

  private currentAnim?: PlayerAnimState;

  constructor(scene: Phaser.Scene, player: Player, tag: PlayerTag) {
    this.scene = scene;
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

  /** Translate gameplay → animation state */
  private resolveState(): PlayerAnimState {
    const state = this.player.getState();

    switch (state) {
      case "idle":
        return Math.abs(this.player.getVelocityX()) > 10
          ? "walk"
          : "idle";

      case "dash":
        return "dash";

      case "attack": {
        const type = this.player.getCurrentAttackType();
        return type === "heavy" ? "attack_heavy" : "attack_light";
      }

      case "block":
        return "block";

      case "hit":
        return "hit";

      case "stunned":
        return "stunned";

      case "dead":
        return "dead";

      default:
        return "idle";
    }
  }

  // ================= PLAYBACK =================

  private play(anim: PlayerAnimState) {
    const sprite = this.player.sprite;

    // flip handled here, not in Player
    sprite.setFlipX(this.player.getFacing() === -1);

    if (this.tag === "p1") {
      this.playP1(anim, sprite);
    } else {
      this.playP2(anim, sprite);
    }
  }

  // ================= P1 =================

  private playP1(
    anim: PlayerAnimState,
    sprite: Phaser.GameObjects.Sprite
  ) {
    switch (anim) {
      case "idle":
        sprite.anims.play("p1_idle", true);
        break;

      case "walk":
        sprite.anims.play("p1_walk", true);
        break;

      case "dash":
        sprite.anims.play("p1_dash", true);
        break;

      case "attack_light":
        sprite.anims.play("p1_attack_light", true);
        break;

      case "attack_heavy":
        sprite.anims.play("p1_attack_heavy", true);
        break;

      case "block":
        sprite.anims.play("p1_block", true);
        break;

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

  private playP2(
    anim: PlayerAnimState,
    sprite: Phaser.GameObjects.Sprite
  ) {
    switch (anim) {
      case "idle":
        sprite.anims.play("p2_idle", true);
        break;

      case "walk":
        sprite.anims.play("p2_walk", true);
        break;

      case "dash":
        sprite.anims.play("p2_dash", true);
        break;

      case "attack_light":
        sprite.anims.play("p2_attack_light", true);
        break;

      case "attack_heavy":
        sprite.anims.play("p2_attack_heavy", true);
        break;

      case "block":
        sprite.anims.play("p2_block", true);
        break;

      case "hit":
        sprite.anims.play("p2_hit", true);
        break;

      case "stunned":
        sprite.anims.play("p2_stunned", true);
        break;

      case "dead":
        sprite.anims.play("p2_dead");
        break;
    }
  }
}

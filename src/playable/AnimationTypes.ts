// animation/AnimationTypes.ts
export type PlayerAnimState =
  | "idle"
  | "walk"
  | "dash"
  | "attack_light"
  | "attack_heavy"
  | "block"
  | "hit"
  | "stunned"
  | "dead";

export type PlayerTag = "p1" | "p2";

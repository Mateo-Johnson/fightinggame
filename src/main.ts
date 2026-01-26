import Phaser from "phaser";

let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
let player: Phaser.GameObjects.Rectangle;

const SPEED = 200;
const GRAVITY = 100;
let velocityY = 0;
const GROUND_Y = 573;

let facing: -1 | 1 = 1;

let isDashing = false;
let dashTime = 0;
let dashCooldown = 0;
let dashDir: -1 | 1 = 1;
let dashSpeed = 0;

let isAttacking = false;
let attackTime = 0;
let attackCooldown = 0;
let attackStance: "low" | "mid" | "high" = "mid";

const LIGHT_DURATION = 0.15;
const LIGHT_COOLDOWN = 0.4;

const HEAVY_DURATION = 0.35;
const HEAVY_COOLDOWN = 1.0;

const BLOCK_WINDOW = 0.2;
const BLOCK_COOLDOWN = 0.5;

let isBlocking = false;
let blockTime = 0;
let blockCooldown = 0;
let blockStance: "low" | "mid" | "high" = "mid";

let attackType: "light" | "heavy" = "light";

let attackHitbox: Phaser.GameObjects.Rectangle;
let blockHitbox: Phaser.GameObjects.Rectangle;

const DASH_SPEED = 600;
const DASH_DURATION = 0.15;
const DASH_COOLDOWN = 0.5;

const BACK_DASH_SPEED = 300;
const BACK_DASH_DURATION = 0.1;

let keys: any;
let arrow: Phaser.GameObjects.Rectangle;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#1d1d1d",
  scene: {
    create,
    update
  }
};

new Phaser.Game(config);

function create(this: Phaser.Scene) {
  player = this.add.rectangle(400, 300, 50, 50, 0x00ff00);
  arrow = this.add.rectangle(player.x + 35, player.y, 20, 10, 0xff0000);
  arrow.setOrigin(0.5, 0.5);

  cursors = this.input.keyboard!.createCursorKeys();

  keys = this.input.keyboard?.addKeys({
    attack: Phaser.Input.Keyboard.KeyCodes.Z,
    heavy: Phaser.Input.Keyboard.KeyCodes.X,
    block: Phaser.Input.Keyboard.KeyCodes.SPACE,
    dash: Phaser.Input.Keyboard.KeyCodes.SHIFT
  }) as any;

  attackHitbox = this.add.rectangle(player.x, player.y, 40, 20, 0xffff00);
  attackHitbox.setOrigin(0.5, 0.5);
  attackHitbox.setVisible(false);

  blockHitbox = this.add.rectangle(player.x, player.y, 40, 20, 0x00ff00);
  blockHitbox.setOrigin(0.5, 0.5);
  blockHitbox.setVisible(false);
}

function startAttack(type: "light" | "heavy") {
  isAttacking = true;
  attackType = type;

  if (type === "light") {
    attackTime = LIGHT_DURATION;
    attackCooldown = LIGHT_COOLDOWN;
  } else {
    attackTime = HEAVY_DURATION;
    attackCooldown = HEAVY_COOLDOWN;
  }
}

function startBlock() {
  isBlocking = true;
  blockTime = BLOCK_WINDOW;
  blockCooldown = BLOCK_COOLDOWN;
}

function stopBlock() {
  isBlocking = false;
  blockHitbox.setVisible(false);
}

function startDash(dir: -1 | 1, speed: number, duration = DASH_DURATION) {
  isDashing = true;
  dashTime = duration;
  dashCooldown = DASH_COOLDOWN;
  dashDir = dir;
  dashSpeed = speed;
}

function update(this: Phaser.Scene, time: number, delta: number) {
  const dt = delta / 1000;

  // ---- Ground check ----
  const onGround = player.y >= GROUND_Y;

  // ---- Gravity ----
  velocityY += GRAVITY * dt;
  player.y += velocityY;

  if (player.y > GROUND_Y) {
    player.y = GROUND_Y;
    velocityY = 0;
  }

  // ---- Cooldown timers (always tick) ----
  if (dashCooldown > 0) dashCooldown -= dt;
  if (attackCooldown > 0) attackCooldown -= dt;
  if (blockCooldown > 0) blockCooldown -= dt;

  // ---- Attack stance ----
  if (cursors.up.isDown) {
    attackStance = "high";
  } else if (cursors.down.isDown) {
    attackStance = "low";
  } else {
    attackStance = "mid";
  }
  blockStance = attackStance;

  // ---- Start dash (forward or back) ----
  // Dash cancels attack and block
  if (cursors.shift.isDown && !isDashing && dashCooldown <= 0) {
    if (isAttacking) {
      isAttacking = false;
      attackHitbox.setVisible(false);
    }
    if (isBlocking) {
      stopBlock();
    }

    if (cursors.left.isDown && facing === -1) {
      startDash(-1, DASH_SPEED);
    } else if (cursors.right.isDown && facing === 1) {
      startDash(1, DASH_SPEED);
    } else {
      const backDir = facing === 1 ? -1 : 1;
      startDash(backDir, BACK_DASH_SPEED, BACK_DASH_DURATION);
    }
  }

  // ---- Movement ----
  if (isDashing) {
    player.x += dashDir * dashSpeed * dt;

    dashTime -= dt;
    if (dashTime <= 0) {
      isDashing = false;
    }
  } else {
    const moveAmount = SPEED * dt;

    if (cursors.left.isDown) {
      player.x -= moveAmount;
      facing = -1;
    }
    if (cursors.right.isDown) {
      player.x += moveAmount;
      facing = 1;
    }
  }

  // ---- Start block (instant, with cooldown) ----
  if (!isBlocking && blockCooldown <= 0 && Phaser.Input.Keyboard.JustDown(keys.block)) {
    // block cancels attack
    if (isAttacking) {
      isAttacking = false;
      attackHitbox.setVisible(false);
    }
    startBlock();
  }

  // ---- Start attack ----
  // Can't attack while blocking
  if (!isBlocking && !isAttacking && attackCooldown <= 0) {
    if (keys.attack.isDown) {
      startAttack("light");
    } else if (keys.heavy.isDown) {
      startAttack("heavy");
    }
  }

  // ---- Attack update ----
  if (isAttacking) {
    attackTime -= dt;

    attackHitbox.setVisible(true);

    const offsetX = facing === 1 ? 40 : -40;
    attackHitbox.x = player.x + offsetX;

    if (attackStance === "high") {
      attackHitbox.y = player.y - 20;
    } else if (attackStance === "low") {
      attackHitbox.y = player.y + 20;
    } else {
      attackHitbox.y = player.y;
    }

    if (attackTime <= 0) {
      isAttacking = false;
      attackHitbox.setVisible(false);
    }
  }

  // ---- Block update ----
  if (isBlocking) {
    blockHitbox.setVisible(true);

    const offsetX = facing === 1 ? 40 : -40;
    blockHitbox.x = player.x + offsetX;

    if (blockStance === "high") {
      blockHitbox.y = player.y - 20;
    } else if (blockStance === "low") {
      blockHitbox.y = player.y + 20;
    } else {
      blockHitbox.y = player.y;
    }

    // block window
    blockTime -= dt;
    if (blockTime <= 0) {
      stopBlock();
    }
  }

  // ---- Debug ----
  console.log("x:", player.x, "y:", player.y);

  // ---- Update look arrow ----
  arrow.x = player.x + (facing === 1 ? 35 : -35);
  arrow.y = player.y;
}

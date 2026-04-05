class PlayerPhysicsState {
  constructor() {
    this.reset();
  }
  reset() {
    this.y = 30;
    this.lastY = 30;
    this.lastGroundPosY = 30;
    this.yVelocity = 0;
    this.onGround = true;
    this.canJump = true;
    this.isJumping = false;
    this.gravityFlipped = false;
    this.isFlying = false;
    this.wasBoosted = false;
    this.collideTop = 0;
    this.collideBottom = 0;
    this.onCeiling = false;
    this.upKeyDown = false;
    this.upKeyPressed = false;
    this.isDead = false;
  }
}

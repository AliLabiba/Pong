export default class Ball {
  constructor(x, y, width, height, canvasHeight) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.canvasHeight = canvasHeight;
    this.dy = 500;
    this.dx = 500;

    this.baseSpeed = 500;
    this.speedMultiplier = 1;

    this.sounds = {
      paddleHit: new Audio("./ballHitPaddle.wav"),
      wallHit: new Audio("./ballHitWall.wav"),
    };
  }

  update(dt, paddle1, paddle2) {
    this.x += this.dx * dt * this.speedMultiplier;
    this.y += this.dy * dt * this.speedMultiplier;

    // If the ball hit the top....
    if (this.y <= 0) {
      this.y = 0;
      this.dy *= -1;
      this.sounds.wallHit.play();
    }

    // If the ball hit the bottom....
    if (this.y >= this.canvasHeight - 20) {
      this.y = this.canvasHeight - 20;
      this.dy *= -1;
      this.sounds.wallHit.play();
    }

    if (this.didCollide(paddle1) || this.didCollide(paddle2)) {
      this.dx *= -1;
    }
  }
  render(context) {
    context.fillRect(this.x, this.y, this.width, this.height);
  }

  didCollide(paddle) {
    if (
      this.x < paddle.x + paddle.width &&
      paddle.x < this.x + this.width &&
      this.y < paddle.y + paddle.height &&
      paddle.y < this.y + this.height
    ) {
      this.sounds.paddleHit.play();
      return true; // we have a collision
    }
    return false;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.dx = 500;
    this.dy = 500;
    this.speedMultiplier = 1;
  }

  increaseSpeed(dt) {
    this.speedMultiplier += 0.000005 / dt;
    this.speedMultiplier = Math.min(this.speedMultiplier, 2.5);
  }
}

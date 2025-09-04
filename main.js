import Paddle from "./Paddle.js";
import Ball from "./Ball.js";

const canvas = document.createElement("canvas"); //Where i draw
const context = canvas.getContext("2d") || new CanvasRenderingContext2D(); //How i draw

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 720;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

canvas.setAttribute("tabindex", 1);

document.body.appendChild(canvas);

let difficulty = parseInt(document.getElementById("difficulty").value, 10);

const difficultySlider = document.getElementById("difficulty");
const difficultyValue = document.getElementById("difficultyValue");

difficultySlider.addEventListener("input", (e) => {
  difficulty = parseInt(e.target.value, 10);
  difficultyValue.textContent = difficulty;
});

let aiErrorOffset = 0;
let aiErrorTimer = 0;

let lastTime = 0;

const paddle1 = new Paddle(30, 30, 20, 200, CANVAS_HEIGHT);
const paddle2 = new Paddle(
  CANVAS_WIDTH - 50,
  CANVAS_HEIGHT - 230,
  20,
  200,
  CANVAS_HEIGHT
);

let player1Score = 0;
let player2Score = 0;
let gameState = "start";

const ball = new Ball(
  CANVAS_WIDTH / 2 - 10,
  CANVAS_HEIGHT / 2 - 10,
  20,
  20,
  CANVAS_HEIGHT
);

const sound = {
  score: new Audio("./score.wav"),
};

const keys = {};

canvas.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});
canvas.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

const myFont = new FontFace("Bitcount", "url(./Bitcount.ttf)");
myFont.load().then((font) => {
  document.fonts.add(font);
});

function gameLoop(currentTime = 0) {
  const deltaTime = (currentTime - lastTime) / 1000;
  update(deltaTime);
  lastTime = currentTime;
  requestAnimationFrame(gameLoop); //While true
}

function update(dt) {
  if (keys.Enter) {
    keys.Enter = false;
    if (gameState === "start") {
      gameState = "play";
      difficultySlider.disabled = true;
    } else {
      gameState = "start";
      ball.reset(CANVAS_WIDTH / 2 - 10, CANVAS_HEIGHT / 2 - 10);
      difficultySlider.disabled = false;
    }
  }
  if (keys.w) {
    paddle1.moveUp();
  } else if (keys.s) {
    paddle1.moveDown();
  } else {
    paddle1.stop();
  }

  if (gameState === "play") {
    // Paddle only moves in play state
    let aiCenter = paddle2.y + paddle2.height / 2;
    let targetY = ball.y + ball.height / 2;

    let normalized = difficulty / 10;
    let aiSpeed = paddle2.maxSpeed * Math.pow(Math.max(normalized, 0.3), 2);

    aiErrorTimer -= dt;
    if (aiErrorTimer <= 0) {
      let maxError = (1 - normalized) * 200;
      aiErrorOffset = (Math.random() * 2 - 1) * maxError;
      aiErrorTimer = 0.5; // refresh error every half second
    }

    targetY = ball.y + ball.height / 2 + aiErrorOffset;

    if (targetY < aiCenter - 10) {
      paddle2.dy = -aiSpeed;
    } else if (targetY > aiCenter + 10) {
      paddle2.dy = aiSpeed;
    } else {
      paddle2.stop();
    }
  } else {
    paddle2.stop();
  }

  paddle1.update(dt);
  paddle2.update(dt);

  if (gameState === "play") {
    ball.update(dt, paddle1, paddle2);
    ball.increaseSpeed(dt);
  }
  if (ball.x < 0) {
    player2Score++;
    ball.reset(CANVAS_WIDTH / 2 - 10, CANVAS_HEIGHT / 2 - 10);
    gameState = "start";
    sound.score.play();
  } else if (ball.x > CANVAS_WIDTH) {
    player1Score++;
    ball.reset(CANVAS_WIDTH / 2 - 10, CANVAS_HEIGHT / 2 - 10);
    gameState = "start";
    sound.score.play();
  }

  render();
}

function render() {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.font = "60px Bitcount";
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.fillText(`${player1Score}`, CANVAS_WIDTH * 0.25, 75);
  context.fillText(`${player2Score}`, CANVAS_WIDTH * 0.75, 75);

  //Left paddle
  paddle1.render(context);

  //Ball
  ball.render(context);

  //Right paddle
  paddle2.render(context);
}

gameLoop();

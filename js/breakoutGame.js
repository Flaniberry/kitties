'use strict';
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const btnShowRules = document.querySelector('#rules-btn');
const btnCloseRules = document.querySelector('#close-btn');
const rulesPanel = document.querySelector('#rules');

const brickrowCount = 5;
const brickcolumnCount = 9;

const paddleWidth = 80;
const paddleHeight = 10;
let score = 0;

// create ball propereties
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 4,
  dx: 4,
  dy: -4,
};
// create paddle properties
const paddle = {
  x: canvas.width / 2 - paddleWidth / 2,
  y: canvas.height - 20,
  w: paddleWidth,
  h: paddleHeight,
  speed: 8,
  dx: 0,
};

// brick info
const brick = {
  w: 70,
  h: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
  visible: true,
};

// create bricks
const bricks = [];

function drawBrick(x, y, w, h, visible) {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fillStyle = visible ? '#0095dd' : 'transparent';
  ctx.fill();
  ctx.closePath();
}
function drawBricks() {
  for (let i = 0; i < brickcolumnCount; i++) {
    for (let j = 0; j < brickrowCount; j++) {
      drawBrick(
        bricks[i][j].x,
        bricks[i][j].y,
        bricks[i][j].w,
        bricks[i][j].h,
        bricks[i][j].visible
      );
    }
  }
}
function createBricks() {
  for (let i = 0; i < brickcolumnCount; i++) {
    bricks[i] = [];

    for (let j = 0; j < brickrowCount; j++) {
      const x = brick.offsetX + i * (brick.w + brick.padding);
      const y = brick.offsetY + j * (brick.h + brick.padding);
      bricks[i][j] = { x, y, ...brick };
      // drawBrick(x, y, bricks[i][j].w, bricks[i][j].h, bricks[i][j].visible);
    }
  }
}

// draw ball on canvas
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = '#0095dd';
  ctx.fill();
  ctx.closePath();
}

//draw paddle on canvas
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = '#0095dd';
  ctx.fill();
  ctx.closePath();
}

// draw score on canvas
function drawScore() {
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);
}

// draw everything
function draw() {
  // alert('hi');
  drawBall();
  drawPaddle();
  drawScore();
  createBricks();
  drawBricks();
}
draw();

btnShowRules.addEventListener('click', () => {
  rulesPanel.classList.add('show');
});
btnCloseRules.addEventListener('click', () =>
  rulesPanel.classList.remove('show')
);

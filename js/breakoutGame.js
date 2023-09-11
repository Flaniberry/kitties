'use strict';

// need to use [0] here becasue $('#canvas') returns an array
const canvas = $('#canvas')[0];
// const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const ballImg = new Image(); // Create new img element
ballImg.src = '../images/athena_kitten_small.png'; // Set source path

// detect if app is being accessed by a mobile device
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// prefs not settings. These are only changed by direct edit. Treat as const
const prefs = {
  prefBallDiameterPCofCanvas: 8,
  prefBallSpeed: 0,
  // prefPaddleWidth: 400,
  prefPaddleWidthPCofCanvas: 15,
};
const state = {
  // Need to save the ball dx and dy here and execute after settings panel closes
  // savedBallDx: 0,
  savedBallDy: 0,
  // if ball size is increased so much the ball touches the bottom game will end unless suppressed
  // Can't change settings as slider is clicked or game will fail immediately
  settingsOpen: false,
  ballPaused: true, // can't open panels while ball is paused... as it is at the start
  isMobile: isMobileDevice(),
  canvasMinDimension: 0, // smallest of canvas height and width
  score: 0,
  time: 0, // to be implemented
};

// create ball propereties
const ball = {
  x: 0,
  y: 0,
  diameterPCofCanvasMin: prefs.prefBallDiameterPCofCanvas,
  radius: 0, // calculated in init and when window size changes
  dx: 0,
  dy: 0,
};
// create paddle properties
const paddle = {
  x: 0,
  y: 0,
  wPCofCanvasW: prefs.prefPaddleWidthPCofCanvas,
  w: 0, // calculated in init and when window size changes
  h: 10,
  speed: 0,
  dx: 0,
};

// ONLY CALLED AT BEGINNING
function setInitValues() {
  // run this first to get state.canvasMinDimension, paddle.wPCofCanvasW...
  handleWindowSizeChange();
  if (state.isMobile) {
    prefs.prefBallSpeed = 2;
    paddle.speed = canvas.width / 50;
  } else {
    $('#left-button, #right-button').css('visibility', 'hidden');
    prefs.prefBallSpeed = 4;
    paddle.speed = 8;
  }

  ball.dy = prefs.prefBallSpeed;
  paddle.y = canvas.height - 20; // only changes on win resize
  // paddle.speed = state.isMobile ? canvas.width / 20 : 8;

  // ************* SLIDER VALUES ************************
  $('#ballSpeedSlider').val(Math.abs(ball.dy));
  $('#ballSpeedText').text(Math.abs(ball.dy));

  $('#ballDiameterSlider').val(ball.diameterPCofCanvasMin);
  $('#ballDiameterText').text(ball.diameterPCofCanvasMin);

  $('#paddleWidthSlider').val(paddle.wPCofCanvasW); // normaize to 100
  $('#paddleWidthText').text(paddle.wPCofCanvasW);
}

// called only after win resize and after init
function handleWindowSizeChange() {
  // 3 consts used to check is anything important changed
  const canvasSavedWidth = canvas.width;
  const canvasSavedHeight = canvas.height;
  const brickSavedColCount = brickInfo.colCount;

  // Window and Canvas properties
  const winWidth = window.innerWidth;
  const winHeight = window.innerHeight;
  const viewportOrientation = winHeight < winWidth ? 'Landscape' : 'Portrait';
  if (viewportOrientation === 'Landscape')
    canvas.width = Math.min(800, winWidth - 100);
  else canvas.width = Math.min(800, winWidth - 20); //   very small side margins in portrait mode
  canvas.height = Math.min(700, winHeight) - 210; // accounts for navbar, title, footer

  // If neither canvas dimension changed, stop now
  if (canvas.width === canvasSavedWidth && canvas.height === canvasSavedHeight)
    return;

  state.canvasMinDimension = Math.min(canvas.height, canvas.width);

  // set brickInfo properties
  if (canvas.width <= 500) {
    brickInfo.colCount = 6; // fewer columns
    brickInfo.offsetX = 15; // narrow brick
  } else {
    brickInfo.colCount = 9;
    brickInfo.offsetX = 25;
  }
  brickInfo.w =
    (canvas.width -
      brickInfo.offsetX * 2 -
      brickInfo.padding * (brickInfo.colCount - 1)) /
    brickInfo.colCount;
  if (canvas.height < 400) {
    brickInfo.h = 10; // thin brick
    brickInfo.offsetY = 40; // nearer top
  } else {
    brickInfo.h = 20;
    brickInfo.offsetY = 60;
  }

  // div by 100 for PC, div by 2 for radius
  ball.radius = (ball.diameterPCofCanvasMin * state.canvasMinDimension) / 200;

  paddle.w = (paddle.wPCofCanvasW * canvas.width) / 100;
  paddle.y = canvas.height - 20;

  // if same num of columns, just need to resize bricks
  if (brickSavedColCount === brickInfo.colCount) {
    resetSoft();
    resizeBricks();
  } else {
    // otherwise need to start over with brick arrays
    resetHard();
  }
  drawBricks();
}

// CALLED AFTER win, lose, window resize with col count change
function resetHard() {
  state.score = 0;
  state.time = 0;
  // make all bricks visible
  // bricks.forEach(row, () => row.forEach((brick) => (brick.visible = true)));
  createBricks();
  resetSoft();
}

// CALLED AFTER pause for panel & soft win resize
// Place ball just above paddle and moving 45 degrees up and R
function resetSoft() {
  // start ball in a random x position just above paddle
  ball.x = ball.radius + Math.random() * (canvas.width - ball.radius);
  ball.y = canvas.height - ball.radius - 22;
  // send ball up and to right at 45 degrees
  ball.dy = -state.savedBallDy;
  ball.dx = ball.dy;

  paddle.x = canvas.width / 2 - paddle.w / 2;
}

// ************************ BRICKS *********************
// declare brick array (array of rows of bricks)
let bricks;

// brick info: true for all bricks. Zero values are just placeholders
const brickInfo = {
  // col variables
  colCount: 0,
  w: 0,
  offsetX: 0, // start this far from left wall

  // row variables
  rowCount: 5,
  h: 0,
  offsetY: 0,

  padding: 10, // pad to right and bottom of each brick
};

// initial creation, also need for hard window resize (column count changes)
function createBricks() {
  bricks = [];
  for (let i = 0; i < brickInfo.colCount; i++) {
    bricks[i] = [];

    for (let j = 0; j < brickInfo.rowCount; j++) {
      // const x = brickInfo.offsetX + i * (brickInfo.w + brickInfo.padding);
      // const y = brickInfo.offsetY + j * (brickInfo.h + brickInfo.padding);
      bricks[i][j] = { x: 0, y: 0, visible: true };
    }
  }
  resizeBricks();
}
// call after creatBricks and soft window resize (no column count change)
function resizeBricks() {
  // can't use array.foreach(), need i and j for coordinates
  for (let i = 0; i < bricks.length; i++)
    for (let j = 0; j < bricks[i].length; j++) {
      bricks[i][j].x =
        brickInfo.offsetX + i * (brickInfo.w + brickInfo.padding);
      bricks[i][j].y =
        brickInfo.offsetY + j * (brickInfo.h + brickInfo.padding);
    }
}
// only called by drawBricks()
function drawBrick(brick) {
  ctx.beginPath();
  ctx.rect(brick.x, brick.y, brickInfo.w, brickInfo.h);
  ctx.fillStyle = brick.visible ? '#0095dd' : 'transparent';
  ctx.fill();
  ctx.closePath();
}
// the canvas is always cleared before this is called
function drawBricks() {
  bricks.forEach((row) => row.forEach((brick) => drawBrick(brick)));
}

// draw ball on canvas
function drawBall() {
  // drawImage() is a library function
  ctx.drawImage(
    ballImg, // kitty as ball
    ball.x - ball.radius,
    ball.y - ball.radius,
    2 * ball.radius,
    2 * ball.radius
  );
}

// ? need this once online?
// need to wrap drawImage in onload event to ensure the image is fully loaded before we attmept to draw it
// function loadKittyImage() {
//   // ballImg.onload = () => {
//   //   ctx.drawImage(ballImg, canvas.width - 40, canvas.height - 40);
//   // };
// }

// draw score on canvas
function drawScore() {
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${state.score}`, canvas.width - 90, 20);
}

//draw paddle on canvas
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = '#0095dd';
  ctx.fill();
  ctx.closePath();
}
// move paddle on canvas
function movePaddle() {
  paddle.x += paddle.dx;

  // wall detection
  if (paddle.x < 0) paddle.x = 0;
  if (canvas.width < paddle.x + paddle.w) paddle.x = canvas.width - paddle.w;
}

// used to check if ball is touching a pount (x2, y2): corner of brick or paddle
function ballTouchingPoint(ball, x2, y2) {
  return Math.sqrt((x2 - ball.x) ** 2 + (y2 - ball.y) ** 2) < ball.radius;
}

// if ball is touching point (x2, y2) on brick bounce it vertically or horizontally, increment score & hide brick
function bounceBallIfTouching(ball, brick, x2, y2) {
  // if ball touching point (x2, y2)
  if (Math.sqrt((x2 - ball.x) ** 2 + (y2 - ball.y) ** 2) < ball.radius) {
    if (Math.abs(ball.x - x2) < Math.abs(ball.y - y2))
      ball.dy *= -1; // ball more on top or nbottom so bounce ball vertically
    else ball.dx *= -1; // ball more R or L so bounce ball horizontally
    state.score++;
    brick.visible = false;
    return true; // indicate we bounced so no more checking should be done
  }
  return false; // did not bounce so continue to check
}

// move ball on canvas
function moveBall() {
  if (state.settingsOpen) return;

  ball.x += ball.dx;
  ball.y += ball.dy;

  // ******************************************************
  // *************** paddle detection *********************
  // add small random to prevent deterministic game
  // ******************************************************
  // top left of paddle: paddle.x, paddle.y
  // top right of paddle: paddle.x + paddle.w, paddle.y
  if (ballTouchingPoint(ball, paddle.x, paddle.y)) {
    ball.dy = -Math.abs(ball.dy); // ball touching top L of paddle
    ball.dx = Math.max(
      ball.dx - 0.5 * Math.abs(ball.dy),
      -2 * Math.abs(ball.dy)
    );
  } else if (ballTouchingPoint(ball, paddle.x + paddle.w, paddle.y)) {
    ball.dy = -Math.abs(ball.dy); // ball touching top R of paddle
    ball.dx = Math.min(
      ball.dx + 0.5 * Math.abs(ball.dy),
      2 * Math.abs(ball.dy)
    );
  } else if (
    paddle.x < ball.x && // ball touching center of paddle but missing both top corners
    ball.x < paddle.x + paddle.w &&
    paddle.y - ball.y < ball.radius
  ) {
    ball.dy = -Math.abs(ball.dy); // must be moving up
    const bias = (2 * ball.x - 2 * paddle.x - paddle.w) / paddle.w; // range: -1 to 1
    ball.dx = Math.max(ball.dx - bias * ball.dy, -2 * Math.abs(ball.dy));
    ball.dx = Math.min(ball.dx, 2 * Math.abs(ball.dy));
    // console.log(`bias: ${bias}, ball.dy: ${ball.dy}, ball.dx: ${ball.dx}`);
  }
  // ******************************************************
  // **************** wall detection **********************
  // ** add small random amounts to dx to reduce determinism ****
  // ******************************************************
  // hits top
  // no random here. ball.dy should never stray from the const set in settings or its negative
  else if (ball.y - ball.radius < 0) ball.dy = Math.abs(ball.dy);
  // hits L side
  else if (ball.x - ball.radius < 0) {
    ball.dx = Math.abs(ball.dx) + Math.random(); // add random amount 0-1
    // hits R side
  } else if (canvas.width < ball.x + ball.radius)
    ball.dx = -1 * Math.abs(ball.dx) - Math.random();
  // subtract random amount 0-1
  // ******************************************************
  // * Hits bottom, lose condition, must be after paddle *
  // ******************************************************
  else if (canvas.height < ball.y + ball.radius) {
    console.log('You lose');
    resetHard();
  }
  // ******************************************************
  // ************** brick detection ***********************
  // ******************************************************
  else
    bricks.forEach((row) => {
      row.forEach((brick) => {
        if (brick.visible) {
          // if ball touching: top L, top R, bottom L, bottom R...
          if (bounceBallIfTouching(ball, brick, brick.x, brick.y)) {
          } else if (
            bounceBallIfTouching(ball, brick, brick.x + brickInfo.w, brick.y)
          ) {
          } else if (
            bounceBallIfTouching(ball, brick, brick.x, brick.y + brickInfo.h)
          ) {
          } else if (
            bounceBallIfTouching(
              ball,
              brick,
              brick.x + brickInfo.w,
              brick.y + brickInfo.h
            )
          ) {
          } else if (
            brick.x < ball.x &&
            ball.x < brick.x + brickInfo.w &&
            brick.y < ball.y + ball.radius &&
            ball.y - ball.radius < brick.y + brickInfo.h // ball touching from above or below without touching a corner
          ) {
            ball.dy *= -1; // bounce vertically
            brick.visible = false;
            state.score++;
          } else if (
            brick.y < ball.y &&
            ball.y < brick.y + brickInfo.h &&
            brick.x < ball.x + ball.radius &&
            ball.x - ball.radius < brick.x + brickInfo.w // ball touching from left or right without touching a corner
          ) {
            ball.dx *= -1; // bounce horizontally
            brick.visible = false;
            state.score++;
          }

          // if we won
          if (state.score === brickInfo.colCount * brickInfo.rowCount) {
            console.log('You win!');
            resetHard();
          }
        } // if brick.visible
      }); // inner foreach
    }); // outer foreach
} // function moveBall()

// draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear whole canvas

  drawBall();
  drawPaddle();
  drawScore();
  drawBricks();
}

// move ball and paddle (if necessary) and redraw canvas
function update() {
  movePaddle();
  moveBall();

  draw();
  requestAnimationFrame(update); // library function taking update function as a callback. Like and event loop?
}

// ********** RUN INITIALLY ******************
setInitValues();
console.log(`isMobile: ${isMobileDevice()}`);
pauseBall(); // brief pause
resumeBall();
update(); // only time this should be called

// *******************************************
// ********** EVENT HANDLERS *****************
// *******************************************
// respond to left and right arrow keys
$('body').on('keydown', (e) => {
  if (e.key === 'ArrowLeft') paddle.dx = -paddle.speed;
  if (e.key === 'ArrowRight') paddle.dx = paddle.speed;
});
$('body').on('keyup', () => (paddle.dx = 0));

// mobile only: respond to left and right button clicks
// mousedown is better than click: fires just once per click
$('#left-button').on('click', () => (paddle.x -= paddle.speed * 3));
$('#right-button').on('mousedown', () => (paddle.x += paddle.speed * 3));
// $('#left-button, #right-button').on('mouseup', () => (paddle.dx = 0));

// two helper functions for panel & resize events
//   allows a pause before restart
function pauseBall() {
  state.ballPaused = true;
  // in case ball is double paused avoids the saved speed going to zero
  // don't save dx - needless complication. Just set dx to dy on resume
  if (0 < ball.dy) state.savedBallDy = ball.dy; // save current speed

  ball.dx = 0;
  ball.dy = 0;
}
function resumeBall() {
  // start ball in a random x position just above paddle
  ball.x = ball.radius + Math.random() * (canvas.width - ball.radius);
  ball.y = canvas.height - ball.radius - 22;

  // pause for a sec to get ready
  setTimeout(() => {
    ball.dy = -Math.abs(parseInt(state.savedBallDy)); // moving up
    ball.dx = Math.abs(ball.dy); // 45 degree angle up and to right;
    state.ballPaused = false;
  }, 1000);
}

// respond to showRules and showSettings click event. Then respond to close both
$('#rules-icon').on('click', () => {
  if (!state.ballPaused && !$('#settings').hasClass('show')) {
    // suppress if ball is currently paused or other panel is open
    pauseBall();
    $('#rules').addClass('show');
  }
});
$('#rules-close').on('click', () => {
  $('#rules').removeClass('show');
  resumeBall();
});
$('#settings-icon').on('click', () => {
  state.settingsOpen = true;
  if (!state.ballPaused && !$('#rules').hasClass('show')) {
    // suppress if ball is currently paused or other panel is open
    pauseBall();
    $('#settings').addClass('show');
  }
});
$('#settings-close').on('click', () => {
  $('#settings').removeClass('show');
  state.settingsOpen = false;
  resumeBall();
});

// handle slider changes in settings
$('#ballSpeedSlider').on('change', (e) => {
  $('#ballSpeedText').text($('#ballSpeedSlider').val());
  // state.savedBallDx = $('#ballSpeedSlider').val();
  state.savedBallDy = $('#ballSpeedSlider').val();
});
$('#ballDiameterSlider').on('change', (e) => {
  ball.diameterPCofCanvasMin = $('#ballDiameterSlider').val();
  $('#ballDiameterText').text(ball.diameterPCofCanvasMin);
  const newBallDiam =
    (ball.diameterPCofCanvasMin * state.canvasMinDimension) / 100;
  ball.radius = newBallDiam / 2;
});
$('#paddleWidthSlider').on('change', (e) => {
  paddle.wPCofCanvasW = $('#paddleWidthSlider').val();
  $('#paddleWidthText').text(paddle.wPCofCanvasW);
  paddle.w = (paddle.wPCofCanvasW * canvas.width) / 100;
  paddle.x = (canvas.width - paddle.w) / 2; // put paddle in the middle
});

// respond to window resize event. Wait until resize is done -
// because the "resize" event triggers continuously on size change
let resizeId;
$(window).on('resize', function () {
  clearTimeout(resizeId);
  resizeId = setTimeout(doneResizing, 500);
});
function doneResizing() {
  // in case either or both panes are open these should be closed
  $('#rules').removeClass('show');
  $('#settings').removeClass('show');

  pauseBall();
  resumeBall();
  handleWindowSizeChange();
}

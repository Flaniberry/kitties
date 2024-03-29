'use strict';

const buttonKitties = ['tolstoy', 'circe', 'athena', 'galadriel'];
const delayMs = 1000; // how long for ech demo click
const defaultStartCount = 1;

let gamePattern = []; // random pattern of colors the user must copy

// state indicators. Exactly one will be true
let waiting = true; // nothing hapopening
let demoing = false; // game showing color patter
let responding = false; // user is clicking buttons

let userClickNum = 0; // increments while user is responding

// put everything back to the beginning
function reset() {
  gamePattern = [];
  setStateVariables('waiting');
  userClickNum = 0;
  $('#level').text('0');
}

function setStateVariables(trueStateName) {
  // console.log(trueStateName);

  waiting = false;
  demoing = false;
  responding = false;
  if (trueStateName === 'waiting') waiting = true;
  if (trueStateName === 'demoing') demoing = true;
  if (trueStateName === 'responding') responding = true;
}

// return a random integer between low and high
function myRandom(low, high) {
  let randomNumber = Math.random();
  return Math.floor(randomNumber * (high - low + 1)) + low;
}

// called at beginning of "demoing" state to add a step to the sequence
function addStepToSequence() {
  const randomChosenKitty = buttonKitties[myRandom(0, 3)];
  gamePattern.push(randomChosenKitty);
  $('#count').text(gamePattern.length);
}

// in demoing state.
function demoPattern() {
  for (let i = 0; i < gamePattern.length; i++) {
    setTimeout(function () {
      new Audio('../sounds/' + gamePattern[i] + '.mp3').play();
      $('#' + gamePattern[i]).addClass('pressed');
    }, i * delayMs);

    setTimeout(function () {
      $('#' + gamePattern[i]).removeClass('pressed');
    }, (i + 0.5) * delayMs);
  }

  setTimeout(function () {
    setStateVariables('responding');
  }, (gamePattern.length + 0.3) * delayMs);
}

// Adds a step to gamePattern and then demos the whole pattern
function addStepAndDemoPattern() {
  userClickNum = 0;
  addStepToSequence();
  demoPattern();
}

// responds to user clicking sam or "restart". Starts the game
$('#restart-pic, #restart').on('click', function () {
  if (waiting) {
    reset();
    setStateVariables('demoing');
    addStepAndDemoPattern();
  }
  if (responding) {
    setTimeout(() => {
      reset();
      setStateVariables('demoing');
      addStepAndDemoPattern();
    }, 500);
  }
});

// event listeners for 4 main kitty buttons
// if correct color clicked: flash, play sound, increment rn, check if done
// if incorrect: fail sound and flash, reset everything
$('.myBtn').on('click', function (e) {
  if (!responding) return;

  const kittyClicked = e.currentTarget.classList[1];
  if (kittyClicked === gamePattern[userClickNum]) {
    new Audio('../sounds/' + kittyClicked + '.mp3').play();
    $('#' + kittyClicked).addClass('pressed');

    setTimeout(function () {
      $('#' + kittyClicked).removeClass('pressed');
    }, 200);
    userClickNum++;
    if (userClickNum === gamePattern.length) {
      // console.log('you win');
      setStateVariables('demoing');
      setTimeout(() => {
        new Audio('../sounds/ding.mp3').play();
        $('body, #kitty-paw').addClass('correct-sequence');
      }, 300);
      setTimeout(() => {
        $('body, #kitty-paw').removeClass('correct-sequence');
      }, 900);
      setTimeout(function () {
        addStepAndDemoPattern();
      }, 2000);
    }
  } else {
    // console.log(e);
    new Audio('../sounds/angryCat.mp3').play();
    $('body').addClass('game-over');
    setTimeout(() => {
      $('body').removeClass('game-over');
      reset();
    }, 2600);
  }
});

// rules button
$('btnShowRules').on('click', () => $('#rules').addClass('show'));
$('btnCloseRules').on('click', () => $('#rules').removeClass('show'));

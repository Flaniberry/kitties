'use strict';
// const figureParts = document.querySelectorAll('.figure-part');
const figureParts = $('.figure-part').toArray();

// detect if app is being accessed by a mobile device
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// const focusMethod = function getFocus() {
//   document.getElementById('myTextField').focus();
// };

const words =
  'feline, tabby, kitten, meow, purr, kitty, grimalkin, meow, pussycat, mouser, caterwaul, tiger, lion, queen, angora, leopard, cat, tomcat, cheetah, cougar, tortoiseshell, wildcat, whisker, jaguar, siamese, mouse, shorthair, ratter, calico, persian, longhair, bobcat, puma, litter, catbird, paw, lynx, bell, ocelot, tiger, panther, litter, pussyfoot, kitten, catnip, litter, meow, fur, whiskers, hissss, paw, tail, nap'.split(
    ', '
  );

let selectedWord;
const correctLetters = [];
const wrongLetters = [];
function resetGame() {
  $('#guess-input').val(''); //$('#shares').val('');
  selectedWord = words[Math.floor(Math.random() * words.length)];
  correctLetters.length = 0;
  wrongLetters.length = 0;
  $('#wrong-letter-list').text('');
  $('.figure-part').addClass('hide');
  displayWord();
}

// show correctly guessed letters in secret word
function displayWord() {
  $('#word').html(`
  ${selectedWord
    .split('')
    .map(
      (letter) => `
      <span class="letter" >
      ${correctLetters.includes(letter) ? letter : ''}
      </span>
      `
    )
    .join('')}
      `);

  const wordWithoutSpaces = $('#word').text().replace(/\s/g, '');

  if (wordWithoutSpaces === selectedWord) {
    $('#final-message').text('Congratulations! 😊 ');
    $('#popup-container').css('display', 'flex');
    // $(“h1”).css (“color”, “purple”);
  }
} // displayWord()

// Initial calls
if (isMobileDevice()) $('#guess-input-container').addClass('mobile'); // show input box on mobile devices
resetGame();

// *******************************************
// ********** EVENT HANDLERS *****************
// *******************************************

// #guess-input for mobile, body for PC. I think body would work for both
$('#guess-input, body').on('keydown', (e) => {
  const ignorChars =
    'alt, backspace, delete, enter, arrowleft, arrowdown, arrowup, arrowright, pagedown, pageup, capslock, tab, control'.split(
      ', '
    );

  const key = e.key.toLowerCase();
  if (e.shiftKey || ignorChars.includes(key)) return;
  if (key.charCodeAt(0) < 97 || 122 < key.charCodeAt(0)) return; // not a letter

  if (correctLetters.includes(key) || wrongLetters.includes(key)) {
    // show popup
    $('#notification-container').addClass('show');
    setTimeout(() => {
      $('#notification-container').removeClass('show');
    }, 2000);
  } else if (selectedWord.includes(key)) {
    correctLetters.push(key);
    displayWord();
  } else {
    wrongLetters.push(key);
    $('#wrong-letter-list').text($('#wrong-letter-list').text() + key);
    $('.figure-part')[wrongLetters.length - 1].classList.remove('hide');
    if (6 <= wrongLetters.length) {
      $('#final-message').html(`You lose ☹<br>The word was "${selectedWord}"`);
      // resetGame();
      $('#popup-container').css('display', 'flex');
    }
  }
  // console.log(selectedWord, wrongLetters);
});

$('#play-button').on('click', () => {
  $('#popup-container').css('display', 'none');
  resetGame();
});

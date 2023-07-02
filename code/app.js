'use strict';

const btnEncode = document.querySelector('#btnEncode');
const btnDecode = document.querySelector('#btnDecode');
const txtInput = document.querySelector('#txtInput');
const txtOutput = document.querySelector('#txtOutput');
const clipboard = document.querySelector('#clipboard');
const eraser = document.querySelector('#eraser');
const offsetForLetters = 19; // num between 0 (no change) and 25

// 65 - 90  A to Z
// 97 - 122 a to z
// receives a letter (upper or lower case) and returns an offset letter (must be between zero and 25)
function enOrDeCodeChar(c, offset) {
  const asciiVal = c.charCodeAt(0);
  let newAsciiVal;
  if ('A' <= c && c <= 'Z') newAsciiVal = ((asciiVal + offset - 65) % 26) + 65;
  // lowercase letter
  else newAsciiVal = ((asciiVal + offset - 97) % 26) + 97;

  return String.fromCharCode(newAsciiVal);
}

function codeBtnHelper(offset) {
  txtOutput.value = '';
  for (const c of txtInput.value) {
    if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z'))
      txtOutput.value = enOrDeCodeChar(c, offset) + txtOutput.value;
    else txtOutput.value = c + txtOutput.value;
  }
}

btnEncode.addEventListener('click', (e) => {
  codeBtnHelper(offsetForLetters);
});

// to decode reverse the offset: 26-offset
btnDecode.addEventListener('click', (e) => {
  codeBtnHelper(26 - offsetForLetters);
});

// copy output text to clipboard
clipboard.addEventListener('click', (e) => {
  navigator.clipboard.writeText(txtOutput.value);
});

// erase text from first text area
eraser.addEventListener('click', (e) => {
  txtInput.value = '';
});

// clear output every time there is an edit to input
txtInput.addEventListener('input', (e) => {
  txtOutput.value = '';
});

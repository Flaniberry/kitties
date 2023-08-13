'use strict';

const btnEncrypt = document.querySelector('#btnEncrypt');
const btnDecrypt = document.querySelector('#btnDecrypt');
const txtInput = document.querySelector('#txtInput');
const txtOutput = document.querySelector('#txtOutput');
const clipboard = document.querySelector('#clipboard');
const eraser = document.querySelector('#eraser');

const codebook = [
  'f',
  'd',
  'y',
  'h',
  'l',
  't',
  'p',
  'a',
  'x',
  'b',
  'z',
  'i',
  'q',
  'g',
  'n',
  'v',
  'j',
  'u',
  'c',
  'o',
  'r',
  'k',
  'e',
  'w',
  's',
  'm',
];

// 65 - 90  A to Z
// 97 - 122 a to z
// receives a letter (upper or lower case) and the corresponding letter from codebook
function enOrDecryptChar(c, encrypt) {
  // first make all chars lowercase
  if ('A' <= c && c <= 'Z') c = c.toLowerCase();

  if (encrypt) return codebook[c.charCodeAt(0) - 97];
  else return String.fromCharCode(codebook.indexOf(c) + 97);
  //   return String.fromCharCode(newAsciiVal);
}

function codeBtnHelper(encrypt) {
  let inputText = txtInput.value;
  // if encoding and last char is a period, strip final period first
  if (encrypt && inputText.charAt(inputText.length - 1) === '.')
    inputText = inputText.substring(0, inputText.length - 1);

  txtOutput.value = '';
  for (const c of inputText) {
    if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z'))
      txtOutput.value = enOrDecryptChar(c, encrypt) + txtOutput.value;
    else txtOutput.value = c + txtOutput.value;
  }
}

btnEncrypt.addEventListener('click', (e) => {
  codeBtnHelper(true);
});

// to decrypt reverse the offset: 26-offset
btnDecrypt.addEventListener('click', (e) => {
  codeBtnHelper(false);
});

// erase text from first text area
eraser.addEventListener('click', (e) => {
  txtInput.value = '';
  txtOutput.value = '';
  disOrEnableButtons();
  txtInput.select();
});

// copy output text to clipboard and flash border to provide feedback
clipboard.addEventListener('click', (e) => {
  if (txtOutput.value === '') return;
  navigator.clipboard.writeText(txtOutput.value);

  // make boder flash for 1/10 second
  txtOutput.classList.add('highlight');
  setTimeout(() => {
    txtOutput.classList.remove('highlight');
  }, 100);
});

function disOrEnableButtons() {
  if (txtInput.value === '') {
    btnEncrypt.setAttribute('disabled', '');
    btnDecrypt.setAttribute('disabled', '');
  } else {
    btnEncrypt.removeAttribute('disabled');
    btnDecrypt.removeAttribute('disabled');
  }
}

// disable buttons if input is empty
// clear output every time there is an edit to input
txtInput.addEventListener('input', (e) => {
  txtOutput.value = '';
  disOrEnableButtons();
});

document.addEventListener(
  // 'load',
  'DOMContentLoaded',
  function () {
    txtInput.select();
  },
  false
);

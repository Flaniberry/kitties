"use strict";

const btnEncode = document.querySelector('#btnEncode');
const btnDecode = document.querySelector('#btnDecode');
const txtInput = document.querySelector('#txtInput');
const txtOutput = document.querySelector('#txtOutput');
const clipboard = document.querySelector('#clipboard');
const offsetForLetters = 21; // num between 0 (no change) and 25

// 65 - 90  A to Z
// 97 - 122 a to z
// receives a letter (upper or lower case) and returns an offset letter (must be between zero and 25)
function encode(c, offset) {
  const asciiVal = c.charCodeAt(0);
  let newAsciiVal = 0;
  if ('A' <= c && c <= 'Z')
    newAsciiVal = (((asciiVal + offset) - 65) % 26) + 65;
  else // lowercase letter
    newAsciiVal = (((asciiVal + offset) - 97) % 26) + 97;
    
  return String.fromCharCode(newAsciiVal);
}

function decode(c, offset) {
  const asciiVal = c.charCodeAt(0);
  let newAsciiVal = 0;
  if ('A' <= c && c <= 'Z')
    newAsciiVal = (((asciiVal - offset + 26) - 65) % 26) + 65;
  else // lowercase letter
    newAsciiVal = (((asciiVal - offset + 26) - 97) % 26) + 97;
    
  return String.fromCharCode(newAsciiVal);
}

btnEncode.addEventListener('click', (e) => {
  txtOutput.value = "";
  for (const c of txtInput.value) {
    if(('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z'))
      txtOutput.value = txtOutput.value + encode(c, offsetForLetters);
    else
      txtOutput.value = txtOutput.value + c;
  }
});

btnDecode.addEventListener('click', (e) => {
  txtOutput.value = "";
  for (const c of txtInput.value) {
    if(('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z'))
      txtOutput.value = txtOutput.value + decode(c, offsetForLetters);
    else
      txtOutput.value = txtOutput.value + c;
  }
});

// copy output text to clipboard
clipboard.addEventListener('click', (e) => {
  navigator.clipboard.writeText(txtOutput.value);
});


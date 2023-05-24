const gameBody = document.getElementById("game-body");
const letterSquares = document.getElementsByClassName("letter-square");
const hitbox = document.getElementsByClassName("hitbox");
const listOfWordsSpace = document.getElementById("list-of-words");
const root = document.querySelector(':root');
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let firstUserWord = Array.from(
  document.querySelectorAll('.user-word')
  ).pop();
let userWord = document.querySelector('.user-word')
const letters = "abcdefghijklmnopqrstuvwxyz";
let board = [[]];
let results;
let userString = "";
let userStringIndex = ["a"];
let mouseDown = 0;
let words;
let usedWords = [];
let score = 0;
let started = false;
let currentlyHovering = [];

let color = document.getElementById('color-picker');

color.addEventListener('input', function(e) {
  changeSiteTheme(this.value, true)
})

document.getElementById("apply-changes").onclick = function() {
  changeSiteTheme(color.value, false);
}
  
if (localStorage.getItem("fullColor") == null) {
  changeSiteTheme("#35AED9", false);
} else {
  changeSiteTheme(localStorage.getItem("fullColor"), false);
}
// I find myself in quite the interesting dilemma, understanding the responsibilities I owe to those in power. Why must I feel an inclination to use an online artificial intelligence to assist me with my problems when I can do it myself? It's truly an interesting situation that I never expected we'd be in. It's ever-so convenient and I think I am addicted to it. God forgive me for my sins and furthermore my future in programming.
  
// Converted to using CSS variables instead of updating each elements' properties.
function changeSiteTheme(hexCode, isPreview) {
  // Convert the hex code to RGB values
  const rgb = hexToRgb(hexCode);
  
  // Calculate the HSL values from the RGB values
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  const darkColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l / 7}%)`;
  const midColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l / 3}%)`;
  const heldColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l / 1.5}%)`;
  const fullColor = `hsl(${hsl.h}, ${hsl.s}%,${hsl.l}%)`;
  const lineColor = `hsla(${hsl.h}, ${hsl.s}%,${hsl.l / 0.8}%, 0.8)`;
  const isBright = hsl.l > 60;
  let textColor;
  if (!isPreview) {   
    if (isBright) textColor = "#000000";
    else textColor = "#FFFFFF";
    
    colorsToLocalStore(darkColor, hexCode, midColor, heldColor, textColor, lineColor)
    setCSSVar("dark-color", localStorage.getItem("darkColor"));
    setCSSVar("full-color", localStorage.getItem("fullColor"));
    setCSSVar("mid-color", localStorage.getItem("midColor"));
    setCSSVar("held-color", localStorage.getItem("heldColor"));
    setCSSVar("tile-text-color", localStorage.getItem("textColor"));
    setCSSVar("line-color", localStorage.getItem("lineColor"));
    color.value = localStorage.getItem("fullColor");
  }
  
  setCSSVar("dark-color-preview", darkColor);
  setCSSVar("full-color-preview", fullColor);
  setCSSVar("mid-color-preview", midColor);
  setCSSVar("held-color-preview", heldColor);
  if (isBright) setCSSVar("tile-text-color-preview", "#000000");
  else setCSSVar("tile-text-color-preview", "#FFFFFF");
}


function setCSSVar(name, value) {
  root.style.setProperty(`--${name}`, value);
}

function getCSSVar() {
  let rs = getComputedStyle(root);
  return rs;
}

function colorsToLocalStore(darkColor, fullColor, midColor, heldColor, textColor, lineColor) {
  localStorage.setItem("darkColor", darkColor);
  localStorage.setItem("fullColor", fullColor);
  localStorage.setItem("midColor", midColor);
  localStorage.setItem("heldColor", heldColor);
  localStorage.setItem("textColor", textColor);
  localStorage.setItem("lineColor", lineColor);
}

function hexToRgb(hex) {
  // Remove the '#' symbol if present
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }

  // Parse the hex values for red, green, and blue
  const red = parseInt(hex.substring(0, 2), 16);
  const green = parseInt(hex.substring(2, 4), 16);
  const blue = parseInt(hex.substring(4, 6), 16);

  return { r: red, g: green, b: blue };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Not my finest creation but it works.
const closeTiles = {
  "a": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  0: [1, 4, 5],
  1: [0, 2, 4, 5, 6],
  2: [1, 3, 5, 6, 7],
  3: [2, 6, 7],
  4: [0, 1, 5, 8, 9],
  5: [0, 1, 2, 4, 6, 8, 9, 10],
  6: [1, 2, 3, 5, 7, 9, 10, 11],
  7: [2, 3, 6, 7, 10, 11],
  8: [4, 5, 9, 12, 13],
  9: [4, 5, 6, 8, 10, 12, 13, 14],
  10: [5, 6, 7, 9, 11, 13, 14, 15],
  11: [6, 7, 10, 14, 15],
  12: [8, 9, 13],
  13: [8, 9, 10, 12, 14],
  14: [9, 10, 11, 13, 15],
  15: [10, 11, 14]
}


// Import a fuckton of words
fetch('words.txt')
  .then(response => response.text())
  .then(data => {
    words = data.split(/\r?\n/)
    words = new Set(words);
  })
  .catch(error => {
    console.error(error);
  });


// Define the probability distribution of each letter in the English language
const letterFrequencies = {
  a: 0.08167,
  b: 0.01492,
  c: 0.02782,
  d: 0.04253,
  e: 0.12702,
  f: 0.02228,
  g: 0.02015,
  h: 0.06094,
  i: 0.06966,
  j: 0.00153,
  k: 0.00772,
  l: 0.04025,
  m: 0.02406,
  n: 0.06749,
  o: 0.07507,
  p: 0.01929,
  q: 0.00095,
  r: 0.05987,
  s: 0.06327,
  t: 0.09056,
  u: 0.02758,
  v: 0.00978,
  w: 0.02360,
  x: 0.00150,
  y: 0.01974,
  z: 0.00074
};


// Step 1: Compute the total probability mass
let totalMass = 0;
for (const letter in letterFrequencies) {
  totalMass += letterFrequencies[letter];
}

function startGame(firstTime) {
  let result= "";
  console.log("start");
  if (urlParams.has('seed') && firstTime) {
    result = urlParams.get('seed');
  } else {
    // Step 2: Generate 16 random letters using the probability distribution
    let vowelsCount = 0;
    let letterCounts = {};
    result = "";
    
    while (result.length < 16 || vowelsCount < 4) {
      // Generate a random number between 0 and 1
      const r = Math.random();
    
      // Find the letter whose cumulative probability is greater than the random number
      let cumulativeProb = 0;
      for (const letter in letterFrequencies) {
        cumulativeProb += letterFrequencies[letter] / totalMass;
        if (r < cumulativeProb) {
          // Check if the letter count exceeds the limit
          if (letterCounts[letter] && letterCounts[letter] >= 2) {
            continue;
          }
    
          result += letter;
    
          // Update the letter count
          letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    
          // Update the vowels count if the letter is a vowel
          if (isVowel(letter)) {
            vowelsCount++;
          }
    
          break;
        }
      }
    }
  }
  
  // Function to check if a letter is a vowel
  function isVowel(letter) {
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    return vowels.includes(letter.toUpperCase());
  }
  
  // Dynamically generate a board of 16 tiles.
  for (let i = 0; i < 16; i++) {
    let letter = result[i];
    if (i % 4 === 0 && i !== 0) {
      board.push([]);
    }
    board[board.length-1].push(letter);
    let letterSquare = document.createElement("div");
  
    const hitbox = document.createElement('div');
    hitbox.className = 'hitbox';
  
    letterSquare.innerText = letter.toUpperCase();
    letterSquare.className = "letter-square";
  
    letterSquare.dataset.value = letter.toUpperCase();
    letterSquare.dataset.index = i;
    letterSquare.dataset.status = "released";
  
    letterSquare.append(hitbox);
  
    gameBody.append(letterSquare);
  }
  console.log("before")
  // Find all the words possible
  setTimeout(() => {
    results = solveBoggle(board, words);
    results.sort(function(a, b){return b.length - a.length});
    
    for (let i = results.length-1; i > 0; i--) {
      if (results[i].length < 3) results.pop()
      else break;
    }
    document.querySelector(':root').style.setProperty("--rows", `${Math.ceil(results.length / 40)}`)
    //console.log(getComputedStyle(document.querySelector(':root')).getPropertyValue('--rows'))
    //console.log(results);
    document.getElementById("game-body-background").style.display = "grid";
    document.getElementById("loading").innerText = "Done!";
    startEventListener();
    console.log("end")
    setTimeout(() => {
      document.getElementById("loading").innerText = "";
    }, 2000);
  }, 2000);
}

startGame(true);

function restartGame() {
  console.log("here")
  document.getElementById("game-body-background").style.display = "none";
  document.getElementById("score").innerText = "SCORE:";
  document.getElementById("words-amount").innerText = "WORDS:";
  document.getElementById("time-left").innerText = "80";
  document.getElementById("loading").innerText = "Loading...";
  document.getElementById("play-again").style.display = "none";   
  document.getElementById("post-game-buttons").style.display = "none";      
  gameBody.innerHTML = `<p class="user-word" data-status="released"></p>`;
  firstUserWord = Array.from(
    document.querySelectorAll('.user-word')
  ).pop();
  userWord = document.querySelector('.user-word')
  usedWords = [];
  userString = "";
  userStringIndex = ["a"];
  board = [[]]
  gameBody.style.pointerEvents = "auto";
  started = false;
  score = 0;
  console.log("here 1")
  removeLine()
  startGame(false);
  console.log("here 2")
}


// If a user has their mouse clicked down and hovering over a tile
function elementClicked(letter) {
  
  // If user is not currently holding down left click.
  if (mouseDown === 0) {
    return;
  }

  
  if (!userStringIndex.includes(letter.dataset.index) && closeTiles[`${userStringIndex[userStringIndex.length - 1]}`].includes(Number(letter.dataset.index))) {
    createLine(hitbox[letter.dataset.index])
    
    userWord.style.display = "block";
    userString += letter.dataset.value;
    userStringIndex.push(letter.dataset.index);
    userWord.innerText = userString;
    
    if (userString.length < 3) {
      changeStatus("held")
      changeStatusLine("held")
    } else if (usedWords.includes(userString.toLowerCase())) {
      changeStatus("used-word")
      changeStatusBox("used-word")
      changeStatusLine("used-word")
    } else if (words.has(userString.toLowerCase())) {
      changeStatus("valid-word")
      changeStatusBox("valid-word")
      changeStatusLine("valid-word")
      userWord.innerText += ` (+${getScore(userString)})`
    } else {
      changeStatus("held")
      changeStatusBox("held")
      changeStatusLine("held")
    }

    
    // console.log(closeTiles[`${userStringIndex[userStringIndex.length - 1]}`])
    // console.log(userStringIndex[userStringIndex.length - 1])
    // console.log(userStringIndex)
  }
}

// Function that changes the status dataset of all tiles
function changeStatus(status) {
  for (i = 1; i < userStringIndex.length; i++) {
    letterSquares[userStringIndex[i]].dataset.status = status;
  }
}

function changeStatusLine(status) {
  for (i = 1; i < document.getElementsByClassName("line").length; i++) {
    document.getElementsByClassName("line")[i].dataset.status = status;
  }
}

function changeStatusBox(status) {
  userWord.dataset.status = status;
}

// What we will do when the user releases their mouse
function release() {
  lineEventThingIDK(false)
  removeLine()
  
  //console.log("Released!");
  
  changeStatus("released")
  
  if (userString.length >= 3 && words.has(userString.toLowerCase()) && !usedWords.includes(userString.toLowerCase())) {
    if (words.has(userString.toLowerCase())) {
      usedWords.push(userString.toLowerCase());
    }
    score += getScore(userString);
    document.getElementById("score").innerText = "SCORE: "+score;
    document.getElementById("words-amount").innerText = "WORDS: "+usedWords.length;
  }
  userWord.dataset.word = userWord.innerText;
  createWordBox();
  
  userString = "";
  userStringIndex = ["a"];
  //console.log(userString);
}

function getScore(word) {
  return Math.round((66.7107 * Math.pow(word.length, 2) - 168.826 * word.length) / 100) * 100
}

function createWordBox() {
  userWord.style.display = "block";
  // DONT TOUCH IT WORKS I DONT KNOW HOW IT BREAKS IF I DO ANYTHING
  userWord.innerText = userWord.dataset.word;
  //console.log(userWord.style.opacity)
  userWord.classList.add("animate");

  // remove the "animate" class after 1 second to reset the animation
  setTimeout(() => {
    firstUserWord.remove();
  }, 1000);

  box = document.createElement("p");
  box.className = "user-word";
  box.dataset.status = "released";
  gameBody.prepend(box);
  
  firstUserWord = Array.from(
    document.querySelectorAll('.user-word')
    ).pop();
  userWord = document.querySelector('.user-word')
  //console.log(firstUserWord.style.opacity)
}

let thingIshappening = false;
function startEventListener() {

  // Define helper function to handle tile events
  function handleTileEvent(tile) {
    if (!started) startTimer();
    elementClicked(tile);
  }
  
  // Iterate over each tile and add event listeners
  for (let i = 0; i < letterSquares.length; ++i) {
  
    // Add the hitbox to the tile
  
    // Add click event listeners for desktop devices
    letterSquares[i].addEventListener('mousedown', () => {
      ++mouseDown;
      createLine(hitbox[i])
      handleTileEvent(letterSquares[i]);
    });
  
    // Add touch event listeners for mobile devices
    letterSquares[i].addEventListener('touchstart', () => {
      ++mouseDown;
      createLine(hitbox[i])
      handleTileEvent(letterSquares[i]);
    });
  
    // Add hover event listeners for desktop devices
    hitbox[i].addEventListener('mouseover', function(event) {
      elementClicked(letterSquares[i]);
    });
  
    // Add touch move event listeners for mobile devices
    hitbox[i].addEventListener('touchmove', (event) => {
      event.preventDefault();
      const touch = event.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      //handleTileEvent(element);
      //console.log(element, hitbox[i])
      if (element.className === "hitbox") {
        //console.log(element)
        handleTileEvent(element.parentElement);
      }
    });
  
  }
  
  // Add event listener to body for mouseup and touchend events
  document.body.addEventListener('mouseup', () => {
    if (mouseDown !== 0) {
      mouseDown = 0;
      release();
    }
  });
  
  document.body.addEventListener('touchend', () => {
    if (mouseDown !== 0) {
      mouseDown = 0;
      release();
    }
  });
}

function lineEventThingIDK(thingIshappening) {
  document.getElementById("game-body-background").addEventListener("mousemove", function(event) {
    if (!thingIshappening && currentlyHovering.length != 0 && mouseDown > 0)
      lineThings(event, currentlyHovering[currentlyHovering.length-1])
  })
  document.getElementById("game-body-background").addEventListener("touchmove", function(event) {
    if (!thingIshappening && currentlyHovering.length != 0 && mouseDown > 0)
      lineThings(event, currentlyHovering[currentlyHovering.length-1])
  })
}

lineEventThingIDK(false)

function createLine(hitbox) {
  if (!currentlyHovering.includes(hitbox) && mouseDown > 0) {
    currentlyHovering.push(hitbox);
    if (currentlyHovering.length > 1) {
      connectLineToNextBox(currentlyHovering[currentlyHovering.length - 2], currentlyHovering[currentlyHovering.length - 1])
      lineEventThingIDK(true)
    } 
    let line = document.createElement("div")
    line.className = "line";
    line.dataset.status = "held";
    document.getElementById("game-body-background").prepend(line);
  } 
}

let lineRotation;
function lineThings(event, startElement) {
  const line = document.querySelector(".line");
  line.style.display = "none";
  const box = startElement.getBoundingClientRect();
  const containerForEverything = document.getElementById("game-body-background");
  const containerBox = containerForEverything.getBoundingClientRect();
  const boxTop = box.top - containerBox.top;
  const boxLeft = box.left - containerBox.left;
  const xCenter = (box.left + box.right) / 2;
  const yCenter = (box.top + box.bottom) / 2;
  const boxWidth = box.width/2;
  const boxHeight = box.height/2;
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  const lineHeight = line.clientHeight;
  if (mouseX < boxLeft + boxWidth) line.style.left = boxLeft-boxWidth+"px";
  else line.style.left = boxLeft+boxWidth+"px";
  if (mouseY < boxTop + boxHeight) line.style.top = boxTop-boxHeight+"px";
  else line.style.top = boxTop+boxHeight+"px";
  const distanceXRaw = mouseX - xCenter;
  const distanceYRaw = mouseY - yCenter;
  const distanceX = Math.abs(distanceXRaw);
  const distanceY = Math.abs(distanceYRaw);
  const distance = Math.hypot(distanceX, distanceY);
  const angleRadians = Math.atan(distanceY / distanceX);
  let angle = angleRadians * (180 / Math.PI);
  if (mouseX < xCenter && mouseY > yCenter) angle = 180 - angle;
  else if (mouseX > xCenter && mouseY < yCenter) angle = -angle;
  else if (mouseX < xCenter && mouseY < yCenter) angle = 180 + angle;
  lineRotation = angle;
  //console.log(mouseX < xCenter, mouseY < yCenter)
  line.style.width = distance+lineHeight+"px";
  line.style.transform = `rotate(${angle}deg) translate(-50%, -50%)`
  line.style.marginLeft = distanceXRaw/2+"px";
  line.style.marginTop = distanceYRaw/2+"px";
}

function connectLineToNextBox(previousBox, nextBox) {
  const line = document.querySelector(".line");
  line.style.display = "block";
  const lineHeight = line.clientHeight;
  const firstBoxInformation = previousBox.getBoundingClientRect();
  const secondBoxInformation = nextBox.getBoundingClientRect();
  const firstPosX = (firstBoxInformation.left + firstBoxInformation.right) / 2;
  const secondPosX = (secondBoxInformation.left + secondBoxInformation.right) / 2;
  const distanceX = secondPosX - firstPosX;
  const firstPosY = (firstBoxInformation.top + firstBoxInformation.bottom) / 2;
  const secondPosY = (secondBoxInformation.top + secondBoxInformation.bottom) / 2;
  const distanceY = secondPosY - firstPosY;
  const totalDistance = Math.hypot(distanceX, distanceY);
  line.style.width = totalDistance+lineHeight+"px";
  line.style.marginLeft = distanceX/2+"px";
  line.style.marginTop = distanceY/2+"px";
  const angleRadians = Math.atan(Math.abs(distanceY) / Math.abs(distanceX));
  let angle = angleRadians * (180 / Math.PI);
  if (secondPosX < firstPosX && secondPosY > firstPosY) angle = 180 - angle;
  else if (secondPosX > firstPosX && secondPosY < firstPosY) angle = -angle;
  else if (secondPosX < firstPosX && secondPosY < firstPosY) angle = 180 + angle;
  line.style.transform = `rotate(${angle}deg) translate(-50%, -50%)`
  thingIshappening = false;
  lineEventThingIDK(false)
}

function removeLine() {
  currentlyHovering = [];
  const line = document.querySelectorAll(".line");
  for (let i = 0; i < line.length; i++) {
    line[i].remove();
  }
  lineEventThingIDK(false)
}


function startTimer() {
  started = true;
  timeLeft = 80;
  let timer = setInterval(() => {
    --timeLeft;
    document.getElementById("time-left").innerText = timeLeft;
    if (timeLeft === 0) {
      //console.log("OUT OF TIME!!!!!!!")

      gameBody.style.pointerEvents = "none";   
      document.getElementById("post-game-buttons").style.display = "flex";
      document.getElementById("play-again").style.display = "block";

      clearInterval(timer)
    }
  }, 1000);
}


function solveBoggle(board, dictionary) {
  const rows = board.length;
  const cols = board[0].length;
  const results = new Set();

  // Define helper function to explore the board
  function explore(row, col, visited, word) {
    // Check if current cell is out of bounds or has been visited
    if (row < 0 || row >= rows || col < 0 || col >= cols || visited[row][col]) {
      return;
    }

    // Add current letter to the word being constructed
    word += board[row][col];

    // Check if word is in dictionary
    if (dictionary.has(word)) {
      results.add(word);
    }

    // Mark current cell as visited
    visited[row][col] = true;

    // Explore all neighboring cells
    explore(row - 1, col - 1, visited, word);
    explore(row - 1, col, visited, word);
    explore(row - 1, col + 1, visited, word);
    explore(row, col - 1, visited, word);
    explore(row, col + 1, visited, word);
    explore(row + 1, col - 1, visited, word);
    explore(row + 1, col, visited, word);
    explore(row + 1, col + 1, visited, word);

    // Mark current cell as unvisited
    visited[row][col] = false;
  }

  // Iterate over each cell on the board and explore all paths
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      explore(i, j, Array(rows).fill().map(() => Array(cols).fill(false)), '');
    }
  }

  return Array.from(results);
}

function showWords() {
  document.getElementById("show-words").style.display = "none";
  let window = document.getElementById("list-of-words")
  window.style.display = "flex";
  results.forEach(word => {
    if (!document.getElementById(word.length)) {
      let row = document.createElement("div");
      row.id = word.length;
      let textAbove = document.createElement("p");
      textAbove.innerText = word.length+" letters";
      textAbove.style.fontWeight = "bold";
      textAbove.style.fontSize = "2rem";
      row.append(textAbove);
      window.append(row);
    }
    let wordElement = document.createElement("p");
    wordElement.innerText = word;
    if (usedWords.includes(word)) {
      wordElement.style.color = "green";
      wordElement.style.fontWeight = "bold";
    } 
    document.getElementById(word.length).append(wordElement);
  });
}

function closeWords() {
  let window = document.getElementById("list-of-words")
  window.innerHTML = `<button onclick="closeWords()">Close</button>`;
  window.style.display = "none";
  document.getElementById("show-words").style.display = "block";
}

function showSettings(pressingButtonWillOpen) {
  if (pressingButtonWillOpen) document.getElementById("settings-page").style.display = "block";
  else document.getElementById("settings-page").style.display = "none";
}

function generateEmojiBoard() {
  summonCopyText()

  const boardEmojified = [[
    board[0].map(el => ":regional_indicator_" + el + ":").join(" ") + "\n",
    board[1].map(el => ":regional_indicator_" + el + ":").join(" ") + "\n",
    board[2].map(el => ":regional_indicator_" + el + ":").join(" ") + "\n",
    board[3].map(el => ":regional_indicator_" + el + ":").join(" ")
  ].join('')];

  let copyVal = `Words: ${usedWords.length}\nScore: ${score}\n${boardEmojified}`;

  navigator.clipboard.writeText(copyVal);
}

function copySeed() {
  summonCopyText()
  let seed = board.join("").split(",").join("");
  let copyVal = `https://horsegamesforhorsepeople.github.io/horsegame/index.html?seed=${seed}`
  navigator.clipboard.writeText(copyVal);
}

function summonCopyText() {
  userWord.style.display = "block";
  userWord.dataset.word = "Copied";
  userWord.textContent = "Copied";
  setTimeout(() => {
    createWordBox();
  }, 500);
}

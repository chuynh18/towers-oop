"use strict";

const DUMMY_GRID_SIZE = newGame();
const game = new Board(DUMMY_GRID_SIZE);
const playerGuesses = create2dArray(DUMMY_GRID_SIZE);
const activeCell = {x: null, y: null};

const tower = document.getElementById("tower");
const tDraw = tower.getContext("2d");
// const clickInfo = document.getElementById("click");
render();

// resize and rerender game board when window is resized
window.onresize = function () {
   render();
}

// keypresses - enter and delete numbers from game board
window.onkeyup = function(e) {
   if (activeCell.x !== null && activeCell.y !== null) {
      const key = Number(e.key);
      if (key > 0 && key <= DUMMY_GRID_SIZE) {
         if (activeCell.x > 0 && activeCell.x <= DUMMY_GRID_SIZE && activeCell.y > 0 && activeCell.y <= DUMMY_GRID_SIZE) {
            updateBoard(key, activeCell.x, activeCell.y);
            activeCell.x = null;
            activeCell.y = null;
            render();
            // document.getElementById("click2").textContent = ` | active cell: none`;
         }
      } else if (e.key === "Backspace" || e.key === "Delete") {
         if (activeCell.x > 0 && activeCell.x <= DUMMY_GRID_SIZE && activeCell.y > 0 && activeCell.y <= DUMMY_GRID_SIZE) {
            updateBoard(null, activeCell.x, activeCell.y);
            activeCell.x = null;
            activeCell.y = null;
            render();
            // document.getElementById("click2").textContent = ` | active cell: none`;
         }
      } else if (DUMMY_GRID_SIZE === 10 && key === 0) {
         if (activeCell.x > 0 && activeCell.x <= DUMMY_GRID_SIZE && activeCell.y > 0 && activeCell.y <= DUMMY_GRID_SIZE) {
            updateBoard(10, activeCell.x, activeCell.y);
            activeCell.x = null;
            activeCell.y = null;
            render();
            // document.getElementById("click2").textContent = ` | active cell: none`;
         }
      }

      if (renderClues() && isBoardFull()) {
         victory();
      }
   }
}

// onclick - activate/deactivate cells on game board
tower.onclick = function(e) {
   const clickedCell = calculateClickCoords(e);
   clearCanvas();
   drawGrid(DUMMY_GRID_SIZE);

   if (renderClues() && isBoardFull()) {
      victory();
   }

   if (clickedCell.x > 0 && clickedCell.x <= DUMMY_GRID_SIZE && clickedCell.y > 0 && clickedCell.y <= DUMMY_GRID_SIZE) {
      activateCell(clickedCell, DUMMY_GRID_SIZE, true);
   } else {
      activateCell(activeCell, DUMMY_GRID_SIZE);
   }

   drawNumbers();
}

// get size of <body> so that game board can be scaled appropriately
function resizeCanvas() {
   const bodyWidth = document.getElementsByTagName("body")[0].clientWidth;
   const windowHeight = 0.98 * window.innerHeight - 65;
   const size = bodyWidth > windowHeight ? windowHeight : bodyWidth;
   tower.width = size;
   tower.height = size;
}

// draws the lines that form the game board
function drawGrid(numCells) {
   const cellPixels = tower.width / (numCells + 2);

   for (let i = 1; i < numCells + 2; i++) {
      const stepSize = cellPixels * i;

      tDraw.beginPath();
      tDraw.moveTo(stepSize, cellPixels);
      tDraw.lineTo(stepSize, tower.width - cellPixels);
      tDraw.stroke();

      tDraw.beginPath();
      tDraw.moveTo(cellPixels, stepSize);
      tDraw.lineTo(tower.width - cellPixels, stepSize);
      tDraw.stroke();
   }
}

// gets coordinates of pixels clicked on game board, translates to cell coordinates
function calculateClickCoords(e) {
   const rect = tower.getBoundingClientRect();

   const x = e.clientX - rect.left;
   const y = e.clientY - rect.top;

   const cellPixels = tower.width / (DUMMY_GRID_SIZE + 2);
   const cellX = Math.floor(x/cellPixels);
   const cellY = Math.floor(y/cellPixels);

   // clickInfo.textContent = `x: ${x}, y: ${y} | last clicked cell: (${cellX}, ${cellY})`;

   return {x: cellX, y: cellY};
}

// updates activeCell variable with cell coordinates clicked (also deactivates)
function activateCell(cellCoords, numCells, fromClick) {
   if (cellCoords.x === null) {
      return;
   }

   if (fromClick && cellCoords.x === activeCell.x && cellCoords.y === activeCell.y) {
      activeCell.x = null;
      activeCell.y = null;

      // document.getElementById("click2").textContent = ` | active cell: none`;

      render();
      return;
   }

   activeCell.x = cellCoords.x;
   activeCell.y = cellCoords.y;

   // document.getElementById("click2").textContent = ` | active cell: (${activeCell.x}, ${activeCell.y})`;

   highlightCell(cellCoords, numCells, "#cccccc");
}

// draws cell highlight
function highlightCell(cellCoords, numCells, color) {
   const cellPixels = tower.width / (numCells + 2);
   const x = cellCoords.x * cellPixels;
   const y = cellCoords.y * cellPixels;

   tDraw.fillStyle = color;
   tDraw.fillRect(x, y, cellPixels, cellPixels);
}

// clears the entire canvas
function clearCanvas() {
   tDraw.clearRect(0, 0, tower.width, tower.width);
}

// creates empty 2d array to hold player input
function create2dArray(size) {
   const arr = new Array(size);

   for (let i = 0; i < size; i++) {
      arr[i] = new Array(size);
   }

   return arr;
}

// renders player guesses onto the game board
// also returns true if there were any dupes
function drawNumbers() {
   let dupe = false;

   for (let i = 0; i < playerGuesses.length; i++) {
      for (let j = 0; j < playerGuesses[i].length; j++) {
         if (typeof playerGuesses[j][i] === "number") {
            if (isDupe(j, i)) {
               placeNum(playerGuesses[j][i], "red", i + 1, j + 1);
               dupe = true;
            } else {
               placeNum(playerGuesses[j][i], "black", i + 1, j + 1);
            }
         }
      }
   }

   return dupe;
}

// draws text into a cell on the canvas; textObj object holds text and cell coordinates
// format of textObj param is {text, color, x, y}; font size is computed
function drawTextToCell(textObj, numCells) {
   const fontSize = tower.width / (2 * (numCells + 2));
   tDraw.font = `${fontSize}px Arial`;
   tDraw.fillStyle = textObj.color;
   tDraw.textAlign = "center";

   const x = (tower.width / (numCells + 2)) * (textObj.x + 0.5);
   const y = (tower.width / (numCells + 2)) * (textObj.y + 0.65);

   tDraw.fillText(textObj.text, x, y);
}

// function that is actually called to render text into a cell
// handles grid offset so that only the playable game board is rendered upon
function placeNum(num, color, x, y) {
   if (x > DUMMY_GRID_SIZE + 1 || y > DUMMY_GRID_SIZE + 1) {
      console.log("Attempted to draw number outside of the grid!");
      console.log(`Grid size: ${DUMMY_GRID_SIZE}, x: ${x}, y: ${y}`);
      return;
   }

   drawTextToCell({
      text: num,
      color: color,
      x: x,
      y: y
   }, DUMMY_GRID_SIZE);
}

// function that calls all functions necessary to render the game board appropriately
// will "do the right thing" regardless of game state
function render() {
   resizeCanvas();
   clearCanvas();
   drawGrid(DUMMY_GRID_SIZE);

   if (renderClues() && isBoardFull()) {
      victory();
   }

   activateCell(activeCell, DUMMY_GRID_SIZE);
   drawNumbers();
}

// helper function that mutates the playerGuesses array with the player's input
function updateBoard(guess, x, y) {
   playerGuesses[y - 1][x - 1] = guess;
}

// returns true if a duplicate number is detected in the same column or row
function isDupe(x, y) {
   const value = playerGuesses[x][y];

   if (typeof value !== "number") {
      return false;
   }

   for (let i = 0; i < DUMMY_GRID_SIZE; i++) {
      if (playerGuesses[i][y] === value && i !== x) {
         return true;
      }

      if (playerGuesses[x][i] === value && i !== y) {
         return true;
      }
   }

   return false;
}

// draws the game clues along the edges of the game board
function renderClues() {
   let valid = true;

   for (let i = 0; i < DUMMY_GRID_SIZE; i++) {
      // top row of clues, left to right
      const topCol = [];

      for (let j = 0; j < DUMMY_GRID_SIZE; j++) {
         topCol.push(playerGuesses[j][i]);
      }

      if (validateFullClue(topCol, game.clues[i])) {
         placeNum(game.clues[i], "gray", i + 1, 0);
      } else {
         placeNum(game.clues[i], "red", i + 1, 0);
         valid = false;
      }

      // right column of clues, top to bottom
      const leftRow = [];

      for (let j = DUMMY_GRID_SIZE - 1; j >= 0; j--) {
         leftRow.push(playerGuesses[i][j]);
      }

      if (validateFullClue(leftRow, game.clues[i + DUMMY_GRID_SIZE])) {
         placeNum(game.clues[i + DUMMY_GRID_SIZE], "gray", DUMMY_GRID_SIZE + 1, i + 1);
      } else {
         placeNum(game.clues[i + DUMMY_GRID_SIZE], "red", DUMMY_GRID_SIZE + 1, i + 1);
         valid = false;
      }

      // bottom row of clues, right to left
      const bottomCol = [];

      for (let j = DUMMY_GRID_SIZE - 1; j >= 0; j--) {
         bottomCol.push(playerGuesses[j][DUMMY_GRID_SIZE - i - 1]);
      }

      if (validateFullClue(bottomCol, game.clues[i + (2 * DUMMY_GRID_SIZE)])) {
         placeNum(game.clues[i + (2 * DUMMY_GRID_SIZE)], "gray", DUMMY_GRID_SIZE - i, DUMMY_GRID_SIZE + 1);
      } else {
         placeNum(game.clues[i + (2 * DUMMY_GRID_SIZE)], "red", DUMMY_GRID_SIZE - i, DUMMY_GRID_SIZE + 1);
         valid = false;
      }

      // left column of clues, bottom to top
      if (validateFullClue(playerGuesses[DUMMY_GRID_SIZE - i - 1], game.clues[i + (3 * DUMMY_GRID_SIZE)])) {
         placeNum(game.clues[i + (3 * DUMMY_GRID_SIZE)], "gray", 0, DUMMY_GRID_SIZE - i);
      } else {
         placeNum(game.clues[i + (3 * DUMMY_GRID_SIZE)], "red", 0, DUMMY_GRID_SIZE - i);
         valid = false;
      }

   }

   return valid;
}

// prompts user for desired game board size, returns input if it's a number between 4 and 10 inclusive
function newGame() {
   let boardSize = Number(prompt("What size game board would you like?  (Enter between 4 and 10)"));

   if (typeof boardSize === "number" && boardSize >= 4 && boardSize <= 10) {
      return boardSize;
   } else {
      return newGame();
   }
}

// draws green background on game board; is called upon victory
function victory() {
   for (let i = 0; i < DUMMY_GRID_SIZE; i++) {
      for (let j = 0; j < DUMMY_GRID_SIZE; j++) {
         highlightCell({x: i + 1, y: j + 1}, DUMMY_GRID_SIZE, "#ccffcc");
      }
   }

   drawGrid(DUMMY_GRID_SIZE);
   drawNumbers();
}

// returns number of visible towers in a line (line means row or column)
// line is an array of numbers and must be built before being fed in
function countVisible(line) {
   let answer = 1;
   let largest = line[0];
   
   for (let i = 0; i < line.length; i++) {
      if (line[i] > largest) {
         answer++;
         largest = line[i];
      }
   }

   return answer;
}

// returns true if line is full and valid
// IMPORTANT:  also returns true if line is incomplete
// returns false if line is full and invalid
function validateFullClue(line, clueValue) {
   for (let i = 0; i < line.length; i++) {
      if (typeof line[i] !== "number") {
         return true;
      }
   }

   if (countVisible(line) === clueValue) {
      return true;
   }

   return false;
}

// true if every cell has user input, false otherwise
function isBoardFull() {
   for (let i = 0; i < DUMMY_GRID_SIZE; i++) {
      for (let j = 0; j < DUMMY_GRID_SIZE; j++) {
         if (typeof playerGuesses[i][j] !== "number") {
            return false;
         }
      }
   }

   return true;
}

function validateTopClue(clueNum, clueValue) {
   if (clueNum > DUMMY_GRID_SIZE) {
      console.log("check yourself before you wreck yourself");
   }

   const column = [];
   
   for (let i = 0; i < DUMMY_GRID_SIZE; i++) {
      column.push(playerGuesses[i][clueNum]);
   }

   for (let i = 0; i < DUMMY_GRID_SIZE; i++) {
      
   }

   return true;
}
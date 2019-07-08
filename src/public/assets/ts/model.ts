"use strict";

import { Board } from "./Board";
import { CanvasRenderer } from "./canvas-renderer";
import { arrayCompare, calculateDesiredCanvasSize } from "./utility";
import {
   RenderConfig,
   HighlightConfig,
   DrawTextConfig,
   ClueViolation
} from "./interfaces";

/**
 * The model that holds the entirety of the game state.
 */
export class Game {
   /**
    * activeCell contains the current active cell.  [-1, -1] means no cell is
    * active.  Otherwise, the array contains the x and y cell coordinates of the
    * currently active cell.
    */
   private activeCell: [number, number] = [-1, -1];
   private board: Board;
   private cluesAndGuesses: number[][] = [];
   private drawTextConfigBoard: DrawTextConfig[][] = [];
   private view: CanvasRenderer;

   /**
    * Initializes the game.
    * 
    * @param  {CanvasRenderer} view - CanvasRenderer object.
    * @param  {number} gameBoardSize - Desired size of game board.
    */
   constructor(view: CanvasRenderer, gameBoardSize: number) {
      this.view = view;
      this.board = new Board(gameBoardSize);
      this.buildArray(gameBoardSize + 2, this.cluesAndGuesses);
      this.buildArray(gameBoardSize + 2, this.drawTextConfigBoard);
      this.populateGuessArrayWithClues();
      this.showBoard( calculateDesiredCanvasSize() );
   }
   
   /**
    * If a cell is active, returns the current value of that active cell, which
    * is either a number or undefined if the cell is blank.  If no cell is
    * currently active, returns -1.
    * 
    * @returns number
    */
   public getValueAtActiveCell(): number {
      if (this.activeCell[0] > -1 && this.activeCell[1] > -1) {
         return this.cluesAndGuesses[this.activeCell[1]][this.activeCell[0]];
      } else {
         return -1;
      }
   }

   /**
    * Sets this.activeCell to the appropriate value.
    * 
    * If this.activeCell and clickedCellCoordinates are the same, then the active
    * cell is set to [-1, -1] (inactive).  Otherwise, the active cell is set to
    * clickedCellCoords if clickedCellCoords is valid, e.g. not the outer edge
    * of the game board, which is not playable and reserved for clue display.
    * 
    * @param  {[number, number]} clickedCellCoords - the coordinates of the cell
    * to be activated.  In the format [x, y], with the top-left corner of the
    * board being cell [0, 0].
    *
    * @returns void
    */
   public activateCell(clickedCellCoords: [number, number]): void {
      // if user clicks the already active cell, deactivate it
      if (arrayCompare(this.activeCell, clickedCellCoords)) {
         this.activeCell[0] = -1; // remember, [-1, -1] means no active cell!
         this.activeCell[1] = -1;
      } else if (
         // else set active cell to clicked cell coords... if coords are valid
         clickedCellCoords[0] > 0 && clickedCellCoords[0] < this.cluesAndGuesses.length - 1 &&
         clickedCellCoords[1] > 0 && clickedCellCoords[1] < this.cluesAndGuesses.length - 1
      ) {
         this.activeCell[0] = clickedCellCoords[0];
         this.activeCell[1] = clickedCellCoords[1];
      } else if (clickedCellCoords[0] === -1 && clickedCellCoords[1] === -1) {
         // deactivate cell if clickedCellCoords is [-1, -1]
         this.activeCell[0] = -1;
         this.activeCell[1] = -1;
      }
   }

   /**
    * Takes in desired size and variable pointing to an array as arguments.
    * Fills target array with empty arrays such that the target array contains
    * a square 2d array of dimensions size by size. 
    * 
    * @param  {number} size - (uint) the desired size of the 2d array
    * @param  {any[]} target - the target array to "flesh out"
    * 
    * @returns void
    */
   private buildArray(size: number, target: any[]) {
      target.length = 0;

      for (let i = 0; i < size; i++) {
         target[i] = new Array(size);
      }
   }
   
   /**
    * Populates the guess array with the clues the player needs to play Towers.
    * 
    * @returns void - because this.cluesAndGuesses is mutated.
    */
   private populateGuessArrayWithClues(): void {
      const clues = this.board.getClues();

      // Uh-oh, SpaghettiOs!
      for (let i = 0; i < clues.length / 4; i++) {
         this.cluesAndGuesses[0][i + 1] = clues[i]; // top
         this.cluesAndGuesses[i + 1][this.cluesAndGuesses.length - 1] = clues[clues.length / 4 + i]; // right
         this.cluesAndGuesses[this.cluesAndGuesses.length - 1][this.cluesAndGuesses.length - i - 2] = clues[clues.length / 2 + i]; // bottom
         this.cluesAndGuesses[this.cluesAndGuesses.length - i - 2][0] = clues[(3 * clues.length) / 4 + i]; // left
      }
   }

   /**
    * Checks a cell's row and column for duplicate values.
    * 
    * @param  {number} x - x-coordinate of cell with [0, 0] being top left
    * @param  {number} y - y-coordinate of cell
    * 
    * @returns boolean - true means duplicate detected, false otherwise
    */
   private checkDuplicateNumber(x: number, y: number): boolean {
      const value = this.cluesAndGuesses[y][x];

      if (!value) {
         return false;
      }

      for (let i = 1; i < this.cluesAndGuesses.length - 1; i++) {
         if (i !== y && value === this.cluesAndGuesses[i][x]) {
            return true;
         }

         if (i !== x && value === this.cluesAndGuesses[y][i]) {
            return true;
         }
      }

      return false;
   }

   /**
    * Checks a specified top clue for validity.  Returns true if clue has been
    * violated.  Returns false if clue has not been violated.
    * 
    * @param  {number} x - x-coordinate of top clue to check
    * 
    * @returns boolean
    */
   private checkClueViolationTop(x: number): ClueViolation {
      if (x > 0 && x < this.cluesAndGuesses.length - 1) {
         const column: number[] = [];
         let columnFilled = true;

         for (let i = 1; i < this.cluesAndGuesses.length - 1; i++) {
            const value = this.cluesAndGuesses[i][x];

            if (typeof value === "undefined") {
               columnFilled = false;
            }

            column.push(value);
         }

         const numVisibleTowers = this.board.computeVisibleTowers(column);

         if (columnFilled) {
            return {
               violation: this.cluesAndGuesses[0][x] !== numVisibleTowers,
               lineFilled: true
            };
         } else {
            return {
               violation: this.cluesAndGuesses[0][x] < numVisibleTowers,
               lineFilled: false
            };
         }   
      } else {
         throw new RangeError(`X value ${x} is not valid.`);
      }
   }

    /**
    * Checks a specified right clue for validity.  Returns true if clue has been
    * violated.  Returns false if clue has not been violated.
    * 
    * @param  {number} y - y-coordinate of right clue to check
    * 
    * @returns boolean
    */
   private checkClueViolationRight(y: number): ClueViolation {
      if (y > 0 && y < this.cluesAndGuesses.length - 1) {
         const row: number[] = [];
         let rowFilled = true;

         for (let i = this.cluesAndGuesses.length - 2; i > 0; i--) {
            const value = this.cluesAndGuesses[y][i];

            if (typeof value === "undefined") {
               rowFilled = false;
            }

            row.push(value);
         }

         const numVisibleTowers = this.board.computeVisibleTowers(row);

         if (rowFilled) {
            return {
               violation: this.cluesAndGuesses[y][this.cluesAndGuesses.length - 1] !== numVisibleTowers,
               lineFilled: true
            };
         } else {
            return {
               violation: this.cluesAndGuesses[y][this.cluesAndGuesses.length - 1] < numVisibleTowers,
               lineFilled: false
            };
         }
      } else {
         throw new RangeError(`Y value ${y} is not valid.`);
      }
   }

    /**
    * Checks a specified bottom clue for validity.  Returns true if clue has
    * been violated.  Returns false if clue has not been violated.
    * 
    * @param  {number} x - x-coordinate of bottom clue to check
    * 
    * @returns boolean
    */
   private checkClueViolationBottom(x: number): ClueViolation {
      if (x > 0 && x < this.cluesAndGuesses.length - 1) {
         const column: number[] = [];
         let columnFilled = true;

         for (let i = this.cluesAndGuesses.length - 2; i > 0; i--) {
            const value = this.cluesAndGuesses[i][x];

            if (typeof value === "undefined") {
               columnFilled = false;
            }

            column.push(value);
         }

         const numVisibleTowers = this.board.computeVisibleTowers(column);

         if (columnFilled) {
            return {
               violation: this.cluesAndGuesses[this.cluesAndGuesses.length - 1][x] !== numVisibleTowers,
               lineFilled: true
            };
         } else {
            return {
               violation: this.cluesAndGuesses[this.cluesAndGuesses.length - 1][x] < numVisibleTowers,
               lineFilled: false
            };
         }
      } else {
         throw new RangeError(`X value ${x} is not valid.`);
      }
   }

   /**
    * Checks a specified left clue for validity.  Returns true if clue has been
    * violated.  Returns false if clue has not been violated.
    * 
    * @param  {number} y - y-coordinate of left clue to check
    * 
    * @returns boolean
    */
   private checkClueViolationLeft(y: number): ClueViolation {
      if (y > 0 && y < this.cluesAndGuesses.length - 1) {
         const row = this.cluesAndGuesses[y].slice(1, this.cluesAndGuesses.length - 1);
         let rowFilled = true;

         for (let i = 0; i < row.length; i++) {
            if (typeof row[i] === "undefined") {
               rowFilled = false;
            }
         }

         const numVisibleTowers = this.board.computeVisibleTowers(row);

         if (rowFilled) {
            return {
               violation: this.cluesAndGuesses[y][0] !== numVisibleTowers,
               lineFilled: true
            };
         } else {
            return {
               violation: this.cluesAndGuesses[y][0] < numVisibleTowers,
               lineFilled: false
            };
         }
         
      } else {
         throw new RangeError(`Y value ${y} is not valid.`);
      }
   }

   /**
    * Scans this.cluesAndGuesses and inserts or updates the appropriate
    * DrawTextConfig objects into the corresponding slots of this.drawTextConfigBoard
    * 
    * @returns void
    */
   private updateDrawTextArray(): void {
      for (let i = 0; i < this.cluesAndGuesses.length; i++) {
         for (let j = 0; j < this.cluesAndGuesses[i].length; j++) {
            const cell = this.cluesAndGuesses[i][j];
            const drawTextCell = this.drawTextConfigBoard[i][j];

            // if there's a number, create or update corresponding
            // DrawTextConfig object as appropriate
            if (typeof cell !== "undefined") {
               if (typeof drawTextCell === "undefined") {
                  this.drawTextConfigBoard[i][j] = {text: String(cell)};
               } else {
                  drawTextCell.text = String(cell);
               }
            } else {
               if (typeof drawTextCell === "undefined") {
                  this.drawTextConfigBoard[i][j] = {text: ""};
               } else {
                  drawTextCell.text = "";
               }
            }
         }
      }
   }

   /**
    * Validates the board.  Highlights invalid cells in red.
    * 
    * @returns void
    */
   private validateBoard(): boolean {
      let valid = true;

      // scan the playable area of the board for duplicate numbers
      for (let i = 1; i < this.cluesAndGuesses.length - 1; i++) {
         for (let j = 1; j < this.cluesAndGuesses[i].length - 1; j++) {
            const drawTextCell = this.drawTextConfigBoard[i][j];

            if (this.checkDuplicateNumber(j, i)) {
               drawTextCell.color = "red";
               valid = false;
            } else {
               drawTextCell.color = "blue";
            }
         }
      }

      // scan the board for clue violations
      for (let i = 1; i < this.cluesAndGuesses.length - 1; i++) {
         const top = this.checkClueViolationTop(i);
         const right = this.checkClueViolationRight(i);
         const bottom = this.checkClueViolationBottom(i);
         const left = this.checkClueViolationLeft(i);

         if (top.violation && top.lineFilled) {
            valid = false;
            this.drawTextConfigBoard[0][i].color = "red";
         } else if (top.violation && !top.lineFilled) {
            this.drawTextConfigBoard[0][i].color = "orange";
         } else {
            this.drawTextConfigBoard[0][i].color = "black";
         }

         if (right.violation && right.lineFilled) {
            valid = false;
            this.drawTextConfigBoard[i][this.drawTextConfigBoard.length - 1].color = "red";
         } else if (right.violation && !right.lineFilled) {
            this.drawTextConfigBoard[i][this.drawTextConfigBoard.length - 1].color = "orange";
         } else {
            this.drawTextConfigBoard[i][this.drawTextConfigBoard.length - 1].color = "black";
         }

         if (bottom.violation && bottom.lineFilled) {
            valid = false;
            this.drawTextConfigBoard[this.drawTextConfigBoard.length - 1][i].color = "red";
         } else if (bottom.violation && !bottom.lineFilled) {
            this.drawTextConfigBoard[this.drawTextConfigBoard.length - 1][i].color = "orange";
         } else {
            this.drawTextConfigBoard[this.drawTextConfigBoard.length - 1][i].color = "black";
         }

         if (left.violation && left.lineFilled) {
            valid = false;
            this.drawTextConfigBoard[i][0].color = "red";
         } else if (left.violation && !left.lineFilled) {
            this.drawTextConfigBoard[i][0].color = "orange";
         } else {
            this.drawTextConfigBoard[i][0].color = "black";
         }
      }

      return valid;
   }

   
   /**
    * Returns true if the user has completely filled out the board.
    * 
    * @returns boolean
    */
   private userHasFilledOutBoard(): boolean {
      for (let i = 1; i < this.cluesAndGuesses.length - 1; i++) {
         for (let j = 1; j < this.cluesAndGuesses[i].length - 1; j++) {
            if (typeof this.cluesAndGuesses[i][j] === "undefined") {
               return false;
            }
         }
      }

      return true;
   }

   /**
    * deletes guess at the currently active cell
    * 
    * @returns void
    */
   public deleteGuess(): void {
      if (
         this.activeCell[0] > 0 && this.activeCell[0] < this.cluesAndGuesses.length - 1 &&
         this.activeCell[1] > 0 && this.activeCell[1] < this.cluesAndGuesses.length - 1
      ) {
         delete this.cluesAndGuesses[this.activeCell[1]][this.activeCell[0]];
      }
   }

   /**
    * Updates the cluesAndGuesses 2d array with the user's guess.  Returns true
    * if valid and successful, false otherwise.
    * 
    * @param  {number|string} guess - the value of the user's guess
    * 
    * @returns boolean - true if insertion was performed, false if insertion
    * request was invalid and therefore not performed.
    */
   public insertGuess(guess: number | string): boolean {
      guess = Number(guess);

      if (guess <= 0 || guess > this.cluesAndGuesses.length - 2) {
         console.log(`Guess value ${guess} is not valid.`);
         return false;
      } else if (
         this.activeCell[0] > 0 && this.activeCell[0] < this.cluesAndGuesses.length - 1 &&
         this.activeCell[1] > 0 && this.activeCell[1] < this.cluesAndGuesses.length - 1
      ) {
         this.cluesAndGuesses[this.activeCell[1]][this.activeCell[0]] = Number(guess);
         return true;
      } else {
         console.log(`Invalid coordinates:  ${this.activeCell}`);
         return false;
      }
   }

   /**
    * Draws victory "ceremony"
    * 
    * @returns void
    */
   private victory(): void {
      console.log("placeholder victory yay");
   }

   /**
    * @param  {number} pixelSize
    * @returns void
    */
   public showBoard(pixelSize?: number): void {
      this.updateDrawTextArray();
      const valid = this.validateBoard();
      const filledBoard = this.userHasFilledOutBoard();
      console.log(`valid: ${valid}, filled board: ${filledBoard}`);

      const renderConfig: RenderConfig = {
         padding: 1,
         board: this.drawTextConfigBoard
      };

      if (typeof pixelSize === "number") {
         renderConfig.canvasSize = pixelSize;
      }

      if (this.activeCell[0] > -1 && this.activeCell[1] > -1) {
         const highlightConfig: HighlightConfig = {
            x: this.activeCell[0],
            y: this.activeCell[1],
            color: "LightGray"
         };

         renderConfig.highlight = highlightConfig;
      }

      this.view.render(renderConfig);

      if (valid && filledBoard) {
         this.victory();
      }
   }
}
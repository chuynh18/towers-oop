"use strict";

/**
 * The game board generator - browser version
 */
export class Board {
   // holds an instance of the game board
   private gameBoard: number[][];

   // holds clues that the player uses to guess the board's contents
   private clues: number[];

   // upon instantiation of Board(), generate board of requested size
   constructor(size: number) {
      this.gameBoard = this.generateBoard(size);
      this.clues = this.generateClues(this.gameBoard);
   }

   // number of attempts it took to generate the board
   private boardGenerationAttempts: number;

   // game board getter
   public getBoard(): number[][] {
      return this.gameBoard;
   }

   // clues getter
   public getClues(): number[] {
      return this.clues;
   }

   // get # of attempts it took to generate a valid board
   public getAttempts(): number {
      return this.boardGenerationAttempts;
   }

   // ugly hack wrapper to brute force generate board lololol
   private generateBoard(size: number): number[][] {
      let counter = 0;
      let board;

      do {
         board = this.attemptToGenerateBoard(size);
         counter++;
      }
      while (typeof board === "boolean");

      this.boardGenerationAttempts = counter;
      return board;
   }

   // generates game board of specified size (game boards are square)
   private attemptToGenerateBoard(size: number): number[][] | boolean {
      // array that will contain the game board
      const board: number[][] | boolean = [];
   
      // build game board
      for (let i = 0; i < size; i++) {
         board.push(new Array<number>(size));
      }
   
      for (let i = 0; i < size; i++) {
         // array of valid indices to place number
         const validIndices: number[] = [];
         for (let j = 0; j < size; j++) {
            validIndices.push(j);
         }

         for (let j = 0; j < size; j++) {
            // build array of empty indices in the current row
            const emptySpots = this.getEmptySpots(board[j]);

            // possible spots to place value
            let candidateIndices = validIndices.filter(num => emptySpots.indexOf(num) > -1);

            if (candidateIndices.length === 0) {
               return false;
            }

            const indexToPlaceNumber = candidateIndices[Math.floor(Math.random() * candidateIndices.length)]

            // insert number into board
            board[j][indexToPlaceNumber] = i + 1;

            // remove just-used index from validIndices
            validIndices.splice(validIndices.indexOf(indexToPlaceNumber), 1);
         }
      }
   
      return board;
   }

   // returns array of indices corresponding to null slots of array
   // used by board generation method attemptToGenerateBoard()
   private getEmptySpots(row: number[]): number[] {
      const emptySpots: number[] = [];
      for (let i = 0; i < row.length; i++) {
         if (!row[i]) {
            emptySpots.push(i);
         }
      }
      
      return emptySpots;
   }

   // generates clues that player will use to play the game
   // length of clues array is four times the board size
   // starts from the top left of the board moving clockwise
   private generateClues(board: number[][]): number[] {
      const clues: number[] = [];

      // starting from top left, moving right
      // builds columns of numbers running top to bottom
      for (let i = 0; i < board.length; i++) {
         const column: number[] = [];

         for (let j = 0; j < board.length; j++) {
            column.push(board[j][i]);
         }

         clues.push(this.computeVisibleTowers(column));
      }

      // starting from the top right, moving down
      // builds rows of numbers from right to left
      for (let i = 0; i < board.length; i++) {
         const reverseRow: number[] = [];

         for (let j = board.length - 1; j >= 0; j--) {
            reverseRow.push(board[i][j]);
         }

         clues.push(this.computeVisibleTowers(reverseRow));
      }

      // starting from the bottom right, moving left
      // builds columns of numbers from bottom to top
      for (let i = board.length - 1; i >= 0; i--) {
         const reverseCol: number[] = [];

         for (let j = board.length - 1; j >= 0; j--) {
            reverseCol.push(board[j][i]);
         }

         clues.push(this.computeVisibleTowers(reverseCol));
      }

      // starting from the bottom left, moving up
      // just takes the rows on the board as-is
      for (let i = board.length - 1; i >= 0; i--) {
         clues.push(this.computeVisibleTowers(board[i]));
      }

      return clues;
   }

   // takes in a row or column and returns the number of visible towers
   public computeVisibleTowers(line: number[]): number {
      line = line.filter(element => typeof element === "number");

      let numVisibleTowers = 1;
      let currentTallestTowerValue = line[0];

      for (let i = 1; i < line.length; i++) {
         if (line[i] > currentTallestTowerValue) {
            currentTallestTowerValue = line[i];
            numVisibleTowers++;
         }
      }

      return numVisibleTowers;
   }
}
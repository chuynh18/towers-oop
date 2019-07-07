"use strict";
// exports.__esModule = true;
var Board = /** @class */ (function () {
    // upon instantiation of Board(), generate board of requested size
    function Board(size) {
        this.gameBoard = this.generateBoard(size);
        this.clues = this.generateClues(this.gameBoard);
    }
    // game board getter
    Board.prototype.getBoard = function () {
        return this.gameBoard;
    };
    // clues getter
    Board.prototype.getClues = function () {
        return this.clues;
    };
    // get # of attempts it took to generate a valid board
    Board.prototype.getAttempts = function () {
        return this.boardGenerationAttempts;
    };
    // generates current high precision timestamp
    Board.prototype.getTimestamp = function () {
        var timer = process.hrtime(); // nodeJS high-precision timer
        return timer[0] * 1E9 + timer[1];
    };
    // ugly hack wrapper to brute force generate board lololol
    Board.prototype.generateBoard = function (size) {
        // var startTime = this.getTimestamp();
        var counter = 0;
        var board;
        do {
            board = this.attemptToGenerateBoard(size);
            counter++;
        } while (typeof board === "boolean");
        // console.log("It took " + counter + " attempts in " + (this.getTimestamp() - startTime) / 1E6 + " ms.");
        this.boardGenerationAttempts = counter;
        return board;
    };
    // generates game board of specified size (game boards are square)
    Board.prototype.attemptToGenerateBoard = function (size) {
        // array that will contain the game board
        var board = [];
        // build game board
        for (var i = 0; i < size; i++) {
            board.push(new Array(size));
        }
        for (var i = 0; i < size; i++) {
            // array of valid indices to place number
            var validIndices = [];
            for (var j = 0; j < size; j++) {
                validIndices.push(j);
            }
            var _loop_1 = function (j) {
                // build array of empty indices in the current row
                var emptySpots = this_1.getEmptySpots(board[j]);
                // possible spots to place value
                var candidateIndices = validIndices.filter(function (num) { return emptySpots.indexOf(num) > -1; });
                if (candidateIndices.length === 0) {
                    return { value: false };
                }
                var indexToPlaceNumber = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
                // insert number into board
                board[j][indexToPlaceNumber] = i + 1;
                // remove just-used index from validIndices
                validIndices.splice(validIndices.indexOf(indexToPlaceNumber), 1);
            };
            var this_1 = this;
            for (var j = 0; j < size; j++) {
                var state_1 = _loop_1(j);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
        }
        return board;
    };
    // returns array of indices corresponding to null slots of array
    // used by board generation method attemptToGenerateBoard()
    Board.prototype.getEmptySpots = function (row) {
        var emptySpots = [];
        for (var i = 0; i < row.length; i++) {
            if (!row[i]) {
                emptySpots.push(i);
            }
        }
        return emptySpots;
    };
    // generates clues that player will use to play the game
    // length of clues array is four times the board size
    // starts from the top left of the board moving clockwise
    Board.prototype.generateClues = function (board) {
        var clues = [];
        // starting from top left, moving right
        // builds columns of numbers running top to bottom
        for (var i = 0; i < board.length; i++) {
            var column = [];
            for (var j = 0; j < board.length; j++) {
                column.push(board[j][i]);
            }
            clues.push(this.computeVisibleTowers(column));
        }
        // starting from the top right, moving down
        // builds rows of numbers from right to left
        for (var i = 0; i < board.length; i++) {
            var reverseRow = [];
            for (var j = board.length - 1; j >= 0; j--) {
                reverseRow.push(board[i][j]);
            }
            clues.push(this.computeVisibleTowers(reverseRow));
        }
        // starting from the bottom right, moving left
        // builds columns of numbers from bottom to top
        for (var i = board.length - 1; i >= 0; i--) {
            var reverseCol = [];
            for (var j = board.length - 1; j >= 0; j--) {
                reverseCol.push(board[j][i]);
            }
            clues.push(this.computeVisibleTowers(reverseCol));
        }
        // starting from the bottom left, moving up
        // just takes the rows on the board as-is
        for (var i = board.length - 1; i >= 0; i--) {
            clues.push(this.computeVisibleTowers(board[i]));
        }
        return clues;
    };
    // takes in a row or column and returns the number of visible towers
    Board.prototype.computeVisibleTowers = function (line) {
        var numVisibleTowers = 1;
        var currentTallestTower = line[0];
        for (var i = 1; i < line.length; i++) {
            if (line[i] > currentTallestTower) {
                currentTallestTower = line[i];
                numVisibleTowers++;
            }
        }
        return numVisibleTowers;
    };
    return Board;
}());
// exports.Board = Board;

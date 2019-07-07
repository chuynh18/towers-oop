"use strict";
exports.__esModule = true;
var Board_1 = require("./Board");
var utility_1 = require("./utility");
/**
 * The model that holds the entirety of the game state.
 */
var Game = /** @class */ (function () {
    /**
     * Initializes the game.
     *
     * @param  {CanvasRenderer} view - CanvasRenderer object.
     * @param  {number} gameBoardSize - Desired size of game board.
     */
    function Game(view, gameBoardSize) {
        /**
         * activeCell contains the current active cell.  [-1, -1] means no cell is
         * active.  Otherwise, the array contains the x and y cell coordinates of the
         * currently active cell.
         */
        this.activeCell = [-1, -1];
        this.cluesAndGuesses = [];
        this.drawTextConfigBoard = [];
        this.view = view;
        this.board = new Board_1.Board(gameBoardSize);
        this.buildArray(gameBoardSize + 2, this.cluesAndGuesses);
        this.buildArray(gameBoardSize + 2, this.drawTextConfigBoard);
        this.populateGuessArrayWithClues();
        this.showBoard(utility_1.calculateDesiredCanvasSize());
    }
    /**
     * If a cell is active, returns the current value of that active cell, which
     * is either a number or undefined if the cell is blank.  If no cell is
     * currently active, returns -1.
     *
     * @returns number
     */
    Game.prototype.getValueAtActiveCell = function () {
        if (this.activeCell[0] > -1 && this.activeCell[1] > -1) {
            return this.cluesAndGuesses[this.activeCell[1]][this.activeCell[0]];
        }
        else {
            return -1;
        }
    };
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
    Game.prototype.activateCell = function (clickedCellCoords) {
        // if user clicks the already active cell, deactivate it
        if (utility_1.arrayCompare(this.activeCell, clickedCellCoords)) {
            this.activeCell[0] = -1; // remember, [-1, -1] means no active cell!
            this.activeCell[1] = -1;
        }
        else if (
        // else set active cell to clicked cell coords... if coords are valid
        clickedCellCoords[0] > 0 && clickedCellCoords[0] < this.cluesAndGuesses.length - 1 &&
            clickedCellCoords[1] > 0 && clickedCellCoords[1] < this.cluesAndGuesses.length - 1) {
            this.activeCell[0] = clickedCellCoords[0];
            this.activeCell[1] = clickedCellCoords[1];
        }
        else if (clickedCellCoords[0] === -1 && clickedCellCoords[1] === -1) {
            // deactivate cell if clickedCellCoords is [-1, -1]
            this.activeCell[0] = -1;
            this.activeCell[1] = -1;
        }
    };
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
    Game.prototype.buildArray = function (size, target) {
        target.length = 0;
        for (var i = 0; i < size; i++) {
            target[i] = new Array(size);
        }
    };
    /**
     * Populates the guess array with the clues the player needs to play Towers.
     *
     * @returns void - because this.cluesAndGuesses is mutated.
     */
    Game.prototype.populateGuessArrayWithClues = function () {
        var clues = this.board.getClues();
        // Uh-oh, SpaghettiOs!
        for (var i = 0; i < clues.length / 4; i++) {
            this.cluesAndGuesses[0][i + 1] = clues[i]; // top
            this.cluesAndGuesses[i + 1][this.cluesAndGuesses.length - 1] = clues[clues.length / 4 + i]; // right
            this.cluesAndGuesses[this.cluesAndGuesses.length - 1][this.cluesAndGuesses.length - i - 2] = clues[clues.length / 2 + i]; // bottom
            this.cluesAndGuesses[this.cluesAndGuesses.length - i - 2][0] = clues[(3 * clues.length) / 4 + i]; // left
        }
    };
    /**
     * Checks a cell's row and column for duplicate values.
     *
     * @param  {number} x - x-coordinate of cell with [0, 0] being top left
     * @param  {number} y - y-coordinate of cell
     *
     * @returns boolean - true means duplicate detected, false otherwise
     */
    Game.prototype.checkDuplicateNumber = function (x, y) {
        var value = this.cluesAndGuesses[y][x];
        if (!value) {
            return false;
        }
        for (var i = 1; i < this.cluesAndGuesses.length - 1; i++) {
            if (i !== y && value === this.cluesAndGuesses[i][x]) {
                return true;
            }
            if (i !== x && value === this.cluesAndGuesses[y][i]) {
                return true;
            }
        }
        return false;
    };
    /**
     * Checks a specified top clue for validity.  Returns true if clue has been
     * violated.  Returns false if clue has not been violated.
     *
     * @param  {number} x - x-coordinate of top clue to check
     *
     * @returns boolean
     */
    Game.prototype.checkClueViolationTop = function (x) {
        if (x > 0 && x < this.cluesAndGuesses.length - 1) {
            var column = [];
            var columnFilled = true;
            for (var i = 1; i < this.cluesAndGuesses.length - 1; i++) {
                var value = this.cluesAndGuesses[i][x];
                if (typeof value === "undefined") {
                    columnFilled = false;
                }
                column.push(value);
            }
            var numVisibleTowers = this.board.computeVisibleTowers(column);
            if (columnFilled) {
                return {
                    violation: this.cluesAndGuesses[0][x] !== numVisibleTowers,
                    lineFilled: true
                };
            }
            else {
                return {
                    violation: this.cluesAndGuesses[0][x] < numVisibleTowers,
                    lineFilled: false
                };
            }
        }
        else {
            throw new RangeError("X value " + x + " is not valid.");
        }
    };
    /**
    * Checks a specified right clue for validity.  Returns true if clue has been
    * violated.  Returns false if clue has not been violated.
    *
    * @param  {number} y - y-coordinate of right clue to check
    *
    * @returns boolean
    */
    Game.prototype.checkClueViolationRight = function (y) {
        if (y > 0 && y < this.cluesAndGuesses.length - 1) {
            var row = [];
            var rowFilled = true;
            for (var i = this.cluesAndGuesses.length - 2; i > 0; i--) {
                var value = this.cluesAndGuesses[y][i];
                if (typeof value === "undefined") {
                    rowFilled = false;
                }
                row.push(value);
            }
            var numVisibleTowers = this.board.computeVisibleTowers(row);
            if (rowFilled) {
                return {
                    violation: this.cluesAndGuesses[y][this.cluesAndGuesses.length - 1] !== numVisibleTowers,
                    lineFilled: true
                };
            }
            else {
                return {
                    violation: this.cluesAndGuesses[y][this.cluesAndGuesses.length - 1] < numVisibleTowers,
                    lineFilled: false
                };
            }
        }
        else {
            throw new RangeError("Y value " + y + " is not valid.");
        }
    };
    /**
    * Checks a specified bottom clue for validity.  Returns true if clue has
    * been violated.  Returns false if clue has not been violated.
    *
    * @param  {number} x - x-coordinate of bottom clue to check
    *
    * @returns boolean
    */
    Game.prototype.checkClueViolationBottom = function (x) {
        if (x > 0 && x < this.cluesAndGuesses.length - 1) {
            var column = [];
            var columnFilled = true;
            for (var i = this.cluesAndGuesses.length - 2; i > 0; i--) {
                var value = this.cluesAndGuesses[i][x];
                if (typeof value === "undefined") {
                    columnFilled = false;
                }
                column.push(value);
            }
            var numVisibleTowers = this.board.computeVisibleTowers(column);
            if (columnFilled) {
                return {
                    violation: this.cluesAndGuesses[this.cluesAndGuesses.length - 1][x] !== numVisibleTowers,
                    lineFilled: true
                };
            }
            else {
                return {
                    violation: this.cluesAndGuesses[this.cluesAndGuesses.length - 1][x] < numVisibleTowers,
                    lineFilled: false
                };
            }
        }
        else {
            throw new RangeError("X value " + x + " is not valid.");
        }
    };
    /**
     * Checks a specified left clue for validity.  Returns true if clue has been
     * violated.  Returns false if clue has not been violated.
     *
     * @param  {number} y - y-coordinate of left clue to check
     *
     * @returns boolean
     */
    Game.prototype.checkClueViolationLeft = function (y) {
        if (y > 0 && y < this.cluesAndGuesses.length - 1) {
            var row = this.cluesAndGuesses[y].slice(1, this.cluesAndGuesses.length - 1);
            var rowFilled = true;
            for (var i = 0; i < row.length; i++) {
                if (typeof row[i] === "undefined") {
                    rowFilled = false;
                }
            }
            var numVisibleTowers = this.board.computeVisibleTowers(row);
            if (rowFilled) {
                return {
                    violation: this.cluesAndGuesses[y][0] !== numVisibleTowers,
                    lineFilled: true
                };
            }
            else {
                return {
                    violation: this.cluesAndGuesses[y][0] < numVisibleTowers,
                    lineFilled: false
                };
            }
        }
        else {
            throw new RangeError("Y value " + y + " is not valid.");
        }
    };
    /**
     * Scans this.cluesAndGuesses and inserts or updates the appropriate
     * DrawTextConfig objects into the corresponding slots of this.drawTextConfigBoard
     *
     * @returns void
     */
    Game.prototype.updateDrawTextArray = function () {
        for (var i = 0; i < this.cluesAndGuesses.length; i++) {
            for (var j = 0; j < this.cluesAndGuesses[i].length; j++) {
                var cell = this.cluesAndGuesses[i][j];
                var drawTextCell = this.drawTextConfigBoard[i][j];
                // if there's a number, create or update corresponding
                // DrawTextConfig object as appropriate
                if (typeof cell !== "undefined") {
                    if (typeof drawTextCell === "undefined") {
                        this.drawTextConfigBoard[i][j] = { text: String(cell) };
                    }
                    else {
                        drawTextCell.text = String(cell);
                    }
                }
                else {
                    if (typeof drawTextCell === "undefined") {
                        this.drawTextConfigBoard[i][j] = { text: "" };
                    }
                    else {
                        drawTextCell.text = "";
                    }
                }
            }
        }
    };
    /**
     * Validates the board.  Highlights invalid cells in red.
     *
     * @returns void
     */
    Game.prototype.validateBoard = function () {
        var valid = true;
        // scan the playable area of the board for duplicate numbers
        for (var i = 1; i < this.cluesAndGuesses.length - 1; i++) {
            for (var j = 1; j < this.cluesAndGuesses[i].length - 1; j++) {
                var drawTextCell = this.drawTextConfigBoard[i][j];
                if (this.checkDuplicateNumber(j, i)) {
                    drawTextCell.color = "red";
                    valid = false;
                }
                else {
                    drawTextCell.color = "black";
                }
            }
        }
        // scan the board for clue violations
        for (var i = 1; i < this.cluesAndGuesses.length - 1; i++) {
            var top_1 = this.checkClueViolationTop(i);
            var right = this.checkClueViolationRight(i);
            var bottom = this.checkClueViolationBottom(i);
            var left = this.checkClueViolationLeft(i);
            if (top_1.violation && top_1.lineFilled) {
                valid = false;
                this.drawTextConfigBoard[0][i].color = "red";
            }
            else if (top_1.violation && !top_1.lineFilled) {
                this.drawTextConfigBoard[0][i].color = "orange";
            }
            else {
                this.drawTextConfigBoard[0][i].color = "black";
            }
            if (right.violation && right.lineFilled) {
                valid = false;
                this.drawTextConfigBoard[i][this.drawTextConfigBoard.length - 1].color = "red";
            }
            else if (right.violation && !right.lineFilled) {
                this.drawTextConfigBoard[i][this.drawTextConfigBoard.length - 1].color = "orange";
            }
            else {
                this.drawTextConfigBoard[i][this.drawTextConfigBoard.length - 1].color = "black";
            }
            if (bottom.violation && bottom.lineFilled) {
                valid = false;
                this.drawTextConfigBoard[this.drawTextConfigBoard.length - 1][i].color = "red";
            }
            else if (bottom.violation && !bottom.lineFilled) {
                this.drawTextConfigBoard[this.drawTextConfigBoard.length - 1][i].color = "orange";
            }
            else {
                this.drawTextConfigBoard[this.drawTextConfigBoard.length - 1][i].color = "black";
            }
            if (left.violation && left.lineFilled) {
                valid = false;
                this.drawTextConfigBoard[i][0].color = "red";
            }
            else if (left.violation && !left.lineFilled) {
                this.drawTextConfigBoard[i][0].color = "orange";
            }
            else {
                this.drawTextConfigBoard[i][0].color = "black";
            }
        }
        return valid;
    };
    /**
     * Returns true if the user has completely filled out the board.
     *
     * @returns boolean
     */
    Game.prototype.userHasFilledOutBoard = function () {
        for (var i = 1; i < this.cluesAndGuesses.length - 1; i++) {
            for (var j = 1; j < this.cluesAndGuesses[i].length - 1; j++) {
                if (typeof this.cluesAndGuesses[i][j] === "undefined") {
                    return false;
                }
            }
        }
        return true;
    };
    /**
     * deletes guess at the currently active cell
     *
     * @returns void
     */
    Game.prototype.deleteGuess = function () {
        if (this.activeCell[0] > 0 && this.activeCell[0] < this.cluesAndGuesses.length - 1 &&
            this.activeCell[1] > 0 && this.activeCell[1] < this.cluesAndGuesses.length - 1) {
            delete this.cluesAndGuesses[this.activeCell[1]][this.activeCell[0]];
        }
    };
    /**
     * Updates the cluesAndGuesses 2d array with the user's guess.  Returns true
     * if valid and successful, false otherwise.
     *
     * @param  {number|string} guess - the value of the user's guess
     *
     * @returns boolean - true if insertion was performed, false if insertion
     * request was invalid and therefore not performed.
     */
    Game.prototype.insertGuess = function (guess) {
        guess = Number(guess);
        if (guess <= 0 || guess > this.cluesAndGuesses.length - 2) {
            console.log("Guess value " + guess + " is not valid.");
            return false;
        }
        else if (this.activeCell[0] > 0 && this.activeCell[0] < this.cluesAndGuesses.length - 1 &&
            this.activeCell[1] > 0 && this.activeCell[1] < this.cluesAndGuesses.length - 1) {
            this.cluesAndGuesses[this.activeCell[1]][this.activeCell[0]] = Number(guess);
            return true;
        }
        else {
            console.log("Invalid coordinates:  " + this.activeCell);
            return false;
        }
    };
    /**
     * Draws victory "ceremony"
     *
     * @returns void
     */
    Game.prototype.victory = function () {
        console.log("placeholder victory yay");
    };
    /**
     * @param  {number} pixelSize
     * @returns void
     */
    Game.prototype.showBoard = function (pixelSize) {
        this.updateDrawTextArray();
        var valid = this.validateBoard();
        var filledBoard = this.userHasFilledOutBoard();
        console.log("valid: " + valid + ", filled board: " + filledBoard);
        if (valid && filledBoard) {
            this.victory();
        }
        var renderConfig = {
            padding: 1,
            canvasSize: pixelSize,
            board: this.drawTextConfigBoard
        };
        if (this.activeCell[0] > -1 && this.activeCell[1] > -1) {
            var highlightConfig = {
                x: this.activeCell[0],
                y: this.activeCell[1],
                color: "LightGray"
            };
            renderConfig.highlight = highlightConfig;
        }
        this.view.render(renderConfig);
    };
    return Game;
}());
exports.Game = Game;

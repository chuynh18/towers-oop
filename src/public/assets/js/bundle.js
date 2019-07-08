(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
exports.__esModule = true;
/**
 * The game board generator - browser version
 */
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
    // ugly hack wrapper to brute force generate board lololol
    Board.prototype.generateBoard = function (size) {
        var counter = 0;
        var board;
        do {
            board = this.attemptToGenerateBoard(size);
            counter++;
        } while (typeof board === "boolean");
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
        line = line.filter(function (element) { return typeof element === "number"; });
        var numVisibleTowers = 1;
        var currentTallestTowerValue = line[0];
        for (var i = 1; i < line.length; i++) {
            if (line[i] > currentTallestTowerValue) {
                currentTallestTowerValue = line[i];
                numVisibleTowers++;
            }
        }
        return numVisibleTowers;
    };
    return Board;
}());
exports.Board = Board;

},{}],2:[function(require,module,exports){
// this is the view
"use strict";
exports.__esModule = true;
// utility functions
var utility_1 = require("./utility");
/**
 * The view for the game.  Responsible for rendering the game board.
 */
var CanvasRenderer = /** @class */ (function () {
    /**
     * Initializes the CanvasRenderer with the intended size of the game board to
     * be drawn, and the id of the canvas element.  (An empty canvas element is
     * expected to be provided in the HTML.)
     *
     * @param  {HTMLCanvasElement} canvas - the DOM id of the canvas element.
     * @param  {number} numCellsX - The number of cells in a row of the game
     * board.  If numCellsY is omitted, then this will also be the number of
     * cells in a column; e.g. you will get a gameboard of size numCellsX by
     * numCellsX.
     * @param  {number} numCellsY? (optional) - The number of cells in a column
     * of the game board.
     */
    function CanvasRenderer(canvas, numCellsX, numCellsY) {
        if (typeof numCellsY === "undefined") {
            this.numCellsX = this.numCellsY = numCellsX;
        }
        else {
            this.numCellsX = numCellsX;
            this.numCellsY = numCellsY;
        }
        this.canvas = canvas;
        this.draw = canvas.getContext("2d"); // note the not null hint "!"
    }
    /**
     * Resizes the canvas element to the desired size.  Updates class variables
     * cellWidth and cellHeight.
     *
     * @param  {number} length - If height is undefined, the desired height and
     * width of the game board in pixels.  If height is defined, the desired
     * width of the game board in pixels.
     * @param  {number} height? (optional) - The desired height of the game board.
     * If undefined, then length becomes the height and width of the game board.
     *
     * @returns void
     */
    CanvasRenderer.prototype.resize = function (length, height) {
        // the case where we only provide one argument (length)
        if (typeof height === "undefined") {
            this.canvas.width = this.canvas.height = length;
            this.cellWidth = length / this.numCellsX;
            this.cellHeight = length / this.numCellsY;
        }
        else {
            this.canvas.width = length;
            this.canvas.height = height;
            this.cellWidth = length / this.numCellsX;
            this.cellHeight = height / this.numCellsY;
        }
    };
    /**
     * Helper method.
     * Draws the lines that form the game board.  The size of the game board is
     * provided by the resize() method.
     *
     * @param  {number} padding? (optional) - the "thickness" of cells around the
     * edge of the game board to omit drawing; e.g. a padding of 1 means to omit
     * drawing lines for the outer edge of cells.  An undefined padding is
     * equivalent to a padding of 0.
     *
     * @returns void
     */
    CanvasRenderer.prototype.drawGrid = function (padding, delay) {
        var _this = this;
        // default padding to zero if drawGrid() is invoked with no argument
        if (typeof padding === "undefined") {
            padding = 0;
        }
        if (typeof delay === "undefined") {
            delay = 0;
        }
        var _loop_1 = function (i) {
            setTimeout(function () {
                if (typeof padding === "undefined") {
                    console.log("padding is undefined");
                    padding = 0;
                }
                var stepSize = _this.cellHeight * i;
                _this.draw.beginPath();
                _this.draw.lineWidth = 2;
                _this.draw.moveTo(padding * _this.cellWidth, stepSize);
                _this.draw.lineTo(_this.canvas.width - (padding * _this.cellWidth), stepSize);
                _this.draw.stroke();
            }, delay * i);
        };
        // draw horizontal lines
        for (var i = padding; i <= this.numCellsY - padding; i++) {
            _loop_1(i);
        }
        var _loop_2 = function (i) {
            setTimeout(function () {
                if (typeof padding === "undefined") {
                    console.log("padding is undefined");
                    padding = 0;
                }
                var stepSize = _this.cellWidth * i;
                _this.draw.beginPath();
                _this.draw.moveTo(stepSize, padding * _this.cellHeight);
                _this.draw.lineTo(stepSize, _this.canvas.height - (padding * _this.cellHeight));
                _this.draw.stroke();
            }, delay * i);
        };
        // draw vertical lines
        for (var i = padding; i <= this.numCellsX - padding; i++) {
            _loop_2(i);
        }
    };
    /**
     * Helper method.
     * Completely clears the canvas element.  Used as part of the render() method
     * to ensure that render() is essentially idempotent.
     *
     * @returns void
     */
    CanvasRenderer.prototype.clearCanvas = function () {
        this.draw.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    /**
     * Method that returns a BoardInfo object.  Used by other parts of the
     * program to get current characteristics of the game board and canvas.
     * BoardInfo objects contain the following properties:
     *
     * numCellsX, numCellsY, cellWidth, cellHeight, canvasWidth, canvasHeight
     *
     * See the BoardInfo interface for more details.
     *
     * @returns BoardInfo
     */
    CanvasRenderer.prototype.getBoardInfo = function () {
        return {
            numCellsX: this.numCellsX,
            numCellsY: this.numCellsY,
            cellWidth: this.cellWidth,
            cellHeight: this.cellHeight,
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height
        };
    };
    /**
     * Returns the cell coordinates of the clicked cell.
     *
     * @param  {MouseEvent} event
     *
     * @returns [number, number] - x, y coordinates of the clicked cell
     */
    CanvasRenderer.prototype.calculateClickCoordinates = function (event) {
        var rect = this.canvas.getBoundingClientRect();
        var boardInfo = this.getBoardInfo();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        return utility_1.convertPixelsToCellCoords(x, y, boardInfo.cellWidth, boardInfo.cellHeight);
    };
    /**
     * Draws a colored box inside the cell at the desired (x, y) coordinates.
     * The top-left cell is cell (0, 0).
     *
     * @param  {HighlightConfig} highlight - HighlightConfig object.  Contains:
     * x: x-coordinate of cell to be highlighted.
     * y: y-coordinate of cell to be highlighted.
     * color:  color of the highlight e.g. "red", "green", "#baddad".
     *
     * @returns void
     */
    CanvasRenderer.prototype.highlightCell = function (highlight) {
        var pixelCoords = utility_1.convertCellCoordsToPixels(highlight.x, highlight.y, this.cellWidth, this.cellHeight);
        this.draw.beginPath();
        this.draw.fillStyle = highlight.color;
        this.draw.rect(pixelCoords[0] + 1, pixelCoords[1] + 1, this.cellWidth - 2, this.cellHeight - 2);
        this.draw.fill();
    };
    /**
     * Draws text inside the specified cell on the board.  Automatically centers
     * text into the middle of the cell, but only for one character, and only if
     * the font size is not manually specified.
     *
     * @param  {DrawTextConfig} drawTextConfig - Configuration object.  Please
     * see the definition inside the interfaces.ts file.
     * @param  {number} x - cell x-coordinate in which to draw the number
     * @param  {number} y - cell y-coordinate in which to draw the number
     *
     * @returns void
     */
    CanvasRenderer.prototype.drawText = function (drawTextConfig, x, y) {
        if (x > this.numCellsX - 1 ||
            y > this.numCellsY - 1) {
            console.log("Warning:  You are attempting to place text out of bounds.");
            console.log("Your input: (" + x + ", " + y + ").");
            console.log("Maximum value: (" + (this.numCellsX - 1) + ", " + (this.numCellsY - 1) + ").");
            return;
        }
        // the lesser of cellWidth or cellHeight
        var minCellDimension = this.cellHeight > this.cellWidth ?
            this.cellWidth : this.cellHeight;
        // Use provided drawTextConfig.fontSize or calculate it if necessary
        var fontSize = drawTextConfig.fontSize ?
            drawTextConfig.fontSize : minCellDimension / 2;
        // calculate pixel coordinates
        // The denominators are fudge factors and were found empirically!
        // They work for the automatically computed font size and Arial,
        // but only for square boards.  Rectangular boards may be offset!
        var pixelCoords = utility_1.convertCellCoordsToPixels(x, y, this.cellWidth, this.cellHeight);
        var xPixelCoords = pixelCoords[0] + (this.cellWidth / 2.7); // 2.7 = fudge factor
        var yPixelCoords = pixelCoords[1] + (this.cellHeight / 1.5); // 1.5 = fudge factor
        if (drawTextConfig.xPixelOffset) {
            xPixelCoords += drawTextConfig.xPixelOffset;
            if (drawTextConfig.xPixelOffset > (this.cellWidth) / 2) {
                console.log("Warning:  Your x-pixel offset may cause text to appear in a neighboring cell.");
            }
        }
        if (drawTextConfig.yPixelOffset) {
            yPixelCoords += drawTextConfig.yPixelOffset;
            if (drawTextConfig.yPixelOffset > (this.cellHeight) / 2) {
                console.log("Warning:  Your y-pixel offset may cause text to appear in a neighboring cell.");
            }
        }
        // Use provided drawTextConfig.font or default to Arial
        var font = drawTextConfig.font ? drawTextConfig.font : "Arial";
        // Not sure how this behaves if font isn't a real font!
        this.draw.font = fontSize + "px " + font;
        // Use provided drawTextConfig.color or default to "black"
        this.draw.fillStyle = drawTextConfig.color ? drawTextConfig.color : "black";
        // check width of text and warn accordingly - this is a very naïve check!
        if (this.draw.measureText(drawTextConfig.text).width > this.cellWidth) {
            console.log("Warning:  The width of the text you are drawing exceeds the cell width.");
        }
        // and check the height, too - this is probably more reliable
        if (fontSize > this.cellHeight) {
            console.log("Warning:  The font size you have chosen is taller than the cell height.");
        }
        // Finally!  Place the text onto the canvas.
        this.draw.fillText(drawTextConfig.text, xPixelCoords, yPixelCoords);
    };
    /**
     * Public method that renders (or re-renders) the grid.  Effectively
     * idempotent.  Accepts a RenderConfig object as a parameter.
     *
     * @param  {RenderConfig} renderConfig - configuration object specifying what
     * the game board should look like.  See the interface definition inside
     * interfaces.ts.
     *
     * @returns void
     */
    CanvasRenderer.prototype.render = function (renderConfig, delay) {
        var _this = this;
        this.clearCanvas();
        if (typeof delay === "undefined") {
            delay = 0;
        }
        // resize the grid if necessary
        if (Array.isArray(renderConfig.canvasSize)) {
            if (renderConfig.canvasSize[0] !== this.canvas.width ||
                renderConfig.canvasSize[1] !== this.canvas.height) {
                this.resize(renderConfig.canvasSize[0], renderConfig.canvasSize[1]);
            }
        }
        else if (typeof renderConfig.canvasSize === "number") {
            if (renderConfig.canvasSize !== this.canvas.width ||
                renderConfig.canvasSize !== this.canvas.height) {
                this.resize(renderConfig.canvasSize);
            }
        }
        this.drawGrid(renderConfig.padding, delay);
        // render highlighted cell(s) if config object contains highlight key
        if (Array.isArray(renderConfig.highlight)) {
            renderConfig.highlight.forEach(function (renderConfigObj) {
                _this.highlightCell(renderConfigObj);
            });
        }
        else if (typeof renderConfig.highlight === "object") {
            this.highlightCell(renderConfig.highlight);
        }
        // render the entire board if all conditions are met
        if (renderConfig.board) {
            if (renderConfig.board.length !== this.numCellsY) {
                console.log("Warning:  board size mismatch in Y dimension.");
                console.log("Expected " + this.numCellsY + " height, but got " + renderConfig.board.length + " instead.");
                return;
            }
            for (var i = 0; i < renderConfig.board.length; i++) {
                if (renderConfig.board[i].length !== this.numCellsX) {
                    console.log("Warning:  board size mismatch in X dimension.");
                    console.log("Expected " + this.numCellsX + " height, but got " + renderConfig.board[i].length + " instead.");
                    return;
                }
            }
            for (var i = 0; i < renderConfig.board.length; i++) {
                for (var j = 0; j < renderConfig.board[i].length; j++) {
                    var cell = renderConfig.board[i][j];
                    if (typeof cell !== "undefined") {
                        this.drawText(cell, j, i);
                    }
                }
            }
        }
    };
    return CanvasRenderer;
}());
exports.CanvasRenderer = CanvasRenderer;

},{"./utility":7}],3:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var utility_1 = require("./utility");
/**
 * The controller.  Holds all the code that determines user interactions.
 */
var Controller = /** @class */ (function () {
    /**
     * Creates an instance of the controller and attaches all needed event
     * handlers.
     *
     * @param  {Game} model - a Game object
     * @param  {CanvasRenderer} view - a CanvasRenderer object
     */
    function Controller(model, view, canvas, keypadView, keypad, keypadCanvas) {
        this.eventListenersAdded = false;
        this.model = model;
        this.view = view;
        this.canvas = canvas;
        this.keypadView = keypadView;
        this.keypad = keypad;
        this.keypadCanvas = keypadCanvas;
        this.numKeypadCells = this.keypadView.getBoardInfo().numCellsX;
        this.attachEventHandlers();
    }
    Controller.prototype.attachEventHandlers = function () {
        var _this = this;
        if (!this.eventListenersAdded) {
            // event handler for activating/deactivating clicked cells
            this.canvas.addEventListener("click", function (event) {
                var clickCoords = _this.view.calculateClickCoordinates(event);
                _this.model.activateCell(clickCoords);
                _this.model.showBoard();
                var valueAtActiveCell = _this.model.getValueAtActiveCell();
                var activeIndex;
                if (typeof valueAtActiveCell === "undefined") {
                    activeIndex = 0;
                }
                else if (valueAtActiveCell > 0) {
                    activeIndex = valueAtActiveCell;
                }
                _this.keypad.showKeypad(activeIndex);
            });
            // event handler for clicks on the virtual keypad
            this.keypadCanvas.addEventListener("click", function (event) {
                var clickCoords = _this.keypadView.calculateClickCoordinates(event);
                var keypadValue = clickCoords[0];
                var valueAtActiveCell = _this.model.getValueAtActiveCell();
                if (valueAtActiveCell !== -1) {
                    if (keypadValue === 0) {
                        _this.model.deleteGuess();
                        _this.model.showBoard();
                    }
                    else {
                        if (_this.model.insertGuess(keypadValue)) {
                            _this.model.showBoard();
                        }
                    }
                    var valueAtActiveCell_1 = _this.model.getValueAtActiveCell();
                    var activeIndex = void 0;
                    if (typeof valueAtActiveCell_1 === "undefined") {
                        activeIndex = 0;
                    }
                    else if (valueAtActiveCell_1 > 0) {
                        activeIndex = valueAtActiveCell_1;
                    }
                    _this.keypad.showKeypad(activeIndex);
                }
            });
            // event handler that allows user to input and modify their guesses
            window.onkeyup = function (event) {
                if ((event.keyCode >= 48 && event.keyCode <= 57) ||
                    (event.keyCode >= 96 && event.keyCode <= 105)) {
                    var key = Number(event.key);
                    // perform insertion.  if success, deactivate cell and update UI
                    if (_this.model.insertGuess(key)) {
                        _this.model.activateCell([-1, -1]);
                        _this.model.showBoard();
                        _this.keypad.showKeypad();
                    }
                }
                else if (event.keyCode === 8 || event.keyCode === 46) {
                    // deletion of guess
                    _this.model.deleteGuess();
                    _this.model.activateCell([-1, -1]);
                    _this.model.showBoard();
                    _this.keypad.showKeypad();
                }
            };
            // event handler that resizes the game board based on window size
            window.onresize = function () {
                var canvasSize = utility_1.calculateDesiredCanvasSize();
                var keypadSize = [0, 0];
                var valueAtActiveCell = _this.model.getValueAtActiveCell();
                var activeIndex;
                if (typeof valueAtActiveCell === "undefined") {
                    activeIndex = 0;
                }
                else if (valueAtActiveCell > 0) {
                    activeIndex = valueAtActiveCell;
                }
                keypadSize[0] = 0.95 * canvasSize;
                keypadSize[1] = 0.95 * canvasSize / _this.numKeypadCells;
                _this.model.showBoard(canvasSize);
                _this.keypad.showKeypad(activeIndex, keypadSize);
            };
            this.eventListenersAdded = true;
        }
    };
    return Controller;
}());
exports.Controller = Controller;

},{"./utility":7}],4:[function(require,module,exports){
// execution starts here
"use strict";
exports.__esModule = true;
// Constants
var GAME_CANVAS = document.getElementById("tower");
var KEYPAD_CANVAS = document.getElementById("keypad");
var model_1 = require("./model");
var canvas_renderer_1 = require("./canvas-renderer");
var controller_1 = require("./controller");
var keypad_1 = require("./keypad");
var towersGameSize = 5;
var view = new canvas_renderer_1.CanvasRenderer(GAME_CANVAS, towersGameSize + 2);
var model = new model_1.Game(view, towersGameSize);
var keypadView = new canvas_renderer_1.CanvasRenderer(KEYPAD_CANVAS, towersGameSize + 1, 1);
var keypad = new keypad_1.Keypad(keypadView);
var controller = new controller_1.Controller(model, view, GAME_CANVAS, keypadView, keypad, KEYPAD_CANVAS);

},{"./canvas-renderer":2,"./controller":3,"./keypad":5,"./model":6}],5:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var utility_1 = require("./utility");
var Keypad = /** @class */ (function () {
    function Keypad(keypadCanvas) {
        this.values = [];
        this.canvasRenderer = keypadCanvas; // bind to keypad's canvas renderer
        // populate values array
        var numCells = this.canvasRenderer.getBoardInfo().numCellsX;
        for (var i = 0; i < numCells - 1; i++) {
            this.values[i + 1] = i + 1;
        }
        var desiredCanvasSize = 0.95 * utility_1.calculateDesiredCanvasSize();
        this.showKeypad(undefined, [desiredCanvasSize, desiredCanvasSize / numCells]);
    }
    Keypad.prototype.buildDrawTextConfig = function (activeIndex) {
        var output = [];
        for (var i = 0; i < this.values.length; i++) {
            var text = void 0;
            if (typeof this.values[i] === "undefined") {
                text = "";
            }
            else {
                text = String(this.values[i]);
            }
            output.push({
                text: text,
                color: "gray"
            });
        }
        if (typeof activeIndex === "number") {
            output[activeIndex].color = "Navy";
        }
        return output;
    };
    Keypad.prototype.showKeypad = function (activeIndex, canvasSize) {
        var renderConfig = {
            padding: 0,
            board: [this.buildDrawTextConfig(activeIndex)]
        };
        if (typeof canvasSize === "number" || Array.isArray(canvasSize)) {
            renderConfig.canvasSize = canvasSize;
        }
        if (typeof activeIndex === "number") {
            renderConfig.highlight = {
                x: activeIndex,
                y: 0,
                color: "LightGray"
            };
        }
        this.canvasRenderer.render(renderConfig);
    };
    return Keypad;
}());
exports.Keypad = Keypad;

},{"./utility":7}],6:[function(require,module,exports){
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
        var _this = this;
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
        this.populateGuessArrayWithClues(150, function () { _this.showBoard(utility_1.calculateDesiredCanvasSize(), 150); });
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
    Game.prototype.populateGuessArrayWithClues = function (stepDelay, cb) {
        var _this = this;
        var clues = this.board.getClues();
        if (typeof stepDelay === "undefined") {
            stepDelay = 0;
        }
        var _loop_1 = function (i) {
            setTimeout(function () {
                _this.cluesAndGuesses[0][i + 1] = clues[i]; // top
                if (cb) {
                    cb();
                }
            }, stepDelay * i + stepDelay / 4);
            setTimeout(function () {
                _this.cluesAndGuesses[i + 1][_this.cluesAndGuesses.length - 1] = clues[clues.length / 4 + i]; // right
                if (cb) {
                    cb();
                }
            }, stepDelay * i + stepDelay / 2);
            setTimeout(function () {
                _this.cluesAndGuesses[_this.cluesAndGuesses.length - 1][_this.cluesAndGuesses.length - i - 2] = clues[clues.length / 2 + i]; // bottom
                if (cb) {
                    cb();
                }
            }, stepDelay * i + (3 * stepDelay / 4));
            setTimeout(function () {
                _this.cluesAndGuesses[_this.cluesAndGuesses.length - i - 2][0] = clues[(3 * clues.length) / 4 + i]; // left
                if (cb) {
                    cb();
                }
            }, stepDelay * i + stepDelay);
        };
        // Uh-oh, SpaghettiOs!
        for (var i = 0; i < clues.length / 4; i++) {
            _loop_1(i);
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
                    drawTextCell.color = "blue";
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
    Game.prototype.showBoard = function (pixelSize, delay) {
        this.updateDrawTextArray();
        var valid = this.validateBoard();
        var filledBoard = this.userHasFilledOutBoard();
        console.log("valid: " + valid + ", filled board: " + filledBoard);
        if (typeof delay === "undefined") {
            delay = 0;
        }
        var renderConfig = {
            padding: 1,
            board: this.drawTextConfigBoard
        };
        if (typeof pixelSize === "number") {
            renderConfig.canvasSize = pixelSize;
        }
        if (this.activeCell[0] > -1 && this.activeCell[1] > -1) {
            var highlightConfig = {
                x: this.activeCell[0],
                y: this.activeCell[1],
                color: "LightGray"
            };
            renderConfig.highlight = highlightConfig;
        }
        this.view.render(renderConfig, delay);
        if (valid && filledBoard) {
            this.victory();
        }
    };
    return Game;
}());
exports.Game = Game;

},{"./Board":1,"./utility":7}],7:[function(require,module,exports){
/**
 * this file contains various utility methods that may be used across the
 * application
*/
"use strict";
exports.__esModule = true;
/**
 * Helper function that converts cell coordinate pair into pixel coordinates.
 *
 * @param  {number} x - x-coordinate of cell
 * @param  {number} y - y-coordinate of cell
 * @param  {number} cellWidth - the width of a cell in pixels
 * @param  {number} cellHeight - the height of a cell in pixels
 *
 * @returns [number, number] corresponding to [x pixel, y pixel] coordinates.
 */
function convertCellCoordsToPixels(x, y, cellWidth, cellHeight) {
    return [
        cellWidth * x,
        cellHeight * y
    ];
}
exports.convertCellCoordsToPixels = convertCellCoordsToPixels;
/**
 * Helper function that converts pixel coordinates into cell coordinate pair.
 *
 * @param  {number} x - x-coordinate in pixels
 * @param  {number} y - y-coordinate in pixels
 * @param  {number} cellWidth - the width of a cell in pixels
 * @param  {number} cellHeight - the height of a cell in pixels
 *
 * @returns [number, number] corresponding to [x pixel, y pixel] coordinates.
 */
function convertPixelsToCellCoords(x, y, cellWidth, cellHeight) {
    return [
        Math.floor(x / cellWidth),
        Math.floor(y / cellHeight)
    ];
}
exports.convertPixelsToCellCoords = convertPixelsToCellCoords;
/**
 * Compares deep arrays of primitives (cannot contain objects!)
 *
 * @param  {any} a - Array of primitives or other arrays
 * @param  {any} b - Array of primitives or other arrays
 *
 * @returns boolean - true if a === b, false otherwise
 */
function arrayCompare(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    else {
        for (var i = 0; i < a.length; i++) {
            if (Array.isArray(a[i]) && Array.isArray(b[i])) {
                var recursiveResult = arrayCompare(a[i], b[i]);
                if (!recursiveResult) {
                    return recursiveResult;
                }
            }
            else if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }
}
exports.arrayCompare = arrayCompare;
function calculateDesiredCanvasSize() {
    var body = document.getElementsByTagName("body")[0];
    var width = body.clientWidth;
    var height = 0.80 * window.innerHeight - 20;
    return width > height ? height : width;
}
exports.calculateDesiredCanvasSize = calculateDesiredCanvasSize;

},{}]},{},[4]);

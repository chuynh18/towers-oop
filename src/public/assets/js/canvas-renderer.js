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
    CanvasRenderer.prototype.drawGrid = function (padding) {
        // default padding to zero if drawGrid() is invoked with no argument
        if (typeof padding === "undefined") {
            padding = 0;
        }
        // draw horizontal lines
        for (var i = padding; i <= this.numCellsY - padding; i++) {
            var stepSize = this.cellHeight * i;
            this.draw.beginPath();
            this.draw.lineWidth = 2;
            this.draw.moveTo(padding * this.cellWidth, stepSize);
            this.draw.lineTo(this.canvas.width - (padding * this.cellWidth), stepSize);
            this.draw.stroke();
        }
        // draw vertical lines
        for (var i = padding; i <= this.numCellsX - padding; i++) {
            var stepSize = this.cellWidth * i;
            this.draw.beginPath();
            this.draw.moveTo(stepSize, padding * this.cellHeight);
            this.draw.lineTo(stepSize, this.canvas.height - (padding * this.cellHeight));
            this.draw.stroke();
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
        this.draw.rect(pixelCoords[0], pixelCoords[1], this.cellWidth, this.cellHeight);
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
    CanvasRenderer.prototype.render = function (renderConfig) {
        var _this = this;
        this.clearCanvas();
        // resize the grid if necessary
        if (Array.isArray(renderConfig.canvasSize)) {
            if (renderConfig.canvasSize[0] !== this.canvas.width ||
                renderConfig.canvasSize[1] !== this.canvas.height) {
                this.resize(renderConfig.canvasSize[0], renderConfig.canvasSize[1]);
            }
        }
        else {
            if (renderConfig.canvasSize !== this.canvas.width ||
                renderConfig.canvasSize !== this.canvas.height) {
                this.resize(renderConfig.canvasSize);
            }
        }
        this.drawGrid(renderConfig.padding);
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

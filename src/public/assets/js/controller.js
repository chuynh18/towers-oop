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
        this.canvasSize = utility_1.calculateDesiredCanvasSize();
        this.keypadCanvas = keypadCanvas;
        this.numKeypadCells = this.keypadView.getBoardInfo().numCellsX;
        this.keypadSize = [0.95 * this.canvasSize, 0.95 * this.canvasSize / this.numKeypadCells];
        this.attachEventHandlers();
        this.keypad.showKeypad(this.keypadSize);
    }
    Controller.prototype.attachEventHandlers = function () {
        var _this = this;
        if (!this.eventListenersAdded) {
            // event handler for activating/deactivating clicked cells
            this.canvas.addEventListener("click", function (event) {
                var clickCoords = _this.view.calculateClickCoordinates(event);
                _this.model.activateCell(clickCoords);
                _this.model.showBoard(_this.canvasSize);
                var valueAtActiveCell = _this.model.getValueAtActiveCell();
                var activeIndex;
                if (typeof valueAtActiveCell === "undefined") {
                    activeIndex = 0;
                }
                else if (valueAtActiveCell > 0) {
                    activeIndex = valueAtActiveCell;
                }
                _this.keypad.showKeypad(_this.keypadSize, activeIndex);
            });
            // event handler for clicks on the virtual keypad
            this.keypadCanvas.addEventListener("click", function (event) {
                var clickCoords = _this.keypadView.calculateClickCoordinates(event);
                var keypadValue = clickCoords[0];
                var valueAtActiveCell = _this.model.getValueAtActiveCell();
                if (valueAtActiveCell !== -1) {
                    if (keypadValue === 0) {
                        _this.model.deleteGuess();
                        _this.model.showBoard(_this.canvasSize);
                    }
                    else {
                        if (_this.model.insertGuess(keypadValue)) {
                            _this.model.showBoard(_this.canvasSize);
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
                    _this.keypad.showKeypad(_this.keypadSize, activeIndex);
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
                        _this.model.showBoard(_this.canvasSize);
                        _this.keypad.showKeypad(_this.keypadSize);
                    }
                }
                else if (event.keyCode === 8 || event.keyCode === 46) {
                    // deletion of guess
                    _this.model.deleteGuess();
                    _this.model.activateCell([-1, -1]);
                    _this.model.showBoard(_this.canvasSize);
                    _this.keypad.showKeypad(_this.keypadSize);
                }
            };
            // event handler that resizes the game board based on window size
            window.onresize = function () {
                _this.canvasSize = utility_1.calculateDesiredCanvasSize();
                var valueAtActiveCell = _this.model.getValueAtActiveCell();
                var activeIndex;
                if (typeof valueAtActiveCell === "undefined") {
                    activeIndex = 0;
                }
                else if (valueAtActiveCell > 0) {
                    activeIndex = valueAtActiveCell;
                }
                _this.keypadSize[0] = 0.95 * _this.canvasSize;
                _this.keypadSize[1] = 0.95 * _this.canvasSize / _this.numKeypadCells;
                _this.model.showBoard(_this.canvasSize);
                _this.keypad.showKeypad(_this.keypadSize, activeIndex);
            };
            this.eventListenersAdded = true;
        }
    };
    return Controller;
}());
exports.Controller = Controller;

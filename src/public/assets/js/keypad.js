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
        var desiredSize = utility_1.calculateDesiredCanvasSize();
        this.showKeypad([desiredSize, desiredSize / numCells]);
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
    Keypad.prototype.showKeypad = function (canvasSize, activeIndex) {
        var renderConfig = {
            padding: 0,
            canvasSize: canvasSize,
            board: [this.buildDrawTextConfig(activeIndex)]
        };
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

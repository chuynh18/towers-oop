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

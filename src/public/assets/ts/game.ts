// execution starts here
"use strict";

// Constants
const GAME_CANVAS = <HTMLCanvasElement> document.getElementById("tower");
const KEYPAD_CANVAS = <HTMLCanvasElement> document.getElementById("keypad");

import { Game } from "./model";
import { CanvasRenderer } from "./canvas-renderer";
import { Controller } from "./controller";
import { Keypad } from "./keypad";

const towersGameSize = 5;

const view = new CanvasRenderer(GAME_CANVAS, towersGameSize + 2);
const model = new Game(view, towersGameSize);
const keypadView = new CanvasRenderer(KEYPAD_CANVAS, towersGameSize + 1, 1);
const keypad = new Keypad(keypadView);
const controller = new Controller(model, view, GAME_CANVAS, keypadView, keypad, KEYPAD_CANVAS);
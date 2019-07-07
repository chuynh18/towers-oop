"use strict";

import { CanvasRenderer } from "./canvas-renderer";
import { Game } from "./model";
import { calculateDesiredCanvasSize } from "./utility";
import { Keypad } from "./keypad";

/**
 * The controller.  Holds all the code that determines user interactions.
 */
export class Controller {

   private eventListenersAdded = false;
   private model: Game;
   private view: CanvasRenderer;
   private canvas: HTMLCanvasElement;
   private canvasSize: number;
   private keypadView: CanvasRenderer;
   private keypad: Keypad;
   private keypadCanvas: HTMLCanvasElement;
   private numKeypadCells: number;

   /**
    * Creates an instance of the controller and attaches all needed event
    * handlers.
    * 
    * @param  {Game} model - a Game object
    * @param  {CanvasRenderer} view - a CanvasRenderer object
    */
   constructor(model: Game, view: CanvasRenderer, canvas: HTMLCanvasElement, keypadView: CanvasRenderer, keypad: Keypad, keypadCanvas: HTMLCanvasElement) {
      this.model = model;
      this.view = view;
      this.canvas = canvas;
      this.keypadView = keypadView;
      this.keypad = keypad;
      this.canvasSize = calculateDesiredCanvasSize();
      this.keypadCanvas = keypadCanvas;
      this.numKeypadCells = this.keypadView.getBoardInfo().numCellsX;
      this.attachEventHandlers();
   }

   private attachEventHandlers(): void {
      if (!this.eventListenersAdded) {
         // event handler for activating/deactivating clicked cells
         this.canvas.addEventListener("click", (event: MouseEvent) => {
            const clickCoords = this.view.calculateClickCoordinates(event);
            this.model.activateCell(clickCoords);
            this.model.showBoard(this.canvasSize);
            
            const valueAtActiveCell = this.model.getValueAtActiveCell();
            let activeIndex;

            if (typeof valueAtActiveCell === "undefined") {
               activeIndex = 0;
            } else if (valueAtActiveCell > 0) {
               activeIndex = valueAtActiveCell;
            }

            this.keypad.showKeypad(
               [this.canvasSize, this.canvasSize/this.numKeypadCells],
               activeIndex
               );
         });

         // event handler for clicks on the virtual keypad
         this.keypadCanvas.addEventListener("click", (event: MouseEvent) => {
            const clickCoords = this.keypadView.calculateClickCoordinates(event);
            const keypadValue = clickCoords[0];
            const valueAtActiveCell = this.model.getValueAtActiveCell();

            if (valueAtActiveCell !== -1) {
               if (keypadValue === 0) {
                  this.model.deleteGuess();
                  this.model.showBoard(this.canvasSize);
               } else {
                  if (this.model.insertGuess(keypadValue)) {
                     this.model.showBoard(this.canvasSize);
                  }
               }
               
               const valueAtActiveCell = this.model.getValueAtActiveCell();
               let activeIndex;

               if (typeof valueAtActiveCell === "undefined") {
                  activeIndex = 0;
               } else if (valueAtActiveCell > 0) {
                  activeIndex = valueAtActiveCell;
               }

               this.keypad.showKeypad(
                  [this.canvasSize, this.canvasSize/this.numKeypadCells],
                  activeIndex
                  );
            }
         });

         // event handler that allows user to input and modify their guesses
         window.onkeyup = (event: KeyboardEvent) => {
            if (
               (event.keyCode >= 48 && event.keyCode <= 57) ||
               (event.keyCode >= 96 && event.keyCode <= 105)
            ) {
               const key = Number(event.key);

               // perform insertion.  if success, deactivate cell and update UI
               if (this.model.insertGuess(key)) {
                  this.model.activateCell([-1, -1]);
                  this.model.showBoard(this.canvasSize);
                  this.keypad.showKeypad([this.canvasSize, this.canvasSize/this.numKeypadCells]);
               }   
            } else if (event.keyCode === 8 || event.keyCode === 46) {
               // deletion of guess
               this.model.deleteGuess();
               this.model.activateCell([-1, -1]);
               this.model.showBoard(this.canvasSize);
               this.keypad.showKeypad([this.canvasSize, this.canvasSize/this.numKeypadCells]);
            }
         }

         // event handler that resizes the game board based on window size
         window.onresize = () => {
            this.canvasSize = calculateDesiredCanvasSize();
            
            const valueAtActiveCell = this.model.getValueAtActiveCell();
            let activeIndex;

            if (typeof valueAtActiveCell === "undefined") {
               activeIndex = 0;
            } else if (valueAtActiveCell > 0) {
               activeIndex = valueAtActiveCell;
            }

            this.model.showBoard(this.canvasSize);
            this.keypad.showKeypad(
               [this.canvasSize, this.canvasSize/this.numKeypadCells],
               activeIndex
               );
         }

         this.eventListenersAdded = true;
      }
   }
}
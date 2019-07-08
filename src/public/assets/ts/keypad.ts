"use strict";

import { CanvasRenderer } from "./canvas-renderer";
import { DrawTextConfig, RenderConfig } from "./interfaces";
import { calculateDesiredCanvasSize } from "./utility";

export class Keypad {
   private canvasRenderer: CanvasRenderer;
   private values: number[] = [];

   constructor(keypadCanvas: CanvasRenderer) {
      this.canvasRenderer = keypadCanvas; // bind to keypad's canvas renderer

      // populate values array
      const numCells = this.canvasRenderer.getBoardInfo().numCellsX;
      for (let i = 0; i < numCells - 1; i++) {
         this.values[i + 1] = i + 1;
      }

      const desiredCanvasSize = 0.95 * calculateDesiredCanvasSize();

      this.showKeypad(undefined, [desiredCanvasSize, desiredCanvasSize / numCells]);
   }

   private buildDrawTextConfig(activeIndex?: number): DrawTextConfig[] {
      const output: DrawTextConfig[] = [];

      for (let i = 0; i < this.values.length; i++) {
         let text;

         if (typeof this.values[i] === "undefined") {
            text = "";
         } else {
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
   }

   public showKeypad(activeIndex?: number, canvasSize?: number | [number, number]) {
      const renderConfig: RenderConfig = {
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
   }
}
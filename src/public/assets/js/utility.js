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
    var height = 0.90 * window.innerHeight - 120;
    return width > height ? height : width;
}
exports.calculateDesiredCanvasSize = calculateDesiredCanvasSize;

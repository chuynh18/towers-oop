/**
 * Highlight object definition - used by CanvasRenderer.highlightCell() method.
 * 
 * @interface  HighlightConfig
 * 
 * @property  {number} x - The x-coordinate of the cell to be highlighted.  The
 * top-leftmost cell is cell (0,0).
 * @property  {number} y - The y-coordinate of the cell to be highlighted.
 * @property  {string} color - The highlight color for the cell.  This can be
 * either an HTML color name such as "red" or an HTML color code such as
 * "#baddad".
 */
export interface HighlightConfig {
   x: number;
   y: number;
   color: string;
}

/**
 * DrawText object definition.  Used by the CanvasRenderer.drawText() method.
 * Specifies text to be displayed in a given cell.
 * 
 * @interface  DrawTextConfig
 * 
 * @property  {string} text - The text to be drawn.
 * @property  {string} font - The desired font.  Defaults to Arial if omitted.
 * @property  {number} fontSize? (optional) - The desired font size in pixels.
 * Defaults to a calculated font size based on cell dimensions if omitted.
 * @property  {string} color? (optional) - The desired font color.  Defaults to
 * black if omitted.
 * @property  {number} xPixelOffset? (optional) - The x-axis pixel offset for
 * the drawn text.  Text is centered in the cell by default.  A positive offset
 * moves the text to the right.
 * @property  {number} yPixelOffset? (optional) - The y-axis pixel offset for
 * the drawn text.  Text is centered in the cell by default.  A positive offset
 * moves the text upward.
 */
export interface DrawTextConfig {
   text: string;
   font?: string;
   fontSize?: number;
   color?: string;
   xPixelOffset?: number;
   yPixelOffset?: number;
}

/**
 * RenderConfig object defintion.  RenderConfig objects are used by the
 * CanvasRenderer.render() method to determine what will be painted onto the
 * game board.
 * 
 * @interface  RenderConfig
 * 
 * @property  {number} padding - The "thickness" of the outer ring of cells that
 * will NOT be rendered.
 * @property  {number | [number, number]} canvasSize - The pixel dimensions of
 * the canvas.  If canvasSize is a number, then the canvas will be a square of
 * canvasSize by canvasSize pixels.  Otherwise, it will be [x, y] pixels.
 * @property  {HighlightConfig | HighlightConfig[]} highlight? (optional) - The
 * cell(s) to be highlighted.  See the HighlightConfig interface definition for
 * more details.  If one HighlightConfig object is passed, then only the
 * corresponding cell will be highlighted.  If an array of HighlightConfig
 * objects are passed, then all corresponding cells are highlighted.
 */
export interface RenderConfig {
   padding: number;
   canvasSize?: number | [number, number];
   highlight?: HighlightConfig | HighlightConfig[];
   board?: (DrawTextConfig|undefined)[][];
}

/**
 * BoardInfo objects are returned by the CanvasRenderer.getBoardInfo public
 * method.  This method can be used by other parts of the program to get current
 * information on certain characteristics of the game board.
 * 
 * @interface  BoardInfo
 * 
 * @property  {number} numCellsX - The number of cells in a game board row.
 * @property  {number} numCellsY - The number of cells in a game board column.
 * @property  {number} cellWidth - The width of an individual game board cell.
 * @property  {number} cellHeight - The height of an individual game board cell.
 * @property  {number} canvasWidth - The pixel width of the canvas element.
 * @property  {number} canvasHeight - The pixel height of the canvas element.
 */
export interface BoardInfo {
   numCellsX: number;
   numCellsY: number;
   cellWidth: number;
   cellHeight: number;
   canvasWidth: number;
   canvasHeight: number; 
}

/**
 * LineViolation objects show whether the clue has been violated and if the row
 * or column has been completely filled.
 * 
 * @interface  ClueViolation
 * 
 * @property  {boolean} lineFilled - The row or column has been completed by the
 * player.
 * @property  {boolean} violation - The line as currently filled violates the
 * provided clue.
 */
export interface ClueViolation {
   lineFilled: boolean;
   violation: boolean;
}
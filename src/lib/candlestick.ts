import { drawLine, drawPoint } from "./graphics";
import { remapPoint } from "./math";
import { Bounds, CandleStickOptions, DataPoint } from "./types";

export class CandleStick {
  constructor(private ctx: CanvasRenderingContext2D, private data: DataPoint) {}

  /**
   * Gets the data point for the candlestick.
   * @returns The data point for the candlestick.
   */
  public getDataPoint(): DataPoint {
    return this.data;
  }

  /**
   * Draws the candlestick. The candlestick is drawn as a line from the high to the low, and a rectangle from the open to the close.
   * @param dataBounds - The bounds of the data.
   * @param pixelBounds - The bounds of the canvas.
   * @param options - The options for the candlestick.
   */
  public draw(dataBounds: Bounds, pixelBounds: Bounds, options: CandleStickOptions): void {
    const openLoc = remapPoint(dataBounds, pixelBounds, [this.data.time.getTime(), this.data.open]);
    const closeLoc = remapPoint(dataBounds, pixelBounds, [this.data.time.getTime(), this.data.close]);
    const highLoc = remapPoint(dataBounds, pixelBounds, [this.data.time.getTime(), this.data.high]);
    const lowLoc = remapPoint(dataBounds, pixelBounds, [this.data.time.getTime(), this.data.low]);

    drawLine(this.ctx, highLoc, lowLoc, "gray", 2);

    if (this.data.open > this.data.close) {
      drawLine(this.ctx, openLoc, closeLoc, "red", 2 * options.width);
    } else {
      drawLine(this.ctx, openLoc, closeLoc, "green", 2 * options.width);
    }

    drawPoint(this.ctx, openLoc, options.pointColor, options.radius);
    drawPoint(this.ctx, closeLoc, options.pointColor, options.radius);
    drawPoint(this.ctx, highLoc, options.pointColor, options.radius);
    drawPoint(this.ctx, lowLoc, options.pointColor, options.radius);
  }
}

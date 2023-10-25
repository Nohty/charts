import { GraphicsTextOptions, Point } from "./types";

/**
 * Draws a point on a canvas context.
 * @param ctx - The canvas rendering context to draw on.
 * @param point - The coordinates of the point to draw.
 * @param color - The color of the point.
 * @param radius - The radius of the point (default is 5).
 */
export function drawPoint(ctx: CanvasRenderingContext2D, point: Point, color: string, radius = 5) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point[0], point[1], radius, 0, 2 * Math.PI);
  ctx.fill();
}

/**
 * Draws text on a canvas context.
 * @param ctx - The canvas rendering context to draw on.
 * @param text - The text to draw.
 * @param location - The coordinates of the text.
 * @param options - The options for the text.
 */
export function drawText(ctx: CanvasRenderingContext2D, text: string, location: Point, options: GraphicsTextOptions) {
  ctx.textAlign = options.align;
  ctx.textBaseline = options.baseline;
  ctx.font = `${options.size}px ${options.fontFamily}`;
  ctx.fillStyle = options.color;
  ctx.fillText(text, location[0], location[1]);
}

/**
 * Draws a line on a canvas context.
 * @param ctx - The canvas rendering context to draw on.
 * @param start - The starting coordinates of the line.
 * @param end - The ending coordinates of the line.
 * @param color - The color of the line.
 * @param width - The width of the line.
 */
export function drawLine(ctx: CanvasRenderingContext2D, start: Point, end: Point, color: string, width: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(start[0], start[1]);
  ctx.lineTo(end[0], end[1]);
  ctx.stroke();
}

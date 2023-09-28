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
 * @param point - The point on the canvas to draw the text at.
 * @param options - The options for the text drawing.
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  point: Point,
  options: GraphicsTextOptions
) {
  ctx.fillStyle = options.color;
  ctx.font = `${options.fontWeight} ${options.size}px ${options.fontFamily}`;
  ctx.textAlign = options.align;
  ctx.textBaseline = options.baseline;
  ctx.fillText(text, point[0], point[1]);
}

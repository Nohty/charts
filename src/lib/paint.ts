import { Point } from "./types";

export class Paint {
  constructor(private ctx: CanvasRenderingContext2D) {}

  public drawLine(startPos: Point, endPoint: Point): void {
    this.ctx.beginPath();
    this.ctx.moveTo(startPos[0], startPos[1]);
    this.ctx.lineTo(endPoint[0], endPoint[1]);
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "black";
    this.ctx.stroke();
  }
}

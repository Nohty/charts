import { Point } from "./types";

export class Paint {

    constructor(private ctx: CanvasRenderingContext2D) {}

    public draw(startPos: Point, endPoint: Point): void {
        this.ctx.beginPath();
        this.ctx.moveTo(startPos[0], startPos[1]);
        this.ctx.lineWidth = 1;
        this.ctx.lineTo(endPoint[0], endPoint[1]);
        this.ctx.strokeStyle = 'black';
        this.ctx.stroke();
    }
    
    public removeDrawings(): void {
        // removes everything in the canvas
        this.ctx.clearRect(0, 0, 1200, 900);
        
    }
}
import { CandleStick } from "./candlestick";
import { Chart } from "./chart";

export class Indicator {

    private data: CandleStick[] = [];

    constructor(private ctx: CanvasRenderingContext2D) {}

    private drawMovingAverage(result: number[]): void {
        console.log(result);

        for (let i = 0; i < result.length; i++) {            
            this.ctx.beginPath();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "black";
            this.ctx.moveTo(100, result[i]);
            this.ctx.lineTo(100, result[i + 1]);
            this.ctx.stroke();
        }
    }

    private calculateDataSum(start: number, stop: number): number {
        let sum = 0;
        for (let i = start; i < stop; i++) {
            sum += this.data[i].getDataPoint().close;
        }
        return sum;
    }

    public movingAverage(window: number): void {
        const steps = this.data.length - window;
        const result = [];
        for (let i = 0; i < steps; i++) {
            const sum = this.calculateDataSum(i, i + window);
            result.push(sum / window);
        }
        this.drawMovingAverage(result);
    }

    public getData(data: CandleStick[]): void {
        this.data = data;
    }

}
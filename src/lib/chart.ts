import { drawText } from "./graphics";
import { remap } from "./math";
import { ChartOptions, Data, DeepPartial, InputData } from "./types";

export class ChartCandleStick {
  private options: ChartOptions;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private data: Data[] = [];

  private margin = 20;

  constructor(private container: HTMLElement, options?: DeepPartial<ChartOptions>) {
    this.options = {
      width: 1000,
      height: 600,
      labels: ["time", "value"],
      layout: {
        textColor: "#333",
        backgroundColor: "#fff",
        pointColor: "#333",
        lineColor: "#333",
        connectPoints: true,
        opacity: 1,
      },
      ...(options as Partial<ChartOptions>),
    };

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.canvas.style.backgroundColor = this.options.layout.backgroundColor;
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d")!;
  }

  public setData(data: InputData[]): void {
    this.data = data.map((d) => [new Date(d[0]), d[1], d[2], d[3], d[4]]);
    this.draw();
  }

  public addData(data: InputData): void {
    this.data.push([new Date(data[0]), data[1], data[2], data[3], data[4]]);
  }

  public draw(): void {
    this.ctx.clearRect(0, 0, this.options.width, this.options.height);

    // Drawing the axes
    this.drawAxes();

    const yValues = this.data.flatMap((d) => [d[1], d[2], d[3], d[4]]);
    const yMax = Math.max(...yValues);
    const yMin = Math.min(...yValues);

    const candleWidth = (this.options.width - 2 * this.margin) / this.data.length;

    for (let i = 0; i < this.data.length; i++) {
      const [date, open, close, high, low] = this.data[i];
      const x = this.margin + i * candleWidth;

      const yHigh = remap(yMax, yMin, this.margin, this.options.height - this.margin, high);
      const yLow = remap(yMax, yMin, this.margin, this.options.height - this.margin, low);
      const yOpen = remap(yMax, yMin, this.margin, this.options.height - this.margin, open);
      const yClose = remap(yMax, yMin, this.margin, this.options.height - this.margin, close);

      // Draw the candle body
      this.ctx.fillStyle = open < close ? "#00ff00" : "#ff0000";
      this.ctx.fillRect(x, yClose, candleWidth, yOpen - yClose);

      // Draw the wicks
      this.ctx.strokeStyle = "#000000"; // wicks are usually black
      this.ctx.beginPath();
      this.ctx.moveTo(x + candleWidth / 2, yLow);
      this.ctx.lineTo(x + candleWidth / 2, yHigh);
      this.ctx.stroke();
    }
  }

  public drawAxes(): void {
    // Drawing the x-axis (time)
    drawText(
      this.ctx,
      this.options.labels[0],
      [this.options.width / 2, this.options.height - this.margin / 2],
      {
        color: this.options.layout.textColor,
        size: 12,
        align: "center",
        baseline: "middle",
        fontFamily: "Arial",
        fontWeight: "normal",
      }
    );

    this.ctx.strokeStyle = this.options.layout.lineColor;
    this.ctx.beginPath();
    this.ctx.moveTo(this.margin, this.options.height - this.margin);
    this.ctx.lineTo(this.options.width - this.margin, this.options.height - this.margin);
    this.ctx.stroke();

    // Drawing the y-axis (price)
    drawText(this.ctx, this.options.labels[1], [this.margin / 2, this.options.height / 2], {
      color: this.options.layout.textColor,
      size: 12,
      align: "center",
      baseline: "middle",
      fontFamily: "Arial",
      fontWeight: "normal",
    });

    this.ctx.strokeStyle = this.options.layout.lineColor;
    this.ctx.beginPath();
    this.ctx.moveTo(this.margin, this.margin);
    this.ctx.lineTo(this.margin, this.options.height - this.margin);
    this.ctx.stroke();
  }
}

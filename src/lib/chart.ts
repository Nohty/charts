import { Bounds, ChartOptions, DeepPartial, Point } from "./types";
import {} from "./math";
import { drawText } from "./graphics";

export class Chart {
  private options: ChartOptions;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private data: Point[] = [];

  private margin = 20;

  constructor(private container: HTMLElement, options?: DeepPartial<ChartOptions>) {
    this.options = {
      width: 600,
      height: 400,
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

    this.drawAxes();
  }

  public setData(data: Point[]) {
    this.data = data;
    this.drawAxes();
    // this.draw();
  }

  private drawAxes() {
    this.ctx.strokeStyle = this.options.layout.textColor;
    this.ctx.fillStyle = this.options.layout.textColor;
    this.ctx.lineWidth = 1;

    this.ctx.beginPath();
    this.ctx.moveTo(this.margin, this.canvas.height - this.margin);
    this.ctx.lineTo(this.canvas.width - this.margin, this.canvas.height - this.margin);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width - this.margin, this.canvas.height - this.margin);
    this.ctx.lineTo(this.canvas.width - this.margin, this.margin);
    this.ctx.stroke();

    drawText(
      this.ctx,
      this.options.labels[0],
      [this.canvas.width / 2, this.canvas.height - this.margin / 2],
      {
        color: this.options.layout.textColor,
        size: 14,
        align: "center",
        baseline: "middle",
        fontFamily: "sans-serif",
        fontWeight: "bold",
      }
    );

    this.ctx.save();
    this.ctx.translate(this.canvas.width - this.margin / 2, this.canvas.height / 2);
    this.ctx.rotate(-Math.PI / 2);
    drawText(this.ctx, this.options.labels[1], [0, 0], {
      color: this.options.layout.textColor,
      size: 14,
      align: "center",
      baseline: "middle",
      fontFamily: "sans-serif",
      fontWeight: "bold",
    });
    this.ctx.restore();

    // draw min/max values
    const bounds = this.getDataBounds();
    const minX = bounds[0][0];
    const maxX = bounds[1][0];
    const minY = bounds[0][1];
    const maxY = bounds[1][1];

    drawText(this.ctx, `${minX}`, [this.margin, this.canvas.height - this.margin / 2], {
      color: this.options.layout.textColor,
      size: 14,
      align: "center",
      baseline: "middle",
      fontFamily: "sans-serif",
      fontWeight: "bold",
    });
  }

  private getDataBounds(): Bounds {
    const xValues = this.data.map((point) => point[0]);
    const yValues = this.data.map((point) => point[1]);

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    return [
      [minX, minY],
      [maxX, maxY],
    ];
  }
}

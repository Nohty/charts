import { drawLine, drawPoint } from "./graphics";
import { remapPoint } from "./math";
import { Bounds, CandleStickOptions, ChartOptions, DataPoint, DeepPartial } from "./types";

export class Chart {
  private options: ChartOptions;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private data: CandleStick[] = [];

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

  private getDataBounds(): Bounds {
    return {
      left: Math.min(...this.data.map((d) => d.getDataPoint().time.getTime())),
      right: Math.max(...this.data.map((d) => d.getDataPoint().time.getTime())),
      top: Math.max(...this.data.map((d) => d.getDataPoint().high)),
      bottom: Math.min(...this.data.map((d) => d.getDataPoint().low)),
    };
  }

  private getPixelBounds(): Bounds {
    return {
      left: this.margin,
      right: this.canvas.width - this.margin,
      top: this.margin,
      bottom: this.canvas.height - this.margin,
    };
  }

  private cleansingData(data: DataPoint[]): DataPoint[] {
    return data.map((d) => {
      if (d.time instanceof Date) return d;
      else return { ...d, time: new Date(d.time) };
    });
  }

  public setData(data: DataPoint[]): void {
    this.data = this.cleansingData(data).map((d) => new CandleStick(this.ctx, d));
    this.draw();
  }

  public addData(data: DataPoint[]): void {
    this.data.push(...this.cleansingData(data).map((d) => new CandleStick(this.ctx, d)));
    this.draw();
  }

  public draw(): void {
    for (const candleStick of this.data) {
      candleStick.draw(this.getDataBounds(), this.getPixelBounds(), { radius: 2, width: 10 });
    }

    this.drawAxes();
  }

  public drawAxes(): void {

    // x = time
    // y = price

    const {bottom, left, right, top} = this.getPixelBounds();
    const yMid = (bottom + top) / 2;
    const xMid = (left + right) / 2;

    console.log(yMid + " " + xMid);
    

    // y as 
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineWidth = 1;
    this.ctx.lineTo(0, bottom + 15);
    this.ctx.strokeStyle = "black";
    this.ctx.stroke();

    this.ctx.font = "1rem Arial";
    this.ctx.fillText("Price", 0, yMid);


    // x as 
    this.ctx.beginPath();
    this.ctx.moveTo(0, bottom + 15);
    this.ctx.lineWidth = 1;
    this.ctx.lineTo(right, bottom + 15);
    this.ctx.stroke();

    this.ctx.font = "1rem Arail";
    this.ctx.fillText("Date", xMid, bottom + 10);
  }
}

class CandleStick {
  constructor(private ctx: CanvasRenderingContext2D, private data: DataPoint) {}

  public getDataPoint(): DataPoint {
    return this.data;
  }

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

    drawPoint(this.ctx, openLoc, "black", options.radius);
    drawPoint(this.ctx, closeLoc, "black", options.radius);
    drawPoint(this.ctx, highLoc, "black", options.radius);
    drawPoint(this.ctx, lowLoc, "black", options.radius);
  }
}

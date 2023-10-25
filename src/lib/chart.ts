import { Bounds, ChartOptions, DataPoint, DeepPartial } from "./types";

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
    console.log(data);
    this.data = this.cleansingData(data).map((d) => new CandleStick(this.ctx, d));
    this.draw();
  }

  public addData(data: DataPoint[]): void {
    this.data.push(...this.cleansingData(data).map((d) => new CandleStick(this.ctx, d)));
    this.draw();
  }

  public draw(): void {
    const candleStick = this.data[0];
    candleStick.draw(this.getDataBounds(), this.margin);
  }

  public drawAxes(): void {}
}

class CandleStick {
  constructor(private ctx: CanvasRenderingContext2D, private data: DataPoint) {}

  public getDataPoint(): DataPoint {
    return this.data;
  }

  public draw(bounds: Bounds, margin: number, width = 10): void {}
}

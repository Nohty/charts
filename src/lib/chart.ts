import { drawLine, drawPoint } from "./graphics";
import { remapPoint } from "./math";
import { Bounds, CandleStickOptions, ChartOptions, DataPoint, DeepPartial } from "./types";

export class Chart {
  private options: ChartOptions;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private data: CandleStick[] = [];

  private margin = 100;

  constructor(private container: HTMLElement, options?: DeepPartial<ChartOptions>) {
    this.options = {
      width: 1100,
      height: 1000,
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
    const {bottom, left, right, top} = this.getPixelBounds();
    const yMid = (bottom + top) / 2;
    const xMid = (left + right) / 2;
    
    // y as 
    this.drawAs(0, 0, bottom, "Price", yMid, 5);
    this.drawYAsData(top, bottom);

    // x as 
    this.drawAs(bottom + 15, right + 100, bottom, "Date", xMid, bottom + 10, true);
    this.drawXAsData(left, right, bottom);

  }

  public drawAs(xMoveTo: number, xLineTo: number, yLineTo: number, label: string, midPoint: number, fillTextCor: number, xAs: boolean = false): void {
    this.ctx.beginPath();
    this.ctx.moveTo(0, xMoveTo);
    this.ctx.lineWidth = 1;
    this.ctx.lineTo(xLineTo, yLineTo + 15);
    this.ctx.strokeStyle = 'Black';
    this.ctx.stroke();

    this.ctx.font = "1rem Arail";
    if (xAs) {
      this.ctx.fillText(label, midPoint, fillTextCor);
    } else {
      this.ctx.fillText(label, fillTextCor, midPoint);
    }
  }

  public drawYAsData(top: number, bottom: number): void {
    let high = 0;
    let low = 100; // must be a high number because it needs to be higher then the lowest number in the data
    this.data.forEach(el => {
      if (el.getDataPoint().high > high) {
        high = el.getDataPoint().high;
      } else if (el.getDataPoint().low < low) {
        low = el.getDataPoint().low;
      } 
    });

    this.ctx.font = '1rem Arail';
    this.ctx.fillText(high.toString(), 5, top);
    this.ctx.fillText(low.toString(), 5, bottom);
    
  }

  public drawXAsData(left: number, right: number, bottom: number): void {
    const firstDate = this.data[0]?.getDataPoint().time.toString().split(' ');
    const lastDate = this.data[this.data.length - 1]?.getDataPoint().time.toString().split(' ');

    if (!lastDate && !firstDate) return; //see if lastDate and firstDate is defined

    // correctly dipslay date
    let startDate = firstDate[0] + " " + firstDate[1] + " " + firstDate[2];
    let endDate = lastDate[0] + " " + lastDate[1] + " " + lastDate[2];

    this.ctx.font = '1rem Arail';
    this.ctx.fillText(startDate, left, bottom);
    this.ctx.fillText(endDate, right, bottom);
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

import { CandleStick } from "./candlestick";
import { Indicator } from "./indicator";
import { distance, getNearest, remapPoint } from "./math";
import { Paint } from "./paint";
import { Bounds, ChartOptions, DataPoint, DeepPartial, Point } from "./types";

export class Chart {
  private options: ChartOptions;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private data: CandleStick[] = [];

  private margin = 100;

  private readonly paint: Paint;
  private readonly indicator: Indicator;

  constructor(private container: HTMLElement, options?: DeepPartial<ChartOptions>) {
    this.options = {
      width: 1200,
      height: 900,
      tooltipEnabled: true,
      layout: {
        textColor: "#333",
        backgroundColor: "#fff",
        pointColor: "#333",
        lineColor: "#333",
      },
      ...(options as Partial<ChartOptions>),
    };

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.canvas.style.backgroundColor = this.options.layout.backgroundColor;
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d")!;
    this.paint = new Paint(this.ctx);
    this.indicator = new Indicator(this.ctx);

    this.addEventListeners();
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

  private draw(): void {
    for (const candleStick of this.data) {
      candleStick.draw(this.getDataBounds(), this.getPixelBounds(), { radius: 2, width: 10, pointColor: "333" });
    }

    this.drawAxes();
  }

  private drawAxes(): void {
    const { bottom, left, right, top } = this.getPixelBounds();
    const yMid = (bottom + top) / 2;
    const xMid = (left + right) / 2;

    // y as
    this.drawAs([left - 50, left - 50], [left - 50, bottom + 50], "Price $", top - 40, left - 100);
    this.drawYAsData(top, bottom, left, yMid);

    // x as
    this.drawAs([left - 100, bottom + 5], [right + 100, bottom + 5], "Date", xMid, bottom + 60, true);
    this.drawXAsData(left, right, bottom, xMid);
  }

  private drawAs(
    moveTo: Point,
    lineTo: Point,
    label: string,
    midPoint: number,
    fillTextCor: number,
    xAs: boolean = false
  ): void {
    this.ctx.beginPath();
    this.ctx.moveTo(moveTo[0], moveTo[1]);
    this.ctx.lineWidth = 1;
    this.ctx.lineTo(lineTo[0], lineTo[1]);
    this.ctx.strokeStyle = this.options.layout.textColor;
    this.ctx.stroke();

    this.ctx.font = "1rem Arail";
    if (xAs) {
      this.ctx.fillText(label, midPoint, fillTextCor);
    } else {
      this.ctx.fillText(label, fillTextCor, midPoint);
    }
  }

  private drawYAsData(top: number, bottom: number, left: number, midPoint: number): void {
    let high = 0;
    let low = 100; // must be a high number because it needs to be higher then the lowest number in the data

    this.data.forEach((el) => {
      if (el.getDataPoint().high > high) {
        high = el.getDataPoint().high;
      } else if (el.getDataPoint().low < low) {
        low = el.getDataPoint().low;
      }
    });

    const mid = (high + low) / 2;

    this.ctx.font = "1rem Arail";
    this.ctx.fillText(high.toString(), left - 100, top);
    this.ctx.fillText(low.toString(), left - 100, bottom);
    this.ctx.fillText(mid.toString(), left - 100, midPoint);
  }

  private drawXAsData(left: number, right: number, bottom: number, xMid: number): void {
    const midPointData = this.data.length / 2;

    let startDate = this.getDateToDisplay(0);
    let middelDate = this.getDateToDisplay(midPointData);
    let endDate = this.getDateToDisplay(this.data.length - 1);

    this.ctx.font = "1rem Arail";
    this.ctx.fillText(startDate, left, bottom + 30);
    this.ctx.fillText(middelDate, xMid, bottom + 30);
    this.ctx.fillText(endDate, right, bottom + 30);
  }

  private getDateToDisplay(index: number): string {
    const dateSplit = this.data[index].getDataPoint().time.toString().split(" ");
    const result = dateSplit[0] + " " + dateSplit[1] + " " + dateSplit[2];

    return result;
  }

  private addEventListeners(): void {
    this.canvas.addEventListener("mousemove", (e: MouseEvent) => {
      e.preventDefault();

      if (this.options.tooltipEnabled) {
        const mousePos = this.getMousePos(e);

        const points = this.data.flatMap((d) => [
          remapPoint(this.getDataBounds(), this.getPixelBounds(), [
            d.getDataPoint().time.getTime(),
            d.getDataPoint().open,
          ]),
          remapPoint(this.getDataBounds(), this.getPixelBounds(), [
            d.getDataPoint().time.getTime(),
            d.getDataPoint().high,
          ]),
          remapPoint(this.getDataBounds(), this.getPixelBounds(), [
            d.getDataPoint().time.getTime(),
            d.getDataPoint().low,
          ]),
          remapPoint(this.getDataBounds(), this.getPixelBounds(), [
            d.getDataPoint().time.getTime(),
            d.getDataPoint().close,
          ]),
        ]);

        const index = getNearest(mousePos, points);
        const nearest = this.data[Math.floor(index / 4)].getDataPoint();
        const distanceToNearest = distance(points[index], mousePos);

        if (distanceToNearest < this.margin / 5) {
          this.displayTooltip(nearest, mousePos);
        } else {
          this.displayTooltip(null);
        }
      }
    });
  }

  private displayTooltip(dataPoint: DataPoint | null, mousePos?: Point): void {
    const tooltip = this.container.querySelector("span");
    if (tooltip) this.container.removeChild(tooltip);

    if (dataPoint) {
      const computedStyle = window.getComputedStyle(this.container);

      const canvasMarginLeft = parseFloat(computedStyle.marginLeft);
      const canvasMarginTop = parseFloat(computedStyle.marginTop);

      const span = document.createElement("span");
      span.style.position = "absolute";
      span.style.left = `${mousePos![0] + canvasMarginLeft + 20}px`;
      span.style.top = `${mousePos![1] + canvasMarginTop}px`;
      span.style.backgroundColor = "black";
      span.style.color = "white";
      span.style.padding = "5px";
      span.style.borderRadius = "5px";
      span.style.pointerEvents = "none";
      span.style.zIndex = "1";

      const date = new Date(dataPoint.time).toDateString();

      span.innerText = `Date: ${date} \nOpen: ${dataPoint.open} \nHigh: ${dataPoint.high} \nLow: ${dataPoint.low} \nClose: ${dataPoint.close}`;

      this.container.appendChild(span);
    }
  }

  private clearChart(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public getMousePos(evt: MouseEvent, dataSpace: boolean = false): Point {
    const rect = this.canvas.getBoundingClientRect();
    const point: Point = [evt.clientX - rect.left, evt.clientY - rect.top];

    if (dataSpace) return remapPoint(this.getPixelBounds(), this.getDataBounds(), point);
    else return point;
  }

  public setData(data: DataPoint[]): void {
    this.data = this.cleansingData(data).map((d) => new CandleStick(this.ctx, d));
    this.draw();
    this.indicator.getData(this.data);
  }

  public addData(data: DataPoint[]): void {
    this.data.push(...this.cleansingData(data).map((d) => new CandleStick(this.ctx, d)));
    this.draw();
  }

  public redraw(): void {
    this.clearChart();
    this.draw();
  }
}

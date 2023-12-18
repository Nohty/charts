import { CandleStick } from "./candlestick";
import { distance, getNearest, lerp, remap, remapPoint, subtract } from "./math";
import { Bounds, ChartOptions, DataPoint, DataTrans, DeepPartial, DragState, PersistentData, Point } from "./types";

/**
 * The chart class. This class is used to create a chart.
 */
export class Chart {
  private options: ChartOptions;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dataTrans: DataTrans;
  private dragState: DragState;
  private persistentData: PersistentData;

  private data: CandleStick[] = [];
  private margin = 100;

  /**
   * Creates a new chart. The chart will be put in the given container.
   * @param container - The container to put the chart in.
   * @param options - The options for the chart.
   */
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

    this.persistentData = {
      lines: [],
      movingAverage: -1,
    };

    this.dataTrans = {
      offset: [0, 0],
      scale: 1,
    };

    this.dragState = {
      dragging: false,
      start: [0, 0],
    };

    this.addEventListeners();
  }

  /**
   * Gets the bounds of the data. The bounds can be returned in normal space or data space.
   * @param normal - Whether or not to get the data bounds in normal space.
   * @returns The bounds of the data.
   */
  private getDataBounds(normal: boolean = true): Bounds {
    const bounds = {
      left: Math.min(...this.data.map((d) => d.getDataPoint().time.getTime())),
      right: Math.max(...this.data.map((d) => d.getDataPoint().time.getTime())),
      top: Math.max(...this.data.map((d) => d.getDataPoint().high)),
      bottom: Math.min(...this.data.map((d) => d.getDataPoint().low)),
    };

    if (!normal) {
      bounds.left = bounds.left + this.dataTrans.offset[0];
      bounds.right = bounds.right + this.dataTrans.offset[0];
      bounds.top = bounds.top + this.dataTrans.offset[1];
      bounds.bottom = bounds.bottom + this.dataTrans.offset[1];

      const center: Point = [(bounds.left + bounds.right) / 2, (bounds.top + bounds.bottom) / 2];

      bounds.left = lerp(center[0], bounds.left, this.dataTrans.scale ** 2);
      bounds.right = lerp(center[0], bounds.right, this.dataTrans.scale ** 2);
      bounds.top = lerp(center[1], bounds.top, this.dataTrans.scale ** 2);
      bounds.bottom = lerp(center[1], bounds.bottom, this.dataTrans.scale ** 2);
    }

    return bounds;
  }

  /**
   * Gets the bounds of the chart in pixel space.
   * @returns The bounds of the chart in pixel space.
   */
  private getPixelBounds(): Bounds {
    return {
      left: this.margin,
      right: this.canvas.width - this.margin,
      top: this.margin,
      bottom: this.canvas.height - this.margin,
    };
  }

  /**
   * Cleanses the data. This will convert the time to a date if it is not already a date.
   * @param data - The data to cleanse.
   * @returns The cleansed data.
   */
  private cleansingData(data: DataPoint[]): DataPoint[] {
    return data.map((d) => {
      if (d.time instanceof Date) return d;
      else return { ...d, time: new Date(d.time) };
    });
  }

  /**
   * Draws the chart. This will draw the data, moving average and lines.
   */
  private draw(): void {
    for (const candleStick of this.data) {
      candleStick.draw(this.getDataBounds(false), this.getPixelBounds(), {
        radius: 2,
        width: 10 / this.dataTrans.scale,
        pointColor: "333",
      });
    }

    if (this.persistentData.movingAverage !== -1) {
      this.movingAverage(this.persistentData.movingAverage);
    }

    for (const line of this.persistentData.lines) {
      this.drawLine(line[0], line[1]);
    }

    this.drawAxes();
  }

  /**
   * Draws the axes on the chart.
   */
  private drawAxes(): void {
    const { bottom, left, right, top } = this.getPixelBounds();
    const yMid = (bottom + top) / 2;
    const xMid = (left + right) / 2;

    // y as
    this.drawYAsData();
    this.drawAs([0, top], [0, bottom], "Price", yMid, 0);

    // x as
    this.drawXAsData(bottom);
    this.ctx.clearRect(0, bottom, this.canvas.width, this.canvas.height);
    this.drawAs([0, bottom], [right, bottom], "Date", xMid, bottom, true);
  }

  /**
   * Draws a line on the chart. The line can be drawn as the x as or the y as.
   * @param moveTo - The start position of the line.
   * @param lineTo - The end position of the line.
   * @param label - The label to display.
   * @param midPoint - The middle of the chart.
   * @param fillTextCor - The fill text cor.
   * @param xAs - Whether or not to draw the line as the x as.
   */
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
    this.ctx.lineTo(lineTo[0], lineTo[1]);
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = this.options.layout.textColor;
    this.ctx.stroke();
    this.ctx.font = "1rem Arail";

    if (xAs) {
      this.ctx.fillText(label, midPoint, fillTextCor);
    } else {
      this.ctx.fillText(label, fillTextCor, midPoint);
    }
  }

  /**
   * Draws prices on the chart (y as).
   */
  private drawYAsData(): void {
    const dataBounds = this.getDataBounds(false);
    const dataValues = this.getDataBounds(true);
    const pixelBounds = this.getPixelBounds();

    const minPixelDistance = 30;
    let drawnLabelYCoords: number[] = [];

    const sortedData = [...this.data].sort((a, b) => a.getDataPoint().open - b.getDataPoint().open);

    const topLoc = remapPoint(dataBounds, pixelBounds, [0, dataValues.top]);
    const bottomLoc = remapPoint(dataBounds, pixelBounds, [0, dataValues.bottom]);

    this.ctx.font = "1rem Arial";
    this.ctx.fillText(dataValues.top.toString(), 0, topLoc[1]);
    this.ctx.fillText(dataValues.bottom.toString(), 0, bottomLoc[1]);

    for (let i = 0; i < sortedData.length; i++) {
      const dataPoint = sortedData[i].getDataPoint();
      const openLoc = remapPoint(dataBounds, pixelBounds, [dataPoint.time.getTime(), dataPoint.open]);

      if (!drawnLabelYCoords.some((labelY) => Math.abs(openLoc[1] - labelY) < minPixelDistance)) {
        this.ctx.fillText(dataPoint.open.toString(), 0, openLoc[1]);
        drawnLabelYCoords.push(openLoc[1]);
      }
    }
  }

  /**
   * Draws dates on the chart (x as).
   * @param bottom - The bottom of the chart.
   */
  private drawXAsData(bottom: number): void {
    const dataBounds = this.getDataBounds(false);
    const pixelBounds = this.getPixelBounds();

    const minPixelDistance = 50;
    let drawnLabelXCoords: number[] = [];

    const sortedData = [...this.data].sort((a, b) => a.getDataPoint().time.getTime() - b.getDataPoint().time.getTime());

    this.ctx.font = "1rem Arial";

    for (let i = 0; i < sortedData.length; i++) {
      const dataPoint = sortedData[i].getDataPoint();
      const timeLoc = remapPoint(dataBounds, pixelBounds, [dataPoint.time.getTime(), 0]);

      if (!drawnLabelXCoords.some((labelX) => Math.abs(timeLoc[0] - labelX) < minPixelDistance)) {
        this.ctx.fillText(this.getDateToDisplay(i), timeLoc[0], bottom);
        drawnLabelXCoords.push(timeLoc[0]);
      }
    }
  }

  /**
   * Gets the date to display for the given index.
   * @param index - The index of the data point to get the date to display for.
   * @returns The date to display for the given index.
   */
  private getDateToDisplay(index: number): string {
    const dateSplit = this.data[index].getDataPoint().time.toString().split(" ");
    const result = dateSplit[0] + " " + dateSplit[1] + " " + dateSplit[2];

    return result;
  }

  /**
   * Adds event listeners to the chart.
   */
  private addEventListeners(): void {
    // start dragging
    this.canvas.addEventListener("mousedown", (e: MouseEvent) => {
      e.preventDefault();

      this.dragState.dragging = true;
      this.dragState.start = this.getMousePos(e, true);
    });

    // stop dragging
    this.canvas.addEventListener("mouseup", (e: MouseEvent) => {
      e.preventDefault();

      this.dragState.dragging = false;
    });

    // tooltip and dragging
    this.canvas.addEventListener("mousemove", (e: MouseEvent) => {
      e.preventDefault();

      if (this.options.tooltipEnabled) {
        const mousePos = this.getMousePos(e);

        const points = this.data.flatMap((d) => [
          remapPoint(this.getDataBounds(false), this.getPixelBounds(), [
            d.getDataPoint().time.getTime(),
            d.getDataPoint().open,
          ]),
          remapPoint(this.getDataBounds(false), this.getPixelBounds(), [
            d.getDataPoint().time.getTime(),
            d.getDataPoint().high,
          ]),
          remapPoint(this.getDataBounds(false), this.getPixelBounds(), [
            d.getDataPoint().time.getTime(),
            d.getDataPoint().low,
          ]),
          remapPoint(this.getDataBounds(false), this.getPixelBounds(), [
            d.getDataPoint().time.getTime(),
            d.getDataPoint().close,
          ]),
        ]);

        const index = getNearest(mousePos, points);
        const nearest = this.data[Math.floor(index / 4)].getDataPoint();
        const distanceToNearest = distance(points[index], mousePos);

        if (distanceToNearest < this.margin / 10 / this.dataTrans.scale) {
          this.displayTooltip(nearest, mousePos);
        } else {
          this.displayTooltip(null);
        }
      }

      if (this.dragState.dragging) {
        const mousePos = this.getMousePos(e, true);
        const delta = subtract(mousePos, this.dragState.start);

        this.dragState.start = mousePos;
        this.dataTrans.offset = subtract(this.dataTrans.offset, delta);

        this.redraw();
      }
    });

    // zooming
    this.canvas.addEventListener("wheel", (e: WheelEvent) => {
      e.preventDefault();

      const direction = Math.sign(e.deltaY);
      const step = 0.02;

      this.dataTrans.scale += direction * step;
      this.dataTrans.scale = Math.max(step, Math.min(2, this.dataTrans.scale));

      this.redraw();
    });
  }

  /**
   * Displays the tooltip for the given data point. If the data point is null, the tooltip will be removed.
   * @param dataPoint - The data point to display the tooltip for.
   * @param mousePos - The mouse position to display the tooltip at.
   */
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

  /**
   * Clears the chart.
   */
  private clearChart(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Gets the next n items from the data.
   * @param count - The number of items to get.
   * @param data - The data to get the items from.
   * @returns A function that returns the next n items from the data.
   */
  private getNextItems(count: number, data: CandleStick[]): () => CandleStick[] {
    let currentIndex = 0;

    return function () {
      const nextItems = data.slice(currentIndex, currentIndex + count);
      currentIndex += count;

      return nextItems;
    };
  }

  /**
   * Draws the moving average on the chart.
   * @param result - The result of the moving average.
   */
  private drawMovingAverage(result: Point[]): void {
    for (let i = 0; i < result.length; i++) {
      if (i === result.length - 1) break;

      const maLoc = remapPoint(this.getDataBounds(false), this.getPixelBounds(), result[i]);
      const endLoc = remapPoint(this.getDataBounds(false), this.getPixelBounds(), result[i + 1]);

      this.ctx.beginPath();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = "blue";

      this.ctx.moveTo(maLoc[0], maLoc[1]);
      this.ctx.lineTo(endLoc[0], endLoc[1]);
      this.ctx.stroke();
    }
  }

  /**
   * Calculates the moving average for the chart. The moving average is calculated by taking the average of the last n candles.
   * @param window - The number of candles to use for the moving average.
   */
  private movingAverage(window: number): void {
    const result: Point[] = [];

    const getNext = this.getNextItems(window, this.data);

    for (let i = 0; i < Math.ceil(this.data.length / window); i++) {
      const arr = getNext();
      const avarage = arr.reduce((acc, curr) => acc + curr.getDataPoint().close, 0) / arr.length;

      result.push([arr[0].getDataPoint().time.getTime(), avarage]);
    }

    this.drawMovingAverage(result);
  }

  /**
   * Draws a line on the chart.
   * @param startPos - The start position of the line.
   * @param endPoint - The end position of the line.
   */
  private drawLine(startPos: Point, endPoint: Point): void {
    const start = remapPoint(this.getDataBounds(false), this.getPixelBounds(), startPos);
    const end = remapPoint(this.getDataBounds(false), this.getPixelBounds(), endPoint);

    this.ctx.beginPath();
    this.ctx.moveTo(start[0], start[1]);
    this.ctx.lineTo(end[0], end[1]);
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "black";
    this.ctx.stroke();
  }

  /**
   * Adds a line to the chart.
   * @param startPos - The start position of the line.
   * @param endPoint - The end position of the line.
   */
  public addLine(startPos: Point, endPoint: Point): void {
    this.persistentData.lines.push([startPos, endPoint]);
    this.drawLine(startPos, endPoint);
  }

  /**
   * Gets the lines on the chart.
   * @returns The lines on the chart.
   */
  public getLines(): [Point, Point][] {
    return this.persistentData.lines;
  }

  /**
   * Removes a line from the chart.
   * @param index - The index of the line to remove. If -1, all lines will be removed.
   */
  public removeLine(index: number): void {
    if (index === -1) this.persistentData.lines = [];
    else this.persistentData.lines.splice(index, 1);

    this.redraw();
  }

  /**
   * Gets the mouse position. The mouse position can be returned in data space or normal space.
   * If data space is true, the mouse position will be returned in data space else it will be returned in pixel space.
   * When data space is true, the mouse position can also be returned in normal space.
   * Normal space is the mouse position in data space but scaled and offset to fit the chart.
   * @param evt - The mouse event.
   * @param dataSpace - Whether or not to return the mouse position in data space.
   * @param normal - Whether or not to return the mouse position in normal space.
   * @returns - The mouse position.
   */
  public getMousePos(evt: MouseEvent, dataSpace: boolean = false, normal: boolean = true): Point {
    const rect = this.canvas.getBoundingClientRect();
    const point: Point = [evt.clientX - rect.left, evt.clientY - rect.top];

    if (dataSpace) return remapPoint(this.getPixelBounds(), this.getDataBounds(normal), point);
    else return point;
  }

  /**
   * Sets the data for the chart. This will replace any existing data.
   * @param data - The data to set for the chart.
   */
  public setData(data: DataPoint[]): void {
    this.data = this.cleansingData(data).map((d) => new CandleStick(this.ctx, d));
    this.draw();
  }

  /**
   * Adds data to the chart. The data will be added to the end of the chart.
   * @param data - The data to add to the chart.
   */
  public addData(data: DataPoint[]): void {
    this.data.push(...this.cleansingData(data).map((d) => new CandleStick(this.ctx, d)));
    this.draw();
  }

  /**
   * Redraws the chart.
   */
  public redraw(): void {
    this.clearChart();
    this.draw();
  }

  /**
   * Resets the scale and offset of the chart.
   */
  public resetScale(): void {
    this.dataTrans.scale = 1;
    this.dataTrans.offset = [0, 0];

    this.redraw();
  }

  /**
   * Sets the number of candles to use for the moving average.
   * If the number is -1, the moving average will be disabled.
   * @param count - The number of candles to use for the moving average
   */
  public setMovingAverage(count: number): void {
    this.persistentData.movingAverage = count;
    this.redraw();
  }

  /**
   * Gets the number of candles used for the moving average.
   * @returns The number of candles used for the moving average.
   */
  public getMovingAverage(): number {
    return this.persistentData.movingAverage;
  }

  /**
   * Enables or disables the tooltip.
   * @param enabled - Whether or not to enable the tooltip.
   */
  public setTooltipEnabled(enabled: boolean): void {
    this.options.tooltipEnabled = enabled;
  }
}

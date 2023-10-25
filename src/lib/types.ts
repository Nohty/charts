export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer X)[]
    ? readonly DeepPartial<X>[]
    : DeepPartial<T[P]>;
};

export type Point = [number, number];

export type Bounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type DataPoint = {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type GraphicsTextOptions = {
  color: string;
  size: number;
  align: CanvasTextAlign;
  baseline: CanvasTextBaseline;
  fontFamily: string;
  fontWeight: string;
};

export type ChartOptions = {
  width: number;
  height: number;
  labels: [string, string];
  layout: ChartOptionsLayout;
};

export type ChartOptionsLayout = {
  textColor: string;
  backgroundColor: string;
  pointColor: string;
  lineColor: string;
  connectPoints: boolean;
  opacity: number;
};

export type CandleStickOptions = {
  width: number;
  radius: number;
};

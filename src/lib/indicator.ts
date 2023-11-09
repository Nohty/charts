import { CandleStick } from "./candlestick";
import { remap, remapPoint } from "./math";
export class Indicator {

    private data: CandleStick[] = [];

    constructor(private ctx: CanvasRenderingContext2D) {}

   



    

    public getData(data: CandleStick[]): void {
        this.data = data;
    }

}
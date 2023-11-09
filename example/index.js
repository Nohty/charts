import { Chart } from "charts";

const container = document.querySelector("#container");
const chart = new Chart(container, { layout: { textColor: "black", backgroundColor: "white" } });
const data = [
  { time: "2018-12-22", open: 75.16, high: 82.84, low: 36.16, close: 45.72 },
  { time: "2018-12-23", open: 45.12, high: 53.9, low: 45.12, close: 48.09 },
  { time: "2018-12-24", open: 60.71, high: 60.71, low: 53.39, close: 59.29 },
  { time: "2018-12-25", open: 68.26, high: 68.26, low: 59.04, close: 60.5 },
  { time: "2018-12-26", open: 67.71, high: 105.85, low: 66.67, close: 91.04 },
  { time: "2018-12-27", open: 91.04, high: 121.4, low: 82.7, close: 111.4 },
  { time: "2018-12-28", open: 111.51, high: 142.83, low: 103.34, close: 131.25 },
  { time: "2018-12-29", open: 131.33, high: 151.17, low: 77.68, close: 96.43 },
  { time: "2018-12-30", open: 106.33, high: 110.2, low: 90.39, close: 98.1 },
  { time: "2018-12-31", open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
];

chart.setData(data);

// drawing

let positions = [];

document.querySelector('canvas').addEventListener("click", (e) => {
  let position = chart.getMousePos(e);

  positions.push(position);
  if (positions.length === 3) positions = [position];

  if (positions.length === 2) {
    chart.paint.draw(positions[0], positions[1]);
  }
});

// remove drawings

function init() {
  document.querySelector('button').addEventListener('click', removeDraw);
}

function removeDraw() {
  let canvasBack = document.querySelector('canvas');
  canvasBack.width = chart.options.width;
  canvasBack.height = chart.options.height;
  canvasBack.ctx = chart.
  chart.paint.removeDrawings();
}

init();

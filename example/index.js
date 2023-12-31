import { Chart } from "charts";

async function main() {
  const container = document.querySelector("#container");

  let candlestickStartAmount = document.querySelector("#candlestick-amount-start").value;
  let candlestickAmount = document.querySelector("#candlestick-amount").value;

  const chart = new Chart(container, {
    layout: { textColor: "black", backgroundColor: "white" },
    dataRange: { start: parseInt(candlestickStartAmount), amount: parseInt(candlestickAmount) },
  });

  const url = "https://www.chartmill.com/chartmill-rest2/security/quotes/1496?ngsw-bypass";
  const data = await fetch(url).then((res) => res.json());

  const newData = data.map((d) => {
    return {
      time: `${d.date[0]}-${d.date[1]}-${d.date[2]}`,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    };
  });

  chart.setData(newData);

  // drawing

  let positions = [];
  let drawingsEnabled = false;

  document.querySelector("canvas").addEventListener("click", (e) => {
    if (drawingsEnabled) {
      let position = chart.getMousePos(e, true, false);

      positions.push(position);
      if (positions.length === 3) positions = [position];

      if (positions.length === 2) {
        chart.addLine(positions[0], positions[1]);
      }
    }
  });

  document.querySelector("#remove-drawings").addEventListener("click", () => {
    chart.removeLine(-1);
  });

  document.querySelector("#toggle-moving-average").addEventListener("click", () => {
    if (chart.getMovingAverage() === -1) {
      chart.setMovingAverage(3);
    } else {
      chart.setMovingAverage(-1);
    }
  });

  document.querySelector("#toggle-drawings").addEventListener("click", (e) => {
    const enabled = e.target.style.backgroundColor === "green";
    e.target.style.backgroundColor = !enabled ? "green" : "red";
    drawingsEnabled = !enabled;
  });

  document.querySelector("#center-scale").addEventListener("click", () => {
    chart.resetScale();
  });

  document.querySelector("#update").addEventListener("click", (e) => {
    e.preventDefault();
    let candlestickStartAmount = document.querySelector("#candlestick-amount-start").value;
    let candlestickAmount = document.querySelector("#candlestick-amount").value;

    chart.setDataRange(parseInt(candlestickStartAmount), parseInt(candlestickAmount));
  });
}

document.addEventListener("DOMContentLoaded", main);

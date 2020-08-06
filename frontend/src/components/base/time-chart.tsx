import type { ChartData, ChartOptions } from "chart.js";
import * as React from "react";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { chartColors, transparentChartColors } from "../../config";

const options = {
  scales: {
    xAxes: [
      {
        time: {
          unit: "day",
        },
        type: "time",
      },
    ],
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
          stepSize: 10,
        },
      },
    ],
  },
} as ChartOptions;

interface IValue {
  x: Date;
  y: number;
}

interface ITimeChartProps {
  title: string;
  values: readonly IValue[];
}

/**
 * A time-based line chart.
 */
export const TimeChart = ({ title, values }: ITimeChartProps) => {
  const data = useMemo(() => {
    return {
      datasets: [
        {
          backgroundColor: transparentChartColors[0],
          borderColor: chartColors[0],
          data: values as IValue[],
          label: title,
        },
      ],
    } as ChartData;
  }, [title, values]);

  return <Line data={data} height={300} options={options} />;
};

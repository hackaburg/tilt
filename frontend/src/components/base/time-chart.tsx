import type { ChartData, ChartOptions } from "chart.js";
import * as React from "react";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { chartColors, transparentChartColors } from "../../config";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
  scales: {
    x: {
      type: "time",
      time: {
        unit: "month",
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 10,
      },
    },
  },
} as ChartOptions<"line">;

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
  const data = useMemo((): ChartData<"line"> => {
    return {
      datasets: [
        {
          backgroundColor: transparentChartColors[1],
          borderColor: chartColors[0],
          data: values.map(({ x, y }) => ({ x: x.valueOf(), y })),
          label: title,
        },
      ],
    };
  }, [title, values]);

  return <Line data={data} height={100} options={options} />;
};

import type { ChartData } from "chart.js";
import * as React from "react";
import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { chartColors } from "../../config";
import { repeatAndTake } from "../../util";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ICounts {
  [key: string]: number;
}

interface ICircleChartProps {
  counts: ICounts;
}

/**
 * A pie chart.
 */
export const CircleChart = ({ counts }: ICircleChartProps) => {
  const chartData = useMemo((): ChartData<"doughnut"> => {
    const entries = [...Object.entries(counts)];
    const labels = entries.map(([label]) => label);
    const data = entries.map(([_, value]) => value);
    const backgroundColor = repeatAndTake(chartColors, data.length) as string[];

    return {
      datasets: [
        {
          backgroundColor,
          data,
        },
      ],
      labels,
    };
  }, [counts]);

  return <Doughnut data={chartData} height={200} />;
};

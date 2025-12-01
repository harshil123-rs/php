"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

interface LineChartProps {
  labels: string[];
  data: number[];
}

export function LineChart({ labels, data }: LineChartProps) {
  return (
    <div className="glass-card p-4 md:p-5">
      <Line
        data={{
          labels,
          datasets: [
            {
              label: "Health Activity Score",
              data,
              borderColor: "#22c55e",
              backgroundColor: "rgba(34,197,94,0.15)",
              tension: 0.4,
              fill: true,
              pointRadius: 0
            }
          ]
        }}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              intersect: false,
              mode: "index"
            }
          },
          scales: {
            x: {
              ticks: { color: "#6b7280", font: { size: 11 } },
              grid: { display: false }
            },
            y: {
              ticks: { color: "#6b7280", font: { size: 11 } },
              grid: { color: "rgba(31,41,55,0.6)" }
            }
          }
        }}
      />
    </div>
  );
}



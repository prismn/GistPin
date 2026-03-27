'use client';

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LineController,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, LineController);

export default function Sparkline({ data }: { data: number[] }) {
  const trendUp = data[data.length - 1] > data[0];

  return (
    <div style={{ width: 50, height: 20 }}>
      <Line
        data={{
          labels: data.map((_, i) => i),
          datasets: [
            {
              data,
              borderColor: trendUp ? 'green' : 'red',
              tension: 0.4,
              pointRadius: 0,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { x: { display: false }, y: { display: false } },
        }}
      />
    </div>
  );
}
'use client';

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import ExportButton from '@/components/ui/ExportButton';
import { exportRowsToCsv } from '@/lib/export';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Tooltip, Legend);

export default function RadarChart() {
  const labels = [
    'Mobile',
    'Desktop',
    'API',
    'Web',
    'New Users',
    'Power Users',
  ];

  const data = {
    labels,
    datasets: [
      {
        label: 'This Month',
        data: [80, 60, 70, 90, 50, 40],
        backgroundColor: 'rgba(54,162,235,0.3)',
        borderColor: 'blue',
      },
      {
        label: 'Last Month',
        data: [60, 50, 60, 70, 40, 30],
        backgroundColor: 'rgba(255,99,132,0.3)',
        borderColor: 'red',
      },
    ],
  };

  return (
    <div>
      <ExportButton
        onExport={(onProgress) =>
          exportRowsToCsv({
            filenamePrefix: 'radar-chart',
            filters: {
              comparison: 'This Month vs Last Month',
            },
            rows: labels.map((label, index) => ({
              metric: label,
              this_month: data.datasets[0].data[index],
              last_month: data.datasets[1].data[index],
            })),
            onProgress,
          })
        }
      />
      <Radar data={data} />
    </div>
  );
}

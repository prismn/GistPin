'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ExportButton from '@/components/ui/ExportButton';
import { exportRowsToCsv } from '@/lib/export';

ChartJS.register(ArcElement, Tooltip, Legend);

const categories = [
  { label: 'Events',  count: 312, color: 'rgba(99,  102, 241, 0.85)', border: 'rgba(99,  102, 241, 1)' },
  { label: 'Food',    count: 278, color: 'rgba(251, 146,  60, 0.85)', border: 'rgba(251, 146,  60, 1)' },
  { label: 'Safety',  count: 195, color: 'rgba(239,  68,  68, 0.85)', border: 'rgba(239,  68,  68, 1)' },
  { label: 'Tips',    count: 241, color: 'rgba(34,  197,  94, 0.85)', border: 'rgba(34,  197,  94, 1)' },
  { label: 'News',    count: 183, color: 'rgba(59,  130, 246, 0.85)', border: 'rgba(59,  130, 246, 1)' },
  { label: 'Transit', count: 157, color: 'rgba(168,  85, 247, 0.85)', border: 'rgba(168,  85, 247, 1)' },
  { label: 'Markets', count: 134, color: 'rgba(234, 179,   8, 0.85)', border: 'rgba(234, 179,   8, 1)' },
  { label: 'Other',   count:  98, color: 'rgba(156, 163, 175, 0.85)', border: 'rgba(156, 163, 175, 1)' },
];

const total = categories.reduce((sum, c) => sum + c.count, 0);

const data = {
  labels: categories.map((c) => c.label),
  datasets: [
    {
      data: categories.map((c) => c.count),
      backgroundColor: categories.map((c) => c.color),
      borderColor: categories.map((c) => c.border),
      borderWidth: 2,
      hoverOffset: 16,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyleWidth: 10,
        generateLabels: (chart: ChartJS) => {
          const dataset = chart.data.datasets[0];
          return (chart.data.labels as string[]).map((label, i) => {
            const value = (dataset.data[i] as number);
            const pct = ((value / total) * 100).toFixed(1);
            return {
              text: `${label} (${pct}%)`,
              fillStyle: (dataset.backgroundColor as string[])[i],
              strokeStyle: (dataset.borderColor as string[])[i],
              hidden: !chart.getDataVisibility(i),
              index: i,
              datasetIndex: 0,
              lineWidth: 2,
              pointStyle: 'circle' as const,
            };
          });
        },
      },
      onClick: (
        e: unknown,
        legendItem: { index?: number },
        legend: { chart: ChartJS },
      ) => {
        const index = legendItem.index ?? 0;
        const chart = legend.chart;
        chart.toggleDataVisibility(index);
        chart.update();
      },
    },
    tooltip: {
      callbacks: {
        label: (item: TooltipItem<'pie'>) => {
          const value = item.raw as number;
          const pct = ((value / total) * 100).toFixed(1);
          return `  ${item.label}: ${value} gists (${pct}%)`;
        },
      },
    },
  },
};

export default function CategoryPieChart() {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <ExportButton
        onExport={(onProgress) =>
          exportRowsToCsv({
            filenamePrefix: 'category-distribution',
            filters: {
              dataset: 'All categories',
            },
            rows: categories.map((category) => ({
              category: category.label,
              count: category.count,
              percentage: ((category.count / total) * 100).toFixed(1),
            })),
            onProgress,
          })
        }
      />
      <Pie data={data} options={options} />
    </div>
  );
}

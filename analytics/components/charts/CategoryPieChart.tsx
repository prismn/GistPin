'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useCategoryDataQuery } from '@/lib/analytics-queries';
import ExportButton from '@/components/ui/ExportButton';
import { exportRowsToCsv } from '@/lib/export';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryPieChart() {
  const { data: categories, isLoading, error } = useCategoryDataQuery();

  if (isLoading || !categories) {
    return <p>Loading category distribution...</p>;
  }

  if (error) {
    return <p>Unable to load category distribution.</p>;
  }

  const total = categories.reduce((sum, category) => sum + category.count, 0);
  const data = {
    labels: categories.map((category) => category.label),
    datasets: [
      {
        data: categories.map((category) => category.count),
        backgroundColor: categories.map((category) => category.color),
        borderColor: categories.map((category) => category.border),
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
            return (chart.data.labels as string[]).map((label, index) => {
              const value = dataset.data[index] as number;
              const pct = ((value / total) * 100).toFixed(1);
              return {
                text: `${label} (${pct}%)`,
                fillStyle: (dataset.backgroundColor as string[])[index],
                strokeStyle: (dataset.borderColor as string[])[index],
                hidden: !chart.getDataVisibility(index),
                index,
                datasetIndex: 0,
                lineWidth: 2,
                pointStyle: 'circle' as const,
              };
            });
          },
        },
        onClick: (
          _event: unknown,
          legendItem: { index?: number },
          legend: { chart: ChartJS },
        ) => {
          const index = legendItem.index ?? 0;
          const chart = legend.chart;
          chart.toggleDataVisibility(index);
          chart.update();
        },
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

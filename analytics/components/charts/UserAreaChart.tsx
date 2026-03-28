'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import type { Plugin, TooltipItem } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useRef, useMemo } from 'react';
import ExportButton from '@/components/ui/ExportButton';
import { exportRowsToCsv } from '@/lib/export';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ── Data generation ──────────────────────────────────────────────────────────

function generateDays(count: number): { labels: string[]; newUsers: number[]; returning: number[] } {
  const labels: string[] = [];
  const newUsers: number[] = [];
  const returning: number[] = [];

  const base = Date.now() - (count - 1) * 86_400_000;

  for (let i = 0; i < count; i++) {
    const d = new Date(base + i * 86_400_000);
    labels.push(
      d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    );

    // Returning users: stable base with gentle upward trend + weekend dips
    const weekday = d.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const trendRet = 120 + i * 0.8;
    const noiseRet = (Math.random() - 0.5) * 30;
    returning.push(Math.round(Math.max(0, trendRet + noiseRet - (isWeekend ? 25 : 0))));

    // New users: more volatile, mid-period spike, grows toward the end
    const spike = i > 38 && i < 52 ? 40 : 0;
    const trendNew = 60 + i * 0.4 + spike;
    const noiseNew = (Math.random() - 0.5) * 25;
    newUsers.push(Math.round(Math.max(0, trendNew + noiseNew)));
  }

  return { labels, newUsers, returning };
}

// ── Gradient plugin ──────────────────────────────────────────────────────────

const gradientPlugin: Plugin<'line'> = {
  id: 'areaGradient',
  afterLayout(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    const { top, bottom } = chartArea;

    const greenGrad = ctx.createLinearGradient(0, top, 0, bottom);
    greenGrad.addColorStop(0, 'rgba(34,197,94,0.55)');
    greenGrad.addColorStop(1, 'rgba(34,197,94,0.02)');

    const blueGrad = ctx.createLinearGradient(0, top, 0, bottom);
    blueGrad.addColorStop(0, 'rgba(59,130,246,0.55)');
    blueGrad.addColorStop(1, 'rgba(59,130,246,0.02)');

    chart.data.datasets[0].backgroundColor = blueGrad;
    chart.data.datasets[1].backgroundColor = greenGrad;
  },
};

// ── Tick reducer: show one label every ~15 days ──────────────────────────────

function sparseLabels(labels: string[]): (string | null)[] {
  return labels.map((l, i) => (i % 15 === 0 || i === labels.length - 1 ? l : null));
}

// ── Component ────────────────────────────────────────────────────────────────

export default function UserAreaChart() {
  const chartRef = useRef<ChartJS<'line'>>(null);

  const { labels, newUsers, returning } = useMemo(() => generateDays(90), []);

  const displayLabels = useMemo(() => sparseLabels(labels), [labels]);

  const data = {
    labels: displayLabels,
    datasets: [
      {
        label: 'Returning users',
        data: returning,
        borderColor: 'rgba(59,130,246,0.9)',
        borderWidth: 2,
        backgroundColor: 'rgba(59,130,246,0.4)', // overwritten by plugin
        fill: true,
        tension: 0.42,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(59,130,246,1)',
        order: 2,
      },
      {
        label: 'New users',
        data: newUsers,
        borderColor: 'rgba(34,197,94,0.9)',
        borderWidth: 2,
        backgroundColor: 'rgba(34,197,94,0.4)', // overwritten by plugin
        fill: true,
        tension: 0.42,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(34,197,94,1)',
        order: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          color: '#9ca3af',
          font: { size: 11 },
        },
        border: { color: '#e5e7eb' },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          callback: (v: number | string) => Number(v).toLocaleString(),
        },
        border: { display: false },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          pointStyleWidth: 10,
          padding: 20,
          color: '#374151',
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17,24,39,0.88)',
        titleColor: '#f9fafb',
        bodyColor: '#d1fae5',
        padding: 12,
        callbacks: {
          title: (items: TooltipItem<'line'>[]) => labels[items[0].dataIndex],
          label: (item: TooltipItem<'line'>) => {
            const val = item.raw as number;
            return `  ${item.dataset.label}: ${val.toLocaleString()}`;
          },
          footer: (items: TooltipItem<'line'>[]) => {
            const total = items.reduce((sum, item) => sum + (item.raw as number), 0);
            return `  Total: ${total.toLocaleString()}`;
          },
        },
      },
    },
  };

  return (
    <div style={{ position: 'relative' }}>
      <ExportButton
        onExport={(onProgress) =>
          exportRowsToCsv({
            filenamePrefix: 'users-area-chart',
            filters: {
              window: 'Last 90 days',
            },
            rows: labels.map((label, index) => ({
              date: label,
              returning_users: returning[index],
              new_users: newUsers[index],
              total_users: returning[index] + newUsers[index],
            })),
            onProgress,
          })
        }
      />
      <Line ref={chartRef} data={data} options={options} plugins={[gradientPlugin]} />
    </div>
  );
}

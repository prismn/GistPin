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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ── Data generation ───────────────────────────────────────────────────────────

interface DayPoint {
  label: string;      // "12 Mar"
  fullLabel: string;  // "Wed, 12 Mar" — used in tooltip title
  count: number;
}

function generateLast30Days(): DayPoint[] {
  const points: DayPoint[] = [];
  const now = Date.now();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000);

    // Gentle upward trend + weekend dips + noise, clamped to 50–200
    const trend = 100 + (29 - i) * 1.5;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const noise = (Math.random() - 0.5) * 50;
    const count = Math.round(Math.min(200, Math.max(50, trend + noise - (isWeekend ? 20 : 0))));

    points.push({
      label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      fullLabel: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
      count,
    });
  }

  return points;
}

// ── Gradient fill plugin ──────────────────────────────────────────────────────

const gradientPlugin: Plugin<'line'> = {
  id: 'dailyGistsGradient',
  afterLayout(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    const grad = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    grad.addColorStop(0, 'rgba(99,102,241,0.45)');
    grad.addColorStop(1, 'rgba(99,102,241,0.02)');

    chart.data.datasets[0].backgroundColor = grad;
  },
};

// ── Tick sparsifier: show a label every 5 days + the last day ────────────────

function sparseLabels(labels: string[]): (string | null)[] {
  return labels.map((l, i) => (i % 5 === 0 || i === labels.length - 1 ? l : null));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DailyGistsChart() {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const points = useMemo(() => generateLast30Days(), []);

  const rawLabels  = points.map((p) => p.label);
  const fullLabels = points.map((p) => p.fullLabel);
  const counts     = points.map((p) => p.count);

  const data = {
    labels: sparseLabels(rawLabels),
    datasets: [
      {
        label: 'Gists created',
        data: counts,
        borderColor: 'rgba(99,102,241,0.9)',
        borderWidth: 2.5,
        backgroundColor: 'rgba(99,102,241,0.35)', // overwritten by plugin
        fill: true,
        tension: 0.42,          // smooth bezier curves
        pointRadius: 0,          // hidden by default
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#6366f1',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          color: '#9ca3af',
          font: { size: 11 },
        },
        border: { color: '#e5e7eb' },
      },
      y: {
        beginAtZero: false,
        suggestedMin: 30,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          stepSize: 50,
        },
        border: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17,24,39,0.9)',
        titleColor: '#f9fafb',
        bodyColor: '#c7d2fe',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (items: TooltipItem<'line'>[]) => fullLabels[items[0].dataIndex],
          label: (item: TooltipItem<'line'>) => `  ${(item.raw as number).toLocaleString()} gists`,
        },
      },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Line ref={chartRef} data={data} options={options} plugins={[gradientPlugin]} />
    </div>
  );
}

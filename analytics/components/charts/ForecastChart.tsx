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
import type { TooltipItem } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useMemo, useState } from 'react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface DayPoint {
  label: string;
  count: number;
}

function generateHistorical(): DayPoint[] {
  const points: DayPoint[] = [];
  const now = Date.now();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000);
    const trend = 100 + (29 - i) * 1.5;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const count = Math.round(Math.min(200, Math.max(50, trend + (Math.random() - 0.5) * 40 - (isWeekend ? 20 : 0))));
    points.push({ label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), count });
  }
  return points;
}

function linearRegression(values: number[]): { slope: number; intercept: number; r2: number } {
  const n = values.length;
  const xs = values.map((_, i) => i);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  const slope = xs.reduce((acc, x, i) => acc + (x - meanX) * (values[i] - meanY), 0) /
    xs.reduce((acc, x) => acc + (x - meanX) ** 2, 0);
  const intercept = meanY - slope * meanX;
  const ssTot = values.reduce((acc, y) => acc + (y - meanY) ** 2, 0);
  const ssRes = values.reduce((acc, y, i) => acc + (y - (slope * i + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { slope, intercept, r2 };
}

export default function ForecastChart() {
  const [showForecast, setShowForecast] = useState(true);
  const historical = useMemo(() => generateHistorical(), []);
  const counts = historical.map((p) => p.count);
  const { slope, intercept, r2 } = useMemo(() => linearRegression(counts), [counts]);

  const forecastValues = Array.from({ length: 7 }, (_, i) => {
    const x = counts.length + i;
    return Math.round(slope * x + intercept);
  });

  const now = Date.now();
  const forecastLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now + (i + 1) * 86_400_000);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  });

  const allLabels = [...historical.map((p) => p.label), ...forecastLabels];
  const histPad = [...counts, ...Array(7).fill(null)];
  const forecastPad = showForecast
    ? [...Array(counts.length - 1).fill(null), counts[counts.length - 1], ...forecastValues]
    : [];
  const upperBound = showForecast
    ? [...Array(counts.length - 1).fill(null), counts[counts.length - 1], ...forecastValues.map((v) => Math.round(v * 1.2))]
    : [];
  const lowerBound = showForecast
    ? [...Array(counts.length - 1).fill(null), counts[counts.length - 1], ...forecastValues.map((v) => Math.round(v * 0.8))]
    : [];

  const data = {
    labels: allLabels,
    datasets: [
      {
        label: 'Historical',
        data: histPad,
        borderColor: 'rgba(99,102,241,0.9)',
        borderWidth: 2.5,
        backgroundColor: 'rgba(99,102,241,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        spanGaps: false,
      },
      ...(showForecast
        ? [
            {
              label: 'Upper bound',
              data: upperBound,
              borderColor: 'transparent',
              backgroundColor: 'rgba(99,102,241,0.12)',
              fill: '+1',
              tension: 0.4,
              pointRadius: 0,
              borderWidth: 0,
              spanGaps: false,
            },
            {
              label: 'Forecast',
              data: forecastPad,
              borderColor: 'rgba(251,146,60,0.9)',
              borderWidth: 2,
              borderDash: [6, 4],
              backgroundColor: 'transparent',
              fill: false,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 5,
              spanGaps: false,
            },
            {
              label: 'Lower bound',
              data: lowerBound,
              borderColor: 'transparent',
              backgroundColor: 'rgba(99,102,241,0.12)',
              fill: '-2',
              tension: 0.4,
              pointRadius: 0,
              borderWidth: 0,
              spanGaps: false,
            },
          ]
        : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: { mode: 'index' as const, intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          color: '#9ca3af',
          font: { size: 11 },
          callback: (_: unknown, i: number) => (i % 5 === 0 || i === allLabels.length - 1 ? allLabels[i] : null),
        },
        border: { color: '#e5e7eb' },
      },
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#9ca3af', font: { size: 11 } },
        border: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17,24,39,0.9)',
        titleColor: '#f9fafb',
        bodyColor: '#c7d2fe',
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        filter: (item: TooltipItem<'line'>) => item.dataset.label !== 'Upper bound' && item.dataset.label !== 'Lower bound',
      },
    },
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          R² score: <strong style={{ color: '#6366f1' }}>{r2.toFixed(3)}</strong>
          <span style={{ marginLeft: 16 }}>Confidence interval: ±20%</span>
        </div>
        <button
          onClick={() => setShowForecast((v) => !v)}
          style={{
            fontSize: 12,
            padding: '4px 12px',
            borderRadius: 6,
            border: '1px solid #6366f1',
            background: showForecast ? '#6366f1' : 'transparent',
            color: showForecast ? '#fff' : '#6366f1',
            cursor: 'pointer',
          }}
        >
          {showForecast ? 'Hide Forecast' : 'Show Forecast'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 10, fontSize: 12, color: '#6b7280' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 20, height: 2, background: 'rgba(99,102,241,0.9)', display: 'inline-block' }} />
          Historical
        </span>
        {showForecast && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 20, height: 2, background: 'rgba(251,146,60,0.9)', display: 'inline-block', borderTop: '2px dashed rgba(251,146,60,0.9)' }} />
            7-day forecast
          </span>
        )}
      </div>
      <Line data={data} options={options} />
    </div>
  );
}

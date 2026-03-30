'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { exportRowsToCsv } from '@/lib/export';
import ExportButton from '@/components/ui/ExportButton';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

const endpoints = [
  { name: 'GET /health',       requests: 50123, avgMs: 12,  errorRate: 0.01 },
  { name: 'GET /gists',        requests: 10234, avgMs: 145, errorRate: 0.42 },
  { name: 'POST /gists',       requests: 3421,  avgMs: 210, errorRate: 0.85 },
  { name: 'GET /gists/:id',    requests: 8901,  avgMs: 98,  errorRate: 0.21 },
  { name: 'DELETE /gists/:id', requests: 512,   avgMs: 180, errorRate: 1.10 },
  { name: 'GET /users/me',     requests: 7234,  avgMs: 55,  errorRate: 0.15 },
  { name: 'POST /auth/login',  requests: 4102,  avgMs: 320, errorRate: 2.30 },
  { name: 'GET /locations',    requests: 6789,  avgMs: 88,  errorRate: 0.33 },
  { name: 'POST /tips',        requests: 1023,  avgMs: 195, errorRate: 0.60 },
  { name: 'GET /feed',         requests: 9345,  avgMs: 167, errorRate: 0.48 },
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const errorRateOverTime = [0.8, 1.1, 0.9, 2.3, 1.4, 0.7, 0.5];

const statusCodes = { '2xx': 94210, '4xx': 3120, '5xx': 870, '3xx': 450 };

export default function ApiAnalyticsPage() {
  const barData = {
    labels: endpoints.map((e) => e.name),
    datasets: [{
      label: 'Requests',
      data: endpoints.map((e) => e.requests),
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const lineData = {
    labels: days,
    datasets: [{
      label: 'Error Rate (%)',
      data: errorRateOverTime,
      borderColor: 'rgba(239, 68, 68, 1)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.3,
      fill: true,
    }],
  };

  const pieData = {
    labels: Object.keys(statusCodes),
    datasets: [{
      data: Object.values(statusCodes),
      backgroundColor: ['rgba(34,197,94,0.8)', 'rgba(251,191,36,0.8)', 'rgba(239,68,68,0.8)', 'rgba(99,102,241,0.8)'],
      borderWidth: 2,
    }],
  };

  const highErrorEndpoints = endpoints.filter((e) => e.errorRate > 1);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">API Usage Analytics</h1>
        <ExportButton
          onExport={(onProgress) =>
            exportRowsToCsv({
              filenamePrefix: 'api-analytics',
              rows: endpoints.map((e) => ({
                endpoint: e.name,
                requests: e.requests,
                avg_response_ms: e.avgMs,
                error_rate_pct: e.errorRate,
              })),
              onProgress,
            })
          }
        />
      </div>

      {highErrorEndpoints.length > 0 && (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800 p-4">
          <p className="font-semibold text-red-700 dark:text-red-400 mb-1">⚠ High Error Rate Detected</p>
          {highErrorEndpoints.map((e) => (
            <p key={e.name} className="text-sm text-red-600 dark:text-red-300">
              {e.name} — {e.errorRate}% error rate
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Requests', value: endpoints.reduce((s, e) => s + e.requests, 0).toLocaleString() },
          { label: 'Avg Response Time', value: `${Math.round(endpoints.reduce((s, e) => s + e.avgMs, 0) / endpoints.length)} ms` },
          { label: 'Overall Error Rate', value: `${(endpoints.reduce((s, e) => s + e.errorRate, 0) / endpoints.length).toFixed(2)}%` },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border bg-white dark:bg-gray-900 p-4 shadow-sm">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className="text-2xl font-bold mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-white dark:bg-gray-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Top 10 Endpoints by Request Count</h2>
        <Bar data={barData} options={{ indexAxis: 'y', responsive: true, plugins: { legend: { display: false } } }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Error Rate Over Time (%)</h2>
          <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="rounded-lg border bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Status Code Distribution</h2>
          <div style={{ maxWidth: 320, margin: '0 auto' }}>
            <Pie data={pieData} options={{ responsive: true }} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white dark:bg-gray-900 p-6 shadow-sm overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Endpoint Details</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 pr-4">Endpoint</th>
              <th className="pb-2 pr-4 text-right">Requests</th>
              <th className="pb-2 pr-4 text-right">Avg Response (ms)</th>
              <th className="pb-2 text-right">Error Rate (%)</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((e) => (
              <tr key={e.name} className="border-b last:border-0">
                <td className="py-2 pr-4 font-mono">{e.name}</td>
                <td className="py-2 pr-4 text-right">{e.requests.toLocaleString()}</td>
                <td className="py-2 pr-4 text-right">{e.avgMs}</td>
                <td className={`py-2 text-right font-medium ${e.errorRate > 1 ? 'text-red-500' : 'text-green-600'}`}>
                  {e.errorRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import KPIGrid from '@/components/KPICard';
import LiveGistCounter from '@/components/LiveGistCounter';
import ChartSkeleton from '@/components/ui/ChartSkeleton';
import ChartErrorBoundary from '@/components/ui/ChartErrorBoundary';
import { AnomalyBadge, AnomalySidebar } from '@/components/ui/AnomalyAlerts';
import { DataQualityBadge } from '@/components/ui/DataQualityBadge';
import AnnotatedChart from '@/components/ui/AnnotatedChart';
import { detectAnomalies } from '@/lib/anomaly';
import { createUserActivityData } from '@/lib/analytics-data';

const LazyDailyGistsChart = dynamic(() => import('@/components/charts/DailyGistsChart'), {
  loading: () => <ChartSkeleton />,
});
const LazyUserAreaChart = dynamic(() => import('@/components/charts/UserAreaChart'), {
  loading: () => <ChartSkeleton />,
});
const LazyScatterChart = dynamic(() => import('@/components/charts/ScatterChart'), {
  loading: () => <ChartSkeleton />,
});
const LazyRadarChart = dynamic(() => import('@/components/charts/RadarChart'), {
  loading: () => <ChartSkeleton />,
});
const LazyCategoryPieChart = dynamic(() => import('@/components/charts/CategoryPieChart'), {
  loading: () => <ChartSkeleton />,
});
const LazyLocationTable = dynamic(() => import('@/components/ui/LocationTable'), {
  loading: () => <ChartSkeleton />,
});

export default function Page() {
  // Compute anomalies from user activity data
  const activityData = useMemo(() => createUserActivityData(90), []);
  const anomalies = useMemo(
    () => [
      ...detectAnomalies('New Users', activityData.labels, activityData.newUsers),
      ...detectAnomalies('Returning Users', activityData.labels, activityData.returning),
    ],
    [activityData],
  );

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <KPIGrid />

      {/* Live counter + User area chart */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:col-span-1">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Live Gists
          </h2>
          <LiveGistCounter />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              New vs Returning Users · 90 days
            </h2>
            <AnomalyBadge anomalies={anomalies} chartId="New Users" />
            <AnomalyBadge anomalies={anomalies} chartId="Returning Users" />
            <DataQualityBadge labels={activityData.labels} values={activityData.newUsers} metricName="New Users" />
          </div>
          <AnnotatedChart chartId="user-area" labels={activityData.labels}>
            <ChartErrorBoundary title="New vs Returning Users">
              <LazyUserAreaChart />
            </ChartErrorBoundary>
          </AnnotatedChart>
        </div>
      </div>

      {/* Daily gists */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Daily Gists · Last 30 Days
        </h2>
        <ChartErrorBoundary title="Daily Gists">
          <LazyDailyGistsChart />
        </ChartErrorBoundary>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Gist Age vs Engagement
          </h2>
          <ChartErrorBoundary title="Scatter">
            <LazyScatterChart />
          </ChartErrorBoundary>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Platform Usage
          </h2>
          <ChartErrorBoundary title="Radar">
            <LazyRadarChart />
          </ChartErrorBoundary>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Category Distribution
          </h2>
          <ChartErrorBoundary title="Category Distribution">
            <LazyCategoryPieChart />
          </ChartErrorBoundary>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Active Locations
          </h2>
          <ChartErrorBoundary title="Locations">
            <LazyLocationTable />
          </ChartErrorBoundary>
        </div>
      </div>

      {/* Anomaly sidebar (floating trigger) */}
      <AnomalySidebar anomalies={anomalies} />
    </div>
  );
}

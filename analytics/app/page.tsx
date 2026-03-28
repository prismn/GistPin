import dynamic from 'next/dynamic';
import ChartErrorBoundary from '@/components/ui/ChartErrorBoundary';
import ChartSkeleton from '@/components/ui/ChartSkeleton';
import LiveGistCounter from '@/components/LiveGistCounter';

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
  return (
    <main
      style={{
        maxWidth: 1120,
        margin: '0 auto',
        padding: '40px 24px 64px',
      }}
    >
      <section
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #dbeafe 100%)',
          borderRadius: 26,
          padding: '28px 30px',
          boxShadow: '0 18px 46px rgba(15,23,42,0.08)',
          marginBottom: 28,
        }}
      >
        <h1 style={{ margin: '0 0 10px', fontSize: 38, lineHeight: 1.05 }}>
          Analytics Dashboard
        </h1>
        <p style={{ margin: 0, color: '#475569', fontSize: 16, maxWidth: 720 }}>
          Chart widgets now load lazily with skeleton placeholders and per-widget error
          boundaries to keep the initial dashboard load lighter and more resilient.
        </p>
      </section>
import UserAreaChart from '@/components/charts/UserAreaChart';
import KPIGrid from '@/components/KPICard';
import DailyGistsChart from '@/components/charts/DailyGistsChart';

export default function Page() {
  return (
    <div className="space-y-6">

      <h2>Overview</h2>
      <KPIGrid />

      <h2>Daily Gists (Last 30 Days)</h2>
      <DailyGistsChart />

      <h2>Live Gists</h2>
      <LiveGistCounter />
      {/* KPI row — live counter spans full width on mobile, 1/3 on lg */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:col-span-1">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Live Gists
          </h2>
          <LiveGistCounter />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            New vs Returning Users · 90 days
          </h2>
          <UserAreaChart />
        </div>
      </div>

      <h2>New vs Returning Users (90 days)</h2>
      <ChartErrorBoundary title="New vs Returning Users (90 days)">
        <LazyUserAreaChart />
      </ChartErrorBoundary>

      <h2>Scatter</h2>
      <ChartErrorBoundary title="Scatter">
        <LazyScatterChart />
      </ChartErrorBoundary>

      <h2>Radar</h2>
      <ChartErrorBoundary title="Radar">
        <LazyRadarChart />
      </ChartErrorBoundary>

      <h2>Category Distribution</h2>
      <ChartErrorBoundary title="Category Distribution">
        <LazyCategoryPieChart />
      </ChartErrorBoundary>

      <h2>Locations</h2>
      <ChartErrorBoundary title="Locations">
        <LazyLocationTable />
      </ChartErrorBoundary>
    </main>
      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Gist Age vs Engagement
          </h2>
          <ScatterChart />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Platform Usage
          </h2>
          <RadarChart />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Category Distribution
          </h2>
          <CategoryPieChart />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Active Locations
          </h2>
          <LocationTable />
        </div>
      </div>

    </div>
  );
}

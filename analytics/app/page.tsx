'use client';

import ScatterChart from '@/components/charts/ScatterChart';
import RadarChart from '@/components/charts/RadarChart';
import CategoryPieChart from '@/components/charts/CategoryPieChart';
import LocationTable from '@/components/ui/LocationTable';
import LiveGistCounter from '@/components/LiveGistCounter';
import UserAreaChart from '@/components/charts/UserAreaChart';
import PdfReportButton from '@/components/ui/PdfReportButton';
import { getDashboardDateRange } from '@/lib/report';

export default function Page() {
  const dateRange = getDashboardDateRange(90);

  const sections = [
    { title: 'Live Gists', content: <LiveGistCounter /> },
    { title: 'New vs Returning Users (90 days)', content: <UserAreaChart /> },
    { title: 'Scatter', content: <ScatterChart /> },
    { title: 'Radar', content: <RadarChart /> },
    { title: 'Category Distribution', content: <CategoryPieChart /> },
    { title: 'Locations', content: <LocationTable /> },
  ];

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '40px 24px 64px',
      }}
    >
      <section
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 24,
          background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
          borderRadius: 28,
          padding: '32px 32px 28px',
          boxShadow: '0 18px 48px rgba(30,41,59,0.10)',
          marginBottom: 28,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              padding: '6px 12px',
              background: '#312e81',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            GistPin Analytics
          </div>

          <h1
            style={{
              margin: '0 0 8px',
              fontSize: 40,
              lineHeight: 1.05,
            }}
          >
            Analytics Dashboard
          </h1>

          <p
            style={{
              margin: '0 0 12px',
              color: '#475569',
              fontSize: 16,
              maxWidth: 640,
            }}
          >
            Generate a polished PDF snapshot of the current dashboard for offline sharing,
            stakeholder updates, and quick reporting.
          </p>

          <div
            style={{
              color: '#312e81',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Date range: {dateRange}
          </div>
        </div>

        <PdfReportButton dateRange={dateRange} />
      </section>

      <div style={{ display: 'grid', gap: 24 }}>
        {sections.map((section) => (
          <section
            key={section.title}
            data-report-section="true"
            data-report-title={section.title}
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '24px 24px 28px',
              boxShadow: '0 16px 40px rgba(15,23,42,0.08)',
              border: '1px solid rgba(148,163,184,0.15)',
            }}
          >
            <h2
              style={{
                margin: '0 0 18px',
                fontSize: 24,
              }}
            >
              {section.title}
            </h2>
            {section.content}
          </section>
        ))}
      </div>
    </main>
import KPIGrid from '@/components/KPICard';
import DailyGistsChart from '@/components/charts/DailyGistsChart';

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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 24,
          background: 'linear-gradient(135deg, #ffffff 0%, #dcfce7 100%)',
          borderRadius: 26,
          padding: '28px 30px',
          boxShadow: '0 18px 46px rgba(15,23,42,0.08)',
          marginBottom: 28,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              padding: '6px 12px',
              background: '#14532d',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            Excel Export
          </div>

          <h1 style={{ margin: '0 0 8px', fontSize: 38, lineHeight: 1.05 }}>
            Analytics Dashboard
          </h1>

          <p style={{ margin: 0, color: '#475569', fontSize: 16, maxWidth: 680 }}>
            Export current analytics into an Excel workbook with dedicated sheets for overview,
            users, locations, and engagement metrics.
          </p>
        </div>

        <ExcelExportButton />
      </section>
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

      <h2>Locations</h2>
      <LocationTable />
    </main>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import ScatterChart from '@/components/charts/ScatterChart';
import RadarChart from '@/components/charts/RadarChart';
import CategoryPieChart from '@/components/charts/CategoryPieChart';
import LocationTable from '@/components/ui/LocationTable';
import LiveGistCounter from '@/components/LiveGistCounter';
import UserAreaChart from '@/components/charts/UserAreaChart';

const AUTO_REFRESH_MS = 300_000;

function formatTimestamp(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function DashboardRefreshShell() {
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const lastUpdatedLabel = useMemo(() => formatTimestamp(lastUpdated), [lastUpdated]);

  const refreshData = async () => {
    setIsRefreshing(true);

    await new Promise((resolve) => window.setTimeout(resolve, 900));

    const now = new Date();
    setRefreshVersion((current) => current + 1);
    setLastUpdated(now);
    setIsRefreshing(false);
    setToast('Data refreshed successfully');
  };

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const interval = window.setInterval(() => {
      void refreshData();
    }, AUTO_REFRESH_MS);

    return () => window.clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

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
          background: 'linear-gradient(135deg, #ffffff 0%, #dbeafe 100%)',
          borderRadius: 26,
          padding: '28px 30px',
          boxShadow: '0 18px 46px rgba(15,23,42,0.08)',
          marginBottom: 28,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              padding: '6px 12px',
              background: '#1d4ed8',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            Dashboard Refresh
          </div>

          <h1 style={{ margin: '0 0 8px', fontSize: 38, lineHeight: 1.05 }}>
            Analytics Dashboard
          </h1>

          <p style={{ margin: '0 0 10px', color: '#475569', fontSize: 16, maxWidth: 680 }}>
            Monitor the latest dashboard update time and refresh the current analytics view on
            demand or automatically every five minutes.
          </p>

          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a8a' }}>
            Last updated: {lastUpdatedLabel}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12, justifyItems: 'end' }}>
          <button
            type="button"
            onClick={() => void refreshData()}
            disabled={isRefreshing}
            style={{
              border: 'none',
              borderRadius: 999,
              background: isRefreshing ? '#93c5fd' : '#1d4ed8',
              color: '#ffffff',
              padding: '12px 18px',
              fontSize: 14,
              fontWeight: 700,
              cursor: isRefreshing ? 'wait' : 'pointer',
              boxShadow: '0 12px 30px rgba(29,78,216,0.20)',
            }}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh data'}
          </button>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: '#475569',
            }}
          >
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(event) => setAutoRefresh(event.target.checked)}
            />
            Auto-refresh every 5 minutes
          </label>
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Live Gists</h2>
        <LiveGistCounter key={`live-${refreshVersion}`} />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>New vs Returning Users (90 days)</h2>
        <UserAreaChart key={`users-${refreshVersion}`} />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Scatter</h2>
        <ScatterChart key={`scatter-${refreshVersion}`} />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Radar</h2>
        <RadarChart key={`radar-${refreshVersion}`} />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Category Distribution</h2>
        <CategoryPieChart key={`category-${refreshVersion}`} />
      </section>

      <section>
        <h2>Locations</h2>
        <LocationTable key={`locations-${refreshVersion}`} />
      </section>

      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            right: 24,
            bottom: 24,
            background: '#0f766e',
            color: '#ffffff',
            padding: '14px 16px',
            borderRadius: 16,
            boxShadow: '0 16px 36px rgba(15,118,110,0.28)',
            fontWeight: 700,
          }}
        >
          {toast}
        </div>
      )}
    </main>
  );
}

import type {
  GistStats,
  LocationData,
  UserGrowthData,
  UserGrowthPoint,
  CategoryDistribution,
  CategoryStat,
  PlatformUsage,
  ScatterPoint,
  ScatterCategory,
  ApiResult,
} from '@/types/analytics';

// ── Mode detection ────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

/** True when no real API URL is configured, or when explicitly forced via env. */
export const isMock =
  !API_BASE || process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// ── Internal helpers ──────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { ok: false, error: res.statusText, status: res.status };
    }

    const data: T = await res.json();
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// ── Mock data generators ──────────────────────────────────────────────────────

const LOCATIONS = [
  'Lagos',
  'Abuja',
  'Kano',
  'Ibadan',
  'Port Harcourt',
  'Enugu',
  'Kaduna',
];

function mockLocationData(): LocationData[] {
  return LOCATIONS.map((location, i) => {
    // Descending trend for earlier cities, ascending for later — gives variety
    const base = 60 - i * 7;
    const trend = Array.from({ length: 7 }, (_, d) =>
      Math.max(0, Math.round(base + d * (i % 2 === 0 ? 3 : -3) + (d * 2))),
    );
    return { location, count: trend.reduce((s, v) => s + v, 0), trend };
  });
}

function mockGistStats(): GistStats {
  return {
    totalGists: 1247,
    todayGists: 89,
    activeUsers: 324,
    topLocations: mockLocationData(),
  };
}

function mockUserGrowth(days = 90): UserGrowthData {
  const base = Date.now() - (days - 1) * 86_400_000;
  const result: UserGrowthPoint[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(base + i * 86_400_000);
    const label = d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const spike = i > 38 && i < 52 ? 40 : 0;

    result.push({
      date: label,
      returning: Math.round(
        Math.max(0, 120 + i * 0.8 - (isWeekend ? 25 : 0)),
      ),
      newUsers: Math.round(Math.max(0, 60 + i * 0.4 + spike)),
    });
  }

  return { days: result };
}

function mockCategoryDistribution(): CategoryDistribution {
  const raw: [CategoryStat['label'], number][] = [
    ['Events', 312],
    ['Food', 278],
    ['Safety', 195],
    ['Tips', 241],
    ['News', 183],
    ['Transit', 157],
    ['Markets', 134],
    ['Other', 98],
  ];

  const categories: CategoryStat[] = raw.map(([label, count]) => ({
    label,
    count,
  }));

  return {
    categories,
    total: categories.reduce((s, c) => s + c.count, 0),
  };
}

function mockPlatformUsage(): PlatformUsage {
  return {
    metrics: [
      { label: 'Mobile',      thisMonth: 80, lastMonth: 60 },
      { label: 'Desktop',     thisMonth: 60, lastMonth: 50 },
      { label: 'API',         thisMonth: 70, lastMonth: 60 },
      { label: 'Web',         thisMonth: 90, lastMonth: 70 },
      { label: 'New Users',   thisMonth: 50, lastMonth: 40 },
      { label: 'Power Users', thisMonth: 40, lastMonth: 30 },
    ],
  };
}

const SCATTER_CATEGORIES: ScatterCategory[] = ['Tech', 'Finance', 'AI', 'Web3'];

function mockScatterData(count = 500): ScatterPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `gist-${i}`,
    age: Math.floor(Math.random() * 365),
    engagement: Math.floor(Math.random() * 1000),
    category:
      SCATTER_CATEGORIES[Math.floor(Math.random() * SCATTER_CATEGORIES.length)],
  }));
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Top-level KPIs: total gists, today's count, active users, top locations.
 */
export async function fetchGistStats(): Promise<GistStats> {
  if (isMock) return mockGistStats();

  const result = await apiFetch<GistStats>('/analytics/gists/stats');
  if (!result.ok) {
    console.error('[api] fetchGistStats failed:', result.error);
    return mockGistStats();
  }
  return result.data;
}

/**
 * 90-day new vs returning user time series.
 */
export async function fetchUserGrowth(days = 90): Promise<UserGrowthData> {
  if (isMock) return mockUserGrowth(days);

  const result = await apiFetch<UserGrowthData>(
    `/analytics/users/growth?days=${days}`,
  );
  if (!result.ok) {
    console.error('[api] fetchUserGrowth failed:', result.error);
    return mockUserGrowth(days);
  }
  return result.data;
}

/**
 * Gist counts broken down by category.
 */
export async function fetchCategoryDistribution(): Promise<CategoryDistribution> {
  if (isMock) return mockCategoryDistribution();

  const result = await apiFetch<CategoryDistribution>(
    '/analytics/gists/by-category',
  );
  if (!result.ok) {
    console.error('[api] fetchCategoryDistribution failed:', result.error);
    return mockCategoryDistribution();
  }
  return result.data;
}

/**
 * Platform / channel usage metrics for the radar chart.
 */
export async function fetchPlatformUsage(): Promise<PlatformUsage> {
  if (isMock) return mockPlatformUsage();

  const result = await apiFetch<PlatformUsage>('/analytics/platform/usage');
  if (!result.ok) {
    console.error('[api] fetchPlatformUsage failed:', result.error);
    return mockPlatformUsage();
  }
  return result.data;
}

/**
 * Scatter dataset: gist age (days) vs engagement count.
 */
export async function fetchScatterData(count = 500): Promise<ScatterPoint[]> {
  if (isMock) return mockScatterData(count);

  const result = await apiFetch<ScatterPoint[]>(
    `/analytics/gists/scatter?limit=${count}`,
  );
  if (!result.ok) {
    console.error('[api] fetchScatterData failed:', result.error);
    return mockScatterData(count);
  }
  return result.data;
}

/**
 * Per-city gist counts with 7-day sparkline trends.
 */
export async function fetchLocationData(): Promise<LocationData[]> {
  if (isMock) return mockLocationData();

  const result = await apiFetch<LocationData[]>('/analytics/locations/active');
  if (!result.ok) {
    console.error('[api] fetchLocationData failed:', result.error);
    return mockLocationData();
  }
  return result.data;
}

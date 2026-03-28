# GistPin Analytics Dashboard

A data visualization dashboard for the GistPin platform, providing insights into gist activity, engagement trends, and geographic distribution.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Architecture](#architecture)
- [Component Structure](#component-structure)
- [Mock Data Documentation](#mock-data-documentation)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

The analytics dashboard is a Next.js application that visualizes data from the GistPin platform. It currently operates with mock data generators that simulate real gist activity and is designed to be wired to the GistPin REST API when ready.

**Tech stack:**

- [Next.js 15](https://nextjs.org/) — React framework with App Router
- [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/) — chart rendering
- TypeScript — strict mode

**Charts provided:**

| Chart | File | Purpose |
|---|---|---|
| Scatter Plot | `ScatterChart.tsx` | Gist age vs. engagement with regression trendline |
| Radar Chart | `RadarChart.tsx` | Platform usage comparison: this month vs. last month |
| Location Table | `LocationTable.tsx` + `Sparkline.tsx` | Geographic activity trends per city |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# From the repo root
cd analytics
npm install
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## Environment Variables

The analytics app does not currently require any environment variables for local development — all chart data is generated client-side via mock utilities.

When connecting to the live GistPin backend, create a `.env.local` file in this directory:

```env
# GistPin Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional: override the number of mock gist records generated
NEXT_PUBLIC_MOCK_DATA_COUNT=500
```

> The `NEXT_PUBLIC_` prefix is required for variables to be accessible in browser code via Next.js.

---

## Available Scripts

Run these from inside the `analytics/` directory:

| Command | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint across all source files |

---

## Architecture

```
analytics/
├── app/
│   └── page.tsx              # Dashboard entry — composes all chart sections
├── components/
│   ├── charts/
│   │   ├── ScatterChart.tsx  # Age vs. engagement scatter plot
│   │   ├── RadarChart.tsx    # Monthly platform usage radar
│   │   └── Sparkline.tsx     # Inline mini trend line (50×20px)
│   └── ui/
│       └── LocationTable.tsx # Table of cities with embedded sparklines
├── lib/
│   └── utils.ts              # Mock data generator + linear regression
└── types/
    └── index.ts              # Shared TypeScript interfaces
```

### Data flow

```
page.tsx
  ├── ScatterChart  ──► generateGistData() ──► 500 GistData records (client-side)
  │                     regression()        ──► linear trendline overlay
  ├── RadarChart    ──► static hardcoded datasets (this month / last month)
  └── LocationTable ──► static mock location array ──► Sparkline (per city)
```

All data generation happens on the client inside `useMemo` hooks. No network requests are made in the current implementation.

---

## Component Structure

### `app/page.tsx`

Root dashboard page. Renders three sections:

```tsx
<ScatterChart />   // Gist age vs. engagement
<RadarChart />     // Platform channel comparison
<LocationTable />  // City-level trend table
```

---

### `components/charts/ScatterChart.tsx`

Interactive scatter plot using Chart.js `Scatter` component.

**Features:**
- Category filter dropdown (`All | Tech | Finance | AI | Web3`)
- Color-coded points per category: Tech=blue, Finance=green, AI=purple, Web3=orange
- Red regression trendline computed over the filtered dataset
- Click a point to alert the gist ID

**Props:** none — data is self-contained via `generateGistData()`

---

### `components/charts/RadarChart.tsx`

Radar chart comparing platform usage across six dimensions.

**Axes:** Mobile, Desktop, API, Web, New Users, Power Users

**Datasets:**
- `This Month` — blue fill
- `Last Month` — red fill

**Props:** none — uses hardcoded static values

---

### `components/charts/Sparkline.tsx`

Minimal inline trend line rendered at 50×20px. Used inside `LocationTable`.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `data` | `number[]` | Ordered series of numeric values |

**Behavior:** border color is green when the last value exceeds the first, red otherwise.

---

### `components/ui/LocationTable.tsx`

Table listing cities with their 7-day activity trends.

**Columns:** Location, Trend (sparkline + arrow indicator)

**Mock data:**

| Location | 7-day values | Direction |
|---|---|---|
| Abuja | 10, 20, 30, 25, 40, 50, 60 | ↑ |
| Lagos | 60, 50, 40, 35, 30, 20, 10 | ↓ |

---

## Mock Data Documentation

### `lib/utils.ts`

#### `generateGistData(count?: number): GistData[]`

Generates an array of synthetic gist records for chart rendering.

| Parameter | Default | Description |
|---|---|---|
| `count` | `500` | Number of records to generate |

Each record has:

| Field | Range | Description |
|---|---|---|
| `id` | `gist-0` … `gist-N` | Unique string identifier |
| `age` | 0 – 364 | Days since the gist was posted |
| `engagement` | 0 – 999 | Interaction count (views, reactions) |
| `category` | Tech / Finance / AI / Web3 | Randomly assigned topic category |

#### `regression(data: GistData[]): { slope: number; intercept: number }`

Computes ordinary least squares linear regression over `age` (x) and `engagement` (y).

Used by `ScatterChart` to render a best-fit trendline from `x=0` to `x=365`.

---

### TypeScript types — `types/index.ts`

```ts
type Category = 'Tech' | 'Finance' | 'AI' | 'Web3';

interface GistData {
  id: string;        // Unique gist identifier
  age: number;       // Days since posting
  engagement: number;// Interaction count
  category: Category;
}

interface LocationTrend {
  location: string;  // City name
  values: number[];  // Time-series values (e.g., daily post counts)
}

interface RadarData {
  label: string;     // Dataset label (e.g., "This Month")
  values: number[];  // One value per radar axis
}
```

---

## API Documentation

The analytics dashboard is designed to eventually consume the GistPin REST API. The backend exposes the following relevant endpoints (served by the NestJS backend in `../Backend`):

### `GET /gists`

Returns gists near a given coordinate.

**Query parameters:**

| Parameter | Required | Default | Description |
|---|---|---|---|
| `lat` | yes | — | Latitude (decimal degrees) |
| `lon` | yes | — | Longitude (decimal degrees) |
| `radius` | no | 500 | Search radius in meters |
| `limit` | no | 20 | Max records per page |
| `cursor` | no | — | Base64-encoded pagination cursor |

**Example response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "content": "Suya spot open till midnight",
      "location_cell": "s17eb4n",
      "content_hash": "Qm...",
      "created_at": "2026-03-28T10:00:00Z",
      "distance": 42.5
    }
  ],
  "cursor": "eyJpZCI6..."
}
```

### `GET /gists/:id`

Returns a single gist by UUID.

### `GET /health`

Returns backend and database status.

### Swagger UI

Full interactive API documentation is available at `http://localhost:3000/api/docs` when the backend is running.

---

## Troubleshooting

### Chart does not render / blank page

- Ensure Chart.js components are registered before use. Each chart file calls `ChartJS.register(...)` at the module level — if you add a new chart type, register its scale/element there.
- Charts use `'use client'` directive. If you move a chart into a Server Component, rendering will fail. Keep chart files as Client Components.

### `@/` import paths not resolving

The `@/` alias maps to the `analytics/` root. Verify your `tsconfig.json` contains:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### `Module not found: react-chartjs-2`

Run `npm install` inside the `analytics/` directory. Dependencies are not hoisted from the repo root.

### Stale mock data between renders

`generateGistData()` is called inside `useMemo([], [])` in `ScatterChart`, so it runs once per mount. If you need a fresh dataset, remount the component or move the call outside `useMemo`.

### Backend not connecting (future live-data mode)

1. Confirm the backend is running: `cd ../Backend && npm run start:dev`
2. Check `NEXT_PUBLIC_API_URL` matches the backend port (default `3000`)
3. CORS is enabled on the backend for all origins in development — no additional config needed
4. Inspect the Network tab in DevTools for specific error responses

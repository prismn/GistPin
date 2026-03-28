import ScatterChart from '@/components/charts/ScatterChart';
import RadarChart from '@/components/charts/RadarChart';
import CategoryPieChart from '@/components/charts/CategoryPieChart';
import LocationTable from '@/components/ui/LocationTable';
import LiveGistCounter from '@/components/LiveGistCounter';
import UserAreaChart from '@/components/charts/UserAreaChart';
import KPIGrid from '@/components/KPICard';
import DailyGistsChart from '@/components/charts/DailyGistsChart';

export default function Page() {
  return (
    <div>
      <h1>Analytics Dashboard</h1>

      <h2>Overview</h2>
      <KPIGrid />

      <h2>Daily Gists (Last 30 Days)</h2>
      <DailyGistsChart />

      <h2>Live Gists</h2>
      <LiveGistCounter />

      <h2>New vs Returning Users (90 days)</h2>
      <UserAreaChart />

      <h2>Scatter</h2>
      <ScatterChart />

      <h2>Radar</h2>
      <RadarChart />

      <h2>Category Distribution</h2>
      <CategoryPieChart />

      <h2>Locations</h2>
      <LocationTable />
    </div>
  );
}
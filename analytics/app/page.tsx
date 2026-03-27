import ScatterChart from '@/components/charts/ScatterChart';
import RadarChart from '@/components/charts/RadarChart';
import LocationTable from '@/components/ui/LocationTable';

export default function Page() {
  return (
    <div>
      <h1>Analytics Dashboard</h1>

      <h2>Scatter</h2>
      <ScatterChart />

      <h2>Radar</h2>
      <RadarChart />

      <h2>Locations</h2>
      <LocationTable />
    </div>
  );
}
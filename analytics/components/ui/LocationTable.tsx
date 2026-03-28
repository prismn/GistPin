'use client';

import Sparkline from '@/components/charts/Sparkline';
import ExportButton from '@/components/ui/ExportButton';
import { exportRowsToCsv } from '@/lib/export';

const mock = [
  { location: 'Abuja', values: [10, 20, 30, 25, 40, 50, 60] },
  { location: 'Lagos', values: [60, 50, 40, 35, 30, 20, 10] },
];

export default function LocationTable() {
  return (
    <div>
      <ExportButton
        onExport={(onProgress) =>
          exportRowsToCsv({
            filenamePrefix: 'location-table',
            filters: {
              points_per_location: 7,
            },
            rows: mock.map((row) => ({
              location: row.location,
              day_1: row.values[0],
              day_2: row.values[1],
              day_3: row.values[2],
              day_4: row.values[3],
              day_5: row.values[4],
              day_6: row.values[5],
              day_7: row.values[6],
              direction: row.values.at(-1)! > row.values[0] ? 'up' : 'down',
            })),
            onProgress,
          })
        }
      />
      <table>
        <thead>
          <tr>
            <th>Location</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          {mock.map((row) => (
            <tr key={row.location}>
              <td>{row.location}</td>
              <td>
                <Sparkline data={row.values} />
                {row.values.at(-1)! > row.values[0] ? '↑' : '↓'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

'use client';

import Sparkline from '@/components/charts/Sparkline';

const mock = [
  { location: 'Abuja', values: [10, 20, 30, 25, 40, 50, 60] },
  { location: 'Lagos', values: [60, 50, 40, 35, 30, 20, 10] },
];

export default function LocationTable() {
  return (
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
  );
}
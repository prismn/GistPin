'use client';

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  LineElement,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { generateGistData, regression } from '@/lib/utils';
import { useMemo, useState } from 'react';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, LineElement);

const colors: Record<string, string> = {
  Tech: 'blue',
  Finance: 'green',
  AI: 'purple',
  Web3: 'orange',
};

export default function ScatterChart() {
  const [category, setCategory] = useState<string | null>(null);

  const data = useMemo(() => generateGistData(), []);

  const filtered = category
    ? data.filter((d) => d.category === category)
    : data;

  const reg = regression(filtered);

  const scatterData = {
    datasets: [
      {
        label: 'Gists',
        data: filtered.map((d) => ({
          x: d.age,
          y: d.engagement,
        })),
        backgroundColor: filtered.map((d) => colors[d.category]),
      },
      {
        label: 'Trendline',
        type: 'line' as const,
        data: [
          { x: 0, y: reg.intercept },
          { x: 365, y: reg.slope * 365 + reg.intercept },
        ],
        borderColor: 'red',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div>
      <select onChange={(e) => setCategory(e.target.value || null)}>
        <option value="">All</option>
        <option value="Tech">Tech</option>
        <option value="Finance">Finance</option>
        <option value="AI">AI</option>
        <option value="Web3">Web3</option>
      </select>

      <Scatter
        data={scatterData}
        options={{
          onClick: (_, elements) => {
            if (elements.length) {
              const index = elements[0].index;
              alert(`Gist: ${filtered[index].id}`);
            }
          },
        }}
      />
    </div>
  );
}
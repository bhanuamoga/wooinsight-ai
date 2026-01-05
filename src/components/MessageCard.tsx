'use client';

import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// ✅ STRIP ```json ``` BEFORE PARSING
function extractJson(text: string) {
  if (!text) return null;

  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  if (!cleaned.startsWith('{') || !cleaned.endsWith('}')) {
    return null;
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export default function MessageCard({ content }: { content: string }) {
  const insight = extractJson(content);

  // ⏳ still streaming OR not JSON → show text
  if (!insight) {
    return (
      <div className="prose whitespace-pre-wrap text-gray-800">
        {content}
      </div>
    );
  }

  const chartData = insight.chart?.data;
  const tableData = insight.table;

  // ✅ FINALLY SHOWS CHART + TABLE
  return (
    <div className="border rounded-xl p-4 max-w-3xl bg-white shadow-sm w-full">
      {insight.narrative && (
        <p className="text-gray-800 mb-4">{insight.narrative}</p>
      )}

      {chartData && (
        <div className="h-64 my-4 w-full">
          {insight.chart.type === 'line' ? (
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          ) : (
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          )}
        </div>
      )}

      {Array.isArray(tableData) && tableData.length > 0 && (
        <div className="overflow-x-auto rounded-lg border mt-2">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(tableData[0]).map(key => (
                  <th
                    key={key}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {key.replace('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tableData.map((row: any, i: number) => (
                <tr key={i}>
                  {Object.values(row).map((val: any, j: number) => (
                    <td key={j} className="px-3 py-2 text-gray-700">
                      {typeof val === 'number'
                        ? val.toLocaleString()
                        : String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {insight.recommendation && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
          💡 <span className="font-semibold">Recommendation:</span>{' '}
          {insight.recommendation}
        </div>
      )}
    </div>
  );
}

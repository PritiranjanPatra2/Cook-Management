import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

export default function FoodChart({ data = [], height = 300 }) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem'
        }}
      >
        No food preparation records available for this period.
      </div>
    );
  }

  // Top 10 dishes for neat chart display
  const chartData = data.slice(0, 10).map((item) => ({
    name: item.name,
    count: item.count,
    morningCount: item.morningCount || 0,
    eveningCount: item.eveningCount || 0
  }));

  const colors = [
    '#7C5CFC',
    '#6366F1',
    '#22D3EE',
    '#A78BFA',
    '#38BDF8',
    '#818CF8',
    '#06B6D4',
    '#C084FC',
    '#2DD4BF',
    '#93C5FD'
  ];

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.06)" />
          <XAxis
            dataKey="name"
            stroke="#A8B1C2"
            fontSize={12}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
          />
          <YAxis stroke="#A8B1C2" fontSize={12} tickLine={false} allowDecimals={false} />
          <Tooltip
            formatter={(value) => [`${value} times`, 'Prepared']}
            contentStyle={{
              backgroundColor: '#171E2D',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              color: '#F8FAFC'
            }}
            itemStyle={{ color: '#F8FAFC' }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

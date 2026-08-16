import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function AttendanceChart({
  present = 0,
  leave = 0,
  late = 0,
  notRecorded = 0,
  attendancePercentage = 0
}) {
  const data = [
    { name: 'Present', value: present, color: '#10b981' },
    { name: 'Leave', value: leave, color: '#ef4444' },
    { name: 'Late', value: late, color: '#8b5cf6' },
    { name: 'Not Recorded', value: notRecorded, color: '#cbd5e1' }
  ].filter((item) => item.value > 0);

  // Fallback if no shifts at all
  const chartData = data.length > 0 ? data : [{ name: 'No Data', value: 1, color: '#e2e8f0' }];

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
          Attendance Rate
        </h4>
        <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#10b981' }}>
          {attendancePercentage}%
        </span>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value, name) => [`${value} shifts`, name]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}
            />
            <Pie
              data={chartData}
              innerRadius={65}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Text */}
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>
            {attendancePercentage}%
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginTop: '3px' }}>
            Present
          </span>
        </div>
      </div>

      {/* Legend List */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
        {data.map((item) => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
            <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>{item.name}:</span>
            <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

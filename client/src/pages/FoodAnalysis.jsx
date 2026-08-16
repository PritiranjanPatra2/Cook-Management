import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Award,
  Calendar,
  Utensils,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import DateFilter from '../components/DateFilter';
import FoodChart from '../components/FoodChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { reportService } from '../services/reportService';
import { toYYYYMMDD } from '../utils/dateUtils';

export default function FoodAnalysis() {
  const [viewMode, setViewMode] = useState('month'); // 'day' | 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-indexed

  const loadFoodData = async () => {
    try {
      setLoading(true);
      const params = {
        period: viewMode,
        year,
        month
      };

      if (viewMode === 'day') {
        params.date = toYYYYMMDD(currentDate);
      } else if (viewMode === 'week') {
        const d = new Date(currentDate);
        const dayOfWeek = d.getDay();
        const dist = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const mon = new Date(d);
        mon.setDate(d.getDate() + dist);
        const sun = new Date(mon);
        sun.setDate(mon.getDate() + 6);
        params.startDate = toYYYYMMDD(mon);
        params.endDate = toYYYYMMDD(sun);
      }

      const res = await reportService.getFoodAnalysis(params);
      if (res.success) {
        setAnalysisData(res);
      }
    } catch (err) {
      console.error('Error fetching food analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoodData();
  }, [viewMode, currentDate]);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Date Navigation & View Mode */}
      <DateFilter
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        onToday={() => setCurrentDate(new Date())}
      />

      {loading ? (
        <LoadingSpinner text="Analyzing meal preparation trends..." />
      ) : (
        <>
          {/* Highlight Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Most Prepared */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
                border: '1px solid #fde68a',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  backgroundColor: '#f59e0b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Award size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#b45309', textTransform: 'uppercase' }}>
                  🥇 Most Prepared Dish
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#78350f', marginTop: '0.15rem' }}>
                  {analysisData?.mostPrepared?.name || '—'}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#92400e', fontWeight: '600' }}>
                  {analysisData?.mostPrepared ? `${analysisData.mostPrepared.count} times prepared` : 'No meals recorded'}
                </p>
              </div>
            </div>

            {/* Second Most Prepared */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                border: '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  backgroundColor: '#64748b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Utensils size={26} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>
                  🥈 2nd Most Prepared Dish
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginTop: '0.15rem' }}>
                  {analysisData?.secondMostPrepared?.name || '—'}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: '600' }}>
                  {analysisData?.secondMostPrepared ? `${analysisData.secondMostPrepared.count} times prepared` : '—'}
                </p>
              </div>
            </div>

            {/* Total Meals Prepared */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                border: '1px solid #c7d2fe',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <BarChart3 size={26} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#4338ca', textTransform: 'uppercase' }}>
                  Total Cooking Sessions
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#312e81', marginTop: '0.15rem' }}>
                  {analysisData?.totalMealsPrepared || 0}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#4338ca', fontWeight: '600' }}>
                  {analysisData?.data?.length || 0} unique recipes
                </p>
              </div>
            </div>
          </div>

          {/* Bar Chart Section */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>
                Dishes Prepared Frequency Chart
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Top 10 Dishes</span>
            </div>

            <FoodChart data={analysisData?.data || []} height={320} />
          </div>

          {/* Detailed Frequency & Shift Breakdown Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>Full Food Frequency Breakdown</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)' }}># RANK</th>
                    <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)' }}>DISH NAME</th>
                    <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)' }}>CATEGORY</th>
                    <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)' }}>🌅 MORNING</th>
                    <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)' }}>🌙 EVENING</th>
                    <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)', textAlign: 'right' }}>TOTAL TIMES</th>
                  </tr>
                </thead>
                <tbody>
                  {(analysisData?.data || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No meals prepared in this selected period.
                      </td>
                    </tr>
                  ) : (
                    analysisData.data.map((dish, idx) => (
                      <tr key={dish.name} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.875rem 1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
                          #{idx + 1}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', fontWeight: '700' }}>
                          {dish.name}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem' }}>
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border)' }}>
                            {dish.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', color: '#d97706', fontWeight: '600' }}>
                          {dish.morningCount || 0}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', color: '#4338ca', fontWeight: '600' }}>
                          {dish.eveningCount || 0}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right', fontWeight: '800', color: 'var(--primary)', fontSize: '1rem' }}>
                          {dish.count}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

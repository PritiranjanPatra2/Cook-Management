import { request } from './api';

export const reportService = {
  getMonthReport: (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    return request(`/reports/month?${params.toString()}`);
  },

  getDayReport: (date) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    return request(`/reports/day?${params.toString()}`);
  },

  getWeekReport: (startDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    return request(`/reports/week?${params.toString()}`);
  },

  getFoodAnalysis: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reports/food-analysis${query ? `?${query}` : ''}`);
  }
};

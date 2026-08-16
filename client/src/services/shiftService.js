import { request } from './api';

export const shiftService = {
  getShifts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/shifts${query ? `?${query}` : ''}`);
  },

  getShiftById: (id) => request(`/shifts/${id}`),

  saveShift: (shiftData) =>
    request('/shifts', {
      method: 'POST',
      body: shiftData
    }),

  batchSaveDayShifts: (dayData) =>
    request('/shifts/batch', {
      method: 'POST',
      body: dayData
    }),

  updateShift: (id, shiftData) =>
    request(`/shifts/${id}`, {
      method: 'PUT',
      body: shiftData
    }),

  deleteShift: (id) =>
    request(`/shifts/${id}`, {
      method: 'DELETE'
    })
};

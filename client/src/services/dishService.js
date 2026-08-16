import { request } from './api';

export const dishService = {
  getDishes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/dishes${query ? `?${query}` : ''}`);
  },

  getComboSuggestion: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/dishes/suggest-combo${query ? `?${query}` : ''}`);
  },

  createDish: (dishData) =>
    request('/dishes', {
      method: 'POST',
      body: dishData
    }),

  updateDish: (id, dishData) =>
    request(`/dishes/${id}`, {
      method: 'PUT',
      body: dishData
    }),

  toggleActive: (id) =>
    request(`/dishes/${id}/toggle`, {
      method: 'PATCH'
    }),

  deleteDish: (id) =>
    request(`/dishes/${id}`, {
      method: 'DELETE'
    })
};

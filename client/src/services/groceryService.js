import { request } from './api';

export const groceryService = {
  getGroceries: () => request('/groceries'),
  whatCanWeMake: () => request('/groceries/what-can-we-make'),
  createGrocery: (data) =>
    request('/groceries', {
      method: 'POST',
      body: data
    }),
  updateGrocery: (id, data) =>
    request(`/groceries/${id}`, {
      method: 'PUT',
      body: data
    }),
  toggleStatus: (id) =>
    request(`/groceries/${id}/toggle`, {
      method: 'PATCH'
    }),
  deleteGrocery: (id) =>
    request(`/groceries/${id}`, {
      method: 'DELETE'
    })
};

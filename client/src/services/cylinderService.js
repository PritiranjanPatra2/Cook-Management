import { request } from './api';

export const cylinderService = {
  getCurrentCylinder: () => request('/cylinders/current'),
  getCylinderHistory: () => request('/cylinders/history'),
  connectNewCylinder: (data) =>
    request('/cylinders/connect', {
      method: 'POST',
      body: data
    }),
  updateCylinder: (id, data) =>
    request(`/cylinders/${id}`, {
      method: 'PUT',
      body: data
    }),
  deleteCylinder: (id) =>
    request(`/cylinders/${id}`, {
      method: 'DELETE'
    })
};

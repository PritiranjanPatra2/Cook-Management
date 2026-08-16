import { request } from './api';

export const salaryService = {
  getSalaryStatus: () => request('/salary/status'),
  getSalaryHistory: () => request('/salary/history'),
  togglePaid: (data) =>
    request('/salary/toggle-paid', {
      method: 'POST',
      body: data
    }),
  updateSalary: (id, data) =>
    request(`/salary/${id}`, {
      method: 'PUT',
      body: data
    })
};

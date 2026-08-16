import { request } from './api';

export const settingsService = {
  verifyPasscode: (passcode) =>
    request('/settings/verify-passcode', {
      method: 'POST',
      body: { passcode }
    }),

  changePasscode: (currentPasscode, newPasscode) =>
    request('/settings/change-passcode', {
      method: 'POST',
      body: { currentPasscode, newPasscode }
    }),

  getSettings: () => request('/settings'),

  updateSettings: (settingsData) =>
    request('/settings', {
      method: 'PUT',
      body: settingsData
    })
};

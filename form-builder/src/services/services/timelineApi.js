import {
  getAuthHeaders,
  postMethodApiCall,
} from './apiClient.js';

const SETTINGS_BASE = '/settings';

export const getTimelineByConnectionIdApi = (id, data) =>
  postMethodApiCall(`${SETTINGS_BASE}/get-time-line-by-connection-id/${id}`, getAuthHeaders(), data);

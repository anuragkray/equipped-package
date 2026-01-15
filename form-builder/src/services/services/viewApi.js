import {
  getAuthHeaders,
  getMethodApiCall,
  patchMethodApiCall,
  postMethodApiCall,
} from './apiClient.js';

const VIEW_BASE = '/view';

export const createViewApi = data =>
  postMethodApiCall(`${VIEW_BASE}/create`, getAuthHeaders(), data);

export const getViewByTitleApi = tableView =>
  getMethodApiCall(`${VIEW_BASE}/get-by-title/${encodeURIComponent(tableView)}`, getAuthHeaders());

export const updateViewApi = (id, data) =>
  patchMethodApiCall(`${VIEW_BASE}/update/${id}`, getAuthHeaders(), data);


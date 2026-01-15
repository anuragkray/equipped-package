import {
  getAuthHeaders,
  getMethodApiCall,
  patchMethodApiCall,
  postMethodApiCall,
} from './apiClient.js';

const FORM_BASE = '/form';

export const createFormApi = data =>
  postMethodApiCall(`${FORM_BASE}/create`, getAuthHeaders(), data);

export const getFormApi = query =>
  getMethodApiCall(`${FORM_BASE}/get`, getAuthHeaders(), query);

export const getFormGroupApi = query =>
  getMethodApiCall(`${FORM_BASE}/group`, getAuthHeaders(), query);

export const getFormByIdApi = id =>
  getMethodApiCall(`${FORM_BASE}/get-by-id/${id}`, getAuthHeaders());

export const getFormByTitleApi = formTitle =>
  getMethodApiCall(
    `${FORM_BASE}/get-by-title/${encodeURIComponent(formTitle)}`,
    getAuthHeaders(),
  );

export const getFormByTitleForFilterApi = formTitle =>
  getMethodApiCall(
    `${FORM_BASE}/get-by-title-for-filter/${encodeURIComponent(formTitle)}`,
    getAuthHeaders(),
  );

export const updateFormApi = (id, data) =>
  patchMethodApiCall(`${FORM_BASE}/update/${id}`, getAuthHeaders(), data);


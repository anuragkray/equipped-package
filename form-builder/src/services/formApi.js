import {
  getAuthHeaders,
  getMethodApiCall,
  patchMethodApiCall,
  postMethodApiCall,
} from './apiClient.js';

const FORM_BASE = '/form';
let formOrganizationId = null;

export const setFormOrganizationId = organizationId => {
  formOrganizationId = organizationId || null;
};

const withOrganization = path => {
  if (!formOrganizationId) return path;
  return `${path}/${encodeURIComponent(formOrganizationId)}`;
};

export const createFormApi = data =>
  postMethodApiCall(
    withOrganization(`${FORM_BASE}/create`),
    getAuthHeaders(),
    data
  );

export const getFormApi = query =>
  getMethodApiCall(withOrganization(`${FORM_BASE}/get`), getAuthHeaders(), query);

export const getFormGroupApi = query => {
  if (formOrganizationId) {
    return getMethodApiCall(
      `${FORM_BASE}/group/${encodeURIComponent(formOrganizationId)}`,
      getAuthHeaders(),
      query
    );
  }
  return getMethodApiCall(`${FORM_BASE}/group`, getAuthHeaders(), query);
};

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
  patchMethodApiCall(
    withOrganization(`${FORM_BASE}/update/${id}`),
    getAuthHeaders(),
    data
  );


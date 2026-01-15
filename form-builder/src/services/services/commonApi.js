import {
  getAuthHeaders,
  getMethodApiCall,
} from './apiClient.js';

const COMMON_BASE = '/common';

// Get country list from API
export const getCountryListApi = () =>
  getMethodApiCall(`${COMMON_BASE}/countries`, getAuthHeaders());

// Get currency list from API
export const getCurrencyListApi = () =>
  getMethodApiCall(`${COMMON_BASE}/currencies`, getAuthHeaders());


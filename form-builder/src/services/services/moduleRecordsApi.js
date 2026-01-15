import { getAuthHeaders, getMethodApiCall, postMethodApiCall, patchMethodApiCall } from './apiClient.js';
import { getFormByTitleForFilterApi } from './formApi.js';

const withFallback = async (attempts = []) => {
  let lastResponse = null;
  for (const attempt of attempts) {
    try {
      const response = await attempt();
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        return response;
      }
      lastResponse = response;
      // fall back if common status codes indicate unsupported endpoint
      const retryableStatuses = [400, 404, 405];
      if (!retryableStatuses.includes(response?.statusCode)) {
        return response;
      }
    } catch (err) {
      lastResponse = {
        statusCode: err?.statusCode || err?.response?.status,
        errorMessage: err?.errorMessage || err?.message,
      };
    }
  }
  return lastResponse;
};

export const searchModuleRecords = async (moduleName, payload = {}, options = {}) => {
  const headers = getAuthHeaders();
  const body = {
    offset: 1,
    limit: 25,
    buttonType: 'All',
    search: [],
    ...payload,
  };

  // Only use commonModule endpoint - removed /{moduleName}/search API call
  return postMethodApiCall(`/commonModule/search/${moduleName}`, headers, body, {}, options);
};

export const createModuleRecord = async (moduleName, payload = {}) => {
  const headers = getAuthHeaders();
  return withFallback([
    () => postMethodApiCall(`/${moduleName}/create`, headers, payload),
    () => postMethodApiCall(`/commonModule/create/${moduleName}`, headers, payload),
  ]);
};

export const updateModuleRecord = async (moduleName, recordId, payload = {}) => {
  const headers = getAuthHeaders();
  // PATCH /commonModule/update/{moduleName}/{recordId}
  return patchMethodApiCall(`/commonModule/update/${moduleName}/${recordId}`, headers, payload);
};

export const fetchModuleFilterFields = async moduleName => {
  // Use get-by-title-for-filter API same as MinervaLMS
  const response = await getFormByTitleForFilterApi(moduleName);
  if (response?.statusCode === 200 && response?.data) {
    // Map array to object with field name as key (same as MinervaLMS)
    const mapped = {};
    if (Array.isArray(response.data)) {
      response.data.forEach(f => {
        if (f?.name) {
          mapped[f.name] = {
            name: f.name,
            label: f.label || f.fieldLabel || f.name,
            type: f.type || f.fieldType || 'text',
            conditions: f.conditions || f.filterConditions || [],
            ...f,
          };
        }
      });
    }
    return {
      ...response,
      data: mapped,
    };
  }
  
  // Fallback to old API if new one fails
  const headers = getAuthHeaders();
  return withFallback([
    () => getMethodApiCall(`/${moduleName}/get-filter-field`, headers),
    () => getMethodApiCall(`/commonModule/get-filter-field/${moduleName}`, headers),
  ]);
};

export const uploadModuleRecordsBulk = async (moduleName, payload = {}) => {
  const headers = getAuthHeaders();
  return withFallback([
    () => postMethodApiCall(`/commonModule/add-excel/${moduleName}`, headers, payload),
    () => postMethodApiCall(`/${moduleName}/add-excel`, headers, payload),
  ]);
};

export const getModuleRecordById = async (moduleName, id) => {
  const headers = getAuthHeaders();
  return withFallback([
    () => getMethodApiCall(`/${moduleName}/get-by-id/${id}`, headers),
    () => getMethodApiCall(`/commonModule/get-by-id/${moduleName}/${id}`, headers),
  ]);
};

// Search common module records (for lookup fields)
export const searchCommonModuleRecordsApi = async (moduleName, payload = {}) => {
  const headers = getAuthHeaders();
  const body = {
    offset: 1,
    limit: 200,
    buttonType: 'All',
    search: [],
    ...payload,
  };
  return postMethodApiCall(`/commonModule/search/${moduleName}`, headers, body);
};


import axios from 'axios';

const apiVersion = '/api/v1';

const normaliseBaseUrl = (url) => {
  if (!url) return '';
  const trimmed = url.replace(/\/+$/, '');
  const apiMatch = trimmed.match(/(.*)\/api\/v\d+$/i);
  return apiMatch ? apiMatch[1] : trimmed;
};

const resolvedBaseURL = (() => {
  const envUrl = window?.__APP_API_BASE__ || import.meta.env.VITE_API_BASE_URL;
  const normalised = normaliseBaseUrl(envUrl);
  if (normalised) return normalised;
  return 'http://localhost:3001';
})();

const axiosInstance = axios.create({
  baseURL: resolvedBaseURL,
});

let externalApiClient = null;

export const setExternalApiClient = (client) => {
  externalApiClient = client || null;
};

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authToken');
      localStorage.removeItem('isAuthenticated');
      if (typeof window !== 'undefined') {
        const currentPath = window.location?.pathname || '';
        if (!currentPath.startsWith('/login')) {
          window.location.replace('/login');
        }
      }
    }
    return Promise.reject(error);
  },
);

export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || '';
  const bearerLower = token ? `bearer ${token}` : '';
  const bearer = token ? `Bearer ${token}` : '';
  return {
    'Content-Type': 'application/json',
    'x-auth-token': bearerLower,
    Authorization: bearer,
  };
};

const buildURL = (apiPath, query = {}) => {
  const base = axiosInstance.defaults.baseURL || 'http://localhost:3001';
  const url = new URL(`${apiVersion}${apiPath}`, base);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
};

const handleResponse = async apiCall => {
  try {
    const response = await apiCall();
    const { status, data } = response;
    const payload = data?.data !== undefined ? data.data : data;
    if (status === 200 || status === 201) {
      return {
        data: payload ?? null,
        statusCode: status,
        successMessage: data?.msg,
      };
    }
    return {
      data: payload ?? null,
      statusCode: status,
      errorMessage: data?.msg || 'Unexpected response',
    };
  } catch (error) {
    if (axios.isCancel(error)) {
      return { status: 'cancelled' };
    }
    const errPayload = error?.response?.data?.data !== undefined
      ? error.response.data.data
      : error?.response?.data;
    return {
      data: errPayload,
      statusCode: error?.response?.status,
      errorMessage: error?.response?.data?.msg || error.message,
      rawError: error?.response?.data,
    };
  }
};

const callExternalApi = (method, apiPath, body, query, options) => {
  if (!externalApiClient || typeof externalApiClient[method] !== 'function') {
    return null;
  }
  if (method === 'get') {
    return externalApiClient.get(apiPath, { query, ...options });
  }
  if (method === 'delete') {
    return externalApiClient.delete(apiPath, body, { query, ...options });
  }
  return externalApiClient[method](apiPath, body, { query, ...options });
};

export const getMethodApiCall = (apiPath, headers, query = {}, options = {}) =>
  callExternalApi('get', apiPath, undefined, query, options) ??
  handleResponse(() =>
    axiosInstance.get(buildURL(apiPath, query), {
      headers,
      signal: options.signal,
    }),
  );

export const postMethodApiCall = (apiPath, headers, body = {}, query = {}, options = {}) =>
  callExternalApi('post', apiPath, body, query, options) ??
  handleResponse(() =>
    axiosInstance.post(buildURL(apiPath, query), body, {
      headers,
      signal: options.signal,
    }),
  );

export const patchMethodApiCall = (apiPath, headers, body = {}, options = {}) =>
  callExternalApi('patch', apiPath, body, undefined, options) ??
  handleResponse(() =>
    axiosInstance.patch(buildURL(apiPath), body, {
      headers,
      signal: options.signal,
    }),
  );

export const putMethodApiCall = (apiPath, headers, body = {}, options = {}) =>
  callExternalApi('put', apiPath, body, undefined, options) ??
  handleResponse(() =>
    axiosInstance.put(buildURL(apiPath), body, {
      headers,
      signal: options.signal,
    }),
  );

export const deleteMethodApiCall = (apiPath, headers, body = {}, options = {}) =>
  callExternalApi('delete', apiPath, body, undefined, options) ??
  handleResponse(() =>
    axiosInstance.delete(buildURL(apiPath), {
      headers,
      data: body,
      signal: options.signal,
    }),
  );

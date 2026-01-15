import axios from 'axios';

const apiVersion = '/api/v1';

const normaliseBaseUrl = (url) => {
  if (!url) return '';
  const trimmed = url.replace(/\/+$/, '');
  const apiMatch = trimmed.match(/(.*)\/api\/v\d+$/i);
  return apiMatch ? apiMatch[1] : trimmed;
};

const resolvedBaseURL = (() => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || window?.__APP_API_BASE__;
  const normalised = normaliseBaseUrl(envUrl);
  if (normalised) return normalised;
  return 'http://localhost:3001';
})();

const axiosInstance = axios.create({
  baseURL: resolvedBaseURL,
});

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

export const getMethodApiCall = (apiPath, headers, query = {}, options = {}) =>
  handleResponse(() =>
    axiosInstance.get(buildURL(apiPath, query), {
      headers,
      signal: options.signal,
    }),
  );

export const postMethodApiCall = (apiPath, headers, body = {}, query = {}, options = {}) =>
  handleResponse(() =>
    axiosInstance.post(buildURL(apiPath, query), body, {
      headers,
      signal: options.signal,
    }),
  );

export const patchMethodApiCall = (apiPath, headers, body = {}, options = {}) =>
  handleResponse(() =>
    axiosInstance.patch(buildURL(apiPath), body, {
      headers,
      signal: options.signal,
    }),
  );

export const putMethodApiCall = (apiPath, headers, body = {}, options = {}) =>
  handleResponse(() =>
    axiosInstance.put(buildURL(apiPath), body, {
      headers,
      signal: options.signal,
    }),
  );

export const deleteMethodApiCall = (apiPath, headers, body = {}, options = {}) =>
  handleResponse(() =>
    axiosInstance.delete(buildURL(apiPath), {
      headers,
      data: body,
      signal: options.signal,
    }),
  );

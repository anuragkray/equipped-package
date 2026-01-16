import {
  getAuthHeaders,
  getMethodApiCall,
  postMethodApiCall,
  patchMethodApiCall,
} from './apiClient';

export const resolveApiClient = (customClient) => {
  const getHeaders = () => {
    if (typeof customClient?.getHeaders === 'function') {
      return customClient.getHeaders();
    }
    if (customClient?.headers) {
      return customClient.headers;
    }
    return getAuthHeaders();
  };

  const get = (path, options = {}) => {
    if (customClient?.get) {
      return customClient.get(path, options);
    }
    return getMethodApiCall(path, getHeaders(), options.query, options);
  };

  const post = (path, body, options = {}) => {
    if (customClient?.post) {
      return customClient.post(path, body, options);
    }
    return postMethodApiCall(path, getHeaders(), body, options.query, options);
  };

  const patch = (path, body, options = {}) => {
    if (customClient?.patch) {
      return customClient.patch(path, body, options);
    }
    return patchMethodApiCall(path, getHeaders(), body, options);
  };

  return {
    get,
    post,
    patch,
    getHeaders,
  };
};

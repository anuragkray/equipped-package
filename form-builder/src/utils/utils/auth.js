import { logout } from '../services/api.js';
import { clearFeatureFlagCache } from '../hooks/useFeatureFlags.js';

const resolveToken = (source) => {
  if (!source) return undefined;
  if (typeof source === 'string') return source;
  if (typeof source === 'object') {
    if (typeof source.token === 'string') return source.token;
    if (typeof source.accessToken === 'string') return source.accessToken;
  }
  return undefined;
};

export const handleAuthResponse = (response) => {
  const token =
    resolveToken(response.token ?? response.accessToken ?? response.authToken) ||
    resolveToken(response.data?.token ?? response.data?.accessToken) ||
    resolveToken(response.data?.data?.token ?? response.data?.data?.accessToken);

  if (token) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('accessToken', token);
  }

  const refreshToken =
    resolveToken(response.refreshToken) ||
    resolveToken(response.data?.refreshToken) ||
    resolveToken(response.data?.data?.refreshToken);

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }

  const userData =
    response.user ||
    response.data?.user ||
    response.data?.userData ||
    response.data?.data?.user ||
    response.data ||
    { email: response.email };

  if (userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  localStorage.setItem('isAuthenticated', 'true');
};

export const handleLogout = () => {
  logout();
  // Clear feature flag cache on logout
  clearFeatureFlagCache();
  // Navigation is handled by the component calling this function
};

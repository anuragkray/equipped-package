// Get API base URL from environment variable (Vite requires VITE_ prefix)
const resolveBaseUrl = () => {
  const raw = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  // If env already includes /api/v1, keep it; otherwise append
  if (/\/api\/v\d+$/i.test(raw)) return raw;
  return `${raw.replace(/\/+$/, '')}/api/v1`;
};

const API_BASE_URL = resolveBaseUrl();

// Export for use in other files
export const getApiBaseUrl = () => API_BASE_URL;

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('isAuthenticated');
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const isAuthenticated = () => {
  // Check both token and the isAuthenticated flag
  const token = getAuthToken();
  const authFlag = localStorage.getItem('isAuthenticated');
  return !!(token || authFlag === 'true');
};

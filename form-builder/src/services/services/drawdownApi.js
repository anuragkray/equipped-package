import { getMethodApiCall, getAuthHeaders } from './apiClient.js';

const DRAWDOWN_BASE = '/drawdown';

/**
 * Get drawdown calculation data for a specific facility
 * @param {string} facilityId - The facility ID
 * @param {object} options - Optional configuration (e.g., signal for cancellation)
 * @returns {Promise} API response with drawdown calculation data
 */
export const getDrawdownCalculateByFacilityApi = (facilityId, options = {}) =>
  getMethodApiCall(
    `${DRAWDOWN_BASE}/drawdown-calculate/facility/${facilityId}`,
    getAuthHeaders(),
    {},
    options
  );

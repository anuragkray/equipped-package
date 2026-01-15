import { getMethodApiCall, postMethodApiCall, patchMethodApiCall, getAuthHeaders } from './apiClient';

// Form Service - for getting available modules/forms for permissions
export const formService = {
  async getFormGroups(offset = 1, limit = 20) {
    const headers = getAuthHeaders();
    const response = await getMethodApiCall(`/form/group?offset=${offset}&limit=${limit}`, headers);
    return {
      success: response.statusCode === 200,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },
};

// Role Service
export const roleService = {
  async getRoles() {
    const headers = getAuthHeaders();
    const response = await getMethodApiCall('/user/role', headers);
    return {
      success: response.statusCode === 200,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },

  async getRoleById(roleId) {
    const headers = getAuthHeaders();
    const response = await getMethodApiCall(`/user/get-role-by-id/${roleId}`, headers);
    return {
      success: response.statusCode === 200,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },

  async addRole(roleData) {
    const headers = getAuthHeaders();
    const response = await postMethodApiCall('/user/role', headers, roleData);
    return {
      success: response.statusCode === 200 || response.statusCode === 201,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },

  async updateRole(roleData) {
    const headers = getAuthHeaders();
    const response = await patchMethodApiCall('/user/role', headers, roleData);
    return {
      success: response.statusCode === 200,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },
};

// User Service
export const userService = {
  async getUsers(params = {}) {
    const headers = getAuthHeaders();
    const queryParams = new URLSearchParams();
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.userlist !== undefined) queryParams.append('userlist', params.userlist.toString());
    if (params.str) queryParams.append('str', params.str);
    
    const url = `/user/get-all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await getMethodApiCall(url, headers);
    return {
      success: response.statusCode === 200,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },

  async createUser(userData) {
    const headers = getAuthHeaders();
    const response = await postMethodApiCall('/user/create-user', headers, userData);
    return {
      success: response.statusCode === 200 || response.statusCode === 201,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },

  async getUserById(userId) {
    const headers = getAuthHeaders();
    const response = await getMethodApiCall(`/user/get-by-id/${userId}`, headers);
    return {
      success: response.statusCode === 200,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },

  async getUsersByIds(userIds) {
    const headers = getAuthHeaders();
    const response = await postMethodApiCall('/user/users-by-ids', headers, { userIds });
    return {
      success: response.statusCode === 200,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },

  async updateUserStatus(userIds, isActive) {
    const headers = getAuthHeaders();
    const response = await patchMethodApiCall('/user/active-inactive-user', headers, {
      id: userIds,
      is_active: isActive,
    });
    return {
      success: response.statusCode === 200,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },

  async updateUser(userId, userData) {
    const headers = getAuthHeaders();
    const response = await patchMethodApiCall(`/user/update-user/${userId}`, headers, userData);
    return {
      success: response.statusCode === 200,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },

  // Permission Profile methods
  async createPermissionProfile(profileData) {
    const headers = getAuthHeaders();
    const response = await postMethodApiCall('/user/permission-profile', headers, profileData);
    return {
      success: response.statusCode === 200 || response.statusCode === 201,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },

  async getPermissionProfiles(offset = 1, limit = 10) {
    const headers = getAuthHeaders();
    const response = await getMethodApiCall(`/user/permission-profile?offset=${offset}&limit=${limit}`, headers);
    return {
      success: response.statusCode === 200,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },

  async updatePermissionProfile(profileData) {
    const headers = getAuthHeaders();
    const response = await patchMethodApiCall('/user/permission-profile', headers, profileData);
    return {
      success: response.statusCode === 200,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },

  async getPermissionProfileById(profileId) {
    const headers = getAuthHeaders();
    const response = await getMethodApiCall(`/user/get-permission-profile-by-id/${profileId}`, headers);
    return {
      success: response.statusCode === 200,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },
};

// Profile Service
export const profileService = {
  async getProfile() {
    const headers = getAuthHeaders();
    const response = await getMethodApiCall('/user/profile', headers);
    return {
      success: response.statusCode === 200,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },

  async updateProfile(profileData) {
    const headers = getAuthHeaders();
    const response = await patchMethodApiCall('/user/profile', headers, profileData);
    return {
      success: response.statusCode === 200,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },

  async changePassword(passwordData) {
    const headers = getAuthHeaders();
    const response = await postMethodApiCall('/user/change-password', headers, passwordData);
    return {
      success: response.statusCode === 200 || response.statusCode === 201,
      data: response.data,
      message: response.successMessage || response.errorMessage,
    };
  },
};


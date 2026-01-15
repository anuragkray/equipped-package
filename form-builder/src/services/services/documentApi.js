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

const getAuthToken = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || '';
  return token ? `bearer ${token}` : '';
};

/**
 * Get list of documents by connectionId
 * @param {string} connectionId - The record/connection ID
 * @returns {Promise<Object>} - API response with documents list
 */
export const getDocumentsByConnection = async (connectionId) => {
  try {
    const response = await axios.get(
      `${resolvedBaseURL}${apiVersion}/document/by-connection/${connectionId}`,
      {
        headers: {
          'x-auth-token': getAuthToken(),
          'Content-Type': 'application/json',
        },
      }
    );

    const { status, data } = response;
    const payload = data?.data !== undefined ? data.data : data;

    if (status === 200 || status === 201) {
      return {
        data: payload ?? [],
        statusCode: status,
        successMessage: data?.msg,
      };
    }

    return {
      data: payload ?? [],
      statusCode: status,
      errorMessage: data?.msg || 'Unexpected response',
    };
  } catch (error) {
    const errPayload = error?.response?.data?.data !== undefined
      ? error.response.data.data
      : error?.response?.data;
    return {
      data: errPayload ?? [],
      statusCode: error?.response?.status,
      errorMessage: error?.response?.data?.msg || error.message,
      rawError: error?.response?.data,
    };
  }
};

/**
 * Upload a single document file
 * @param {Object} params - Upload parameters
 * @param {string} params.moduleName - The module name (e.g., "loanonboarding")
 * @param {string} params.connectionId - The record/connection ID
 * @param {string} params.documentName - Name of the document
 * @param {File} params.file - The file to upload
 * @param {string} [params.feature] - Optional feature identifier
 * @returns {Promise<Object>} - API response
 */
export const uploadDocument = async ({ moduleName, connectionId, documentName, file, feature = '' }) => {
  try {
    const formData = new FormData();
    formData.append('moduleName', moduleName);
    formData.append('connectionId', connectionId);
    formData.append('documentName', documentName);
    formData.append('file', file);
    formData.append('feature', feature);

    const response = await axios.post(
      `${resolvedBaseURL}${apiVersion}/document/upload`,
      formData,
      {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'x-auth-token': getAuthToken(),
          // Note: Don't set Content-Type for FormData - axios sets it automatically with proper boundary
        },
      }
    );

    const { status, data } = response;
    const payload = data?.data !== undefined ? data.data : data;

    if (status === 200 || status === 201) {
      return {
        data: payload ?? null,
        statusCode: status,
        successMessage: data?.msg || 'File uploaded successfully',
      };
    }

    return {
      data: payload ?? null,
      statusCode: status,
      errorMessage: data?.msg || 'Unexpected response',
    };
  } catch (error) {
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

/**
 * Upload multiple documents - each file gets a separate API call
 * @param {Object} params - Upload parameters
 * @param {string} params.moduleName - The module name
 * @param {string} params.connectionId - The record/connection ID
 * @param {File[]} params.files - Array of files to upload
 * @param {string} [params.feature] - Optional feature identifier
 * @param {Function} [params.onProgress] - Optional callback for progress updates
 * @returns {Promise<Object[]>} - Array of API responses for each file
 */
export const uploadMultipleDocuments = async ({ 
  moduleName, 
  connectionId, 
  files, 
  feature = '',
  onProgress 
}) => {
  const results = [];
  const totalFiles = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const documentName = file.name || `Document_${i + 1}`;

    try {
      const result = await uploadDocument({
        moduleName,
        connectionId,
        documentName,
        file,
        feature,
      });

      results.push({
        file: file.name,
        ...result,
      });

      // Call progress callback if provided
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: totalFiles,
          fileName: file.name,
          success: result.statusCode === 200 || result.statusCode === 201,
        });
      }
    } catch (error) {
      results.push({
        file: file.name,
        statusCode: 500,
        errorMessage: error.message || 'Upload failed',
      });

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: totalFiles,
          fileName: file.name,
          success: false,
          error: error.message,
        });
      }
    }
  }

  return results;
};


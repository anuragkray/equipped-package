/**
 * File formatting utilities
 */

/**
 * Default MIME type to extension mapping
 */
export const DEFAULT_MIME_TYPE_MAP = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-excel': 'XLS',
  'image/jpeg': 'JPEG',
  'image/jpg': 'JPG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
  'image/svg+xml': 'SVG',
  'image/webp': 'WEBP',
  'text/plain': 'TXT',
  'text/csv': 'CSV',
};

/**
 * Get file extension from MIME type
 * @param {string} mimeType - MIME type of the file
 * @param {Object} customMimeTypeMap - Custom MIME type mapping
 * @returns {string} File extension
 */
export const getFileExtension = (mimeType, customMimeTypeMap = {}) => {
  const finalMimeMap = { ...DEFAULT_MIME_TYPE_MAP, ...customMimeTypeMap };
  return finalMimeMap[mimeType] || mimeType.split('/')[1]?.toUpperCase() || 'FILE';
};

/**
 * Format accepted file types for display
 * @param {Array|string} acceptedFileTypes - Array of accepted MIME types or comma-separated string
 * @param {Object} customMimeTypeMap - Custom MIME type mapping
 * @returns {string} Formatted display string
 */
export const getAcceptedTypesDisplay = (acceptedFileTypes, customMimeTypeMap = {}) => {
  if (!acceptedFileTypes) {
    return 'All file types';
  }
  
  // If it's a string, split it by comma and process
  if (typeof acceptedFileTypes === 'string') {
    const types = acceptedFileTypes.split(',').map(t => t.trim()).filter(t => t);
    if (types.length === 0) {
      return 'All file types';
    }
    return types.map(type => getFileExtension(type, customMimeTypeMap)).join(', ');
  }
  
  // If it's an array
  if (Array.isArray(acceptedFileTypes)) {
    if (acceptedFileTypes.length === 0) {
      return 'All file types';
    }
    return acceptedFileTypes.map(type => getFileExtension(type, customMimeTypeMap)).join(', ');
  }
  
  // Fallback
  return 'All file types';
};

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Format time ago from date
 * @param {Date} date - Date to format
 * @returns {string} Formatted time string
 */
export const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

/**
 * Get file accept attribute for input element
 * @param {Array|string} acceptedFileTypes - Array of accepted MIME types or comma-separated string
 * @returns {string} Accept attribute value
 */
export const getAcceptAttribute = (acceptedFileTypes) => {
  if (!acceptedFileTypes) {
    return '*';
  }
  
  // If it's already a string, return it as is
  if (typeof acceptedFileTypes === 'string') {
    return acceptedFileTypes.trim() || '*';
  }
  
  // If it's an array, join it
  if (Array.isArray(acceptedFileTypes)) {
    if (acceptedFileTypes.length === 0) {
      return '*';
    }
    return acceptedFileTypes.join(',');
  }
  
  // Fallback for any other type
  return '*';
};

/**
 * Get status label for file status
 * @param {string} status - File status
 * @param {Object} customStatusLabels - Custom status labels
 * @returns {string} Status label
 */
export const getStatusLabel = (status, customStatusLabels = {}) => {
  const defaultLabels = {
    uploaded: 'Uploaded',
    processing: 'Processing...',
    processed: 'Processed',
    error: 'Error',
  };
  const finalLabels = { ...defaultLabels, ...customStatusLabels };
  return finalLabels[status] || status;
};

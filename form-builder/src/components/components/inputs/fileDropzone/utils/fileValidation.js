/**
 * File validation utilities
 */

/**
 * Validate a file against accepted types and size constraints
 * @param {File} file - File to validate
 * @param {Array|string} acceptedFileTypes - Array of accepted MIME types or comma-separated string
 * @param {number} maxFileSize - Maximum file size in MB
 * @param {Function} getAcceptedTypesDisplay - Function to get formatted display string
 * @returns {Array} Array of error messages (empty if valid)
 */
export const validateFile = (file, acceptedFileTypes, maxFileSize, getAcceptedTypesDisplay) => {
  const errors = [];
  
  // Check file type (only if acceptedFileTypes is specified)
  if (acceptedFileTypes) {
    // Normalize acceptedFileTypes to array
    let acceptedTypesArray = [];
    if (typeof acceptedFileTypes === 'string') {
      // Split comma-separated string and clean up
      acceptedTypesArray = acceptedFileTypes.split(',').map(t => t.trim()).filter(t => t);
    } else if (Array.isArray(acceptedFileTypes)) {
      acceptedTypesArray = acceptedFileTypes;
    }
    
    // Check if file type matches (check both MIME type and extension)
    if (acceptedTypesArray.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const fileType = file.type;
      
      const isAccepted = acceptedTypesArray.some(acceptedType => {
        // Check if acceptedType matches file extension (e.g., '.pdf')
        if (acceptedType.startsWith('.')) {
          return acceptedType.toLowerCase() === fileExtension;
        }
        // Check if acceptedType matches MIME type (e.g., 'application/pdf')
        return acceptedType === fileType;
      });
      
      if (!isAccepted) {
        errors.push(`File type not supported. Accepted types: ${getAcceptedTypesDisplay()}`);
      }
    }
  }
  
  // Check file size (only if maxFileSize is specified)
  if (maxFileSize) {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      errors.push(`File size exceeds ${maxFileSize}MB limit`);
    }
  }
  
  return errors;
};

/**
 * Process and validate multiple files
 * @param {FileList|Array} files - Files to process
 * @param {Function} validateFn - Validation function
 * @returns {Object} Object containing validFiles and errors arrays
 */
export const processFiles = (files, validateFn) => {
  const fileArray = Array.from(files);
  const validFiles = [];
  const errors = [];

  fileArray.forEach((file) => {
    const fileErrors = validateFn(file);
    if (fileErrors.length === 0) {
      const fileData = {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        status: 'uploaded',
      };
      validFiles.push(fileData);
    } else {
      errors.push({ fileName: file.name, errors: fileErrors });
    }
  });

  return { validFiles, errors };
};

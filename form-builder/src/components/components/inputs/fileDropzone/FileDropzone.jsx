import React, { useState, useRef, useCallback } from 'react';
import { alertError } from '../../../utils/alert.jsx';
import './FileDropzone.css';
import FileViewModal from './FileViewModal';

/**
 * FileDropzone Component
 * A fully dynamic and reusable drag-and-drop file upload component
 * Designed to be controlled by parent component for API integration
 * 
 * @param {Object} props
 * @param {Function} props.onFilesSelected - Callback when new files are selected/dropped (parent handles API upload)
 * @param {Function} props.onFileRemove - Callback when user clicks remove button (parent handles API deletion and state update)
 * @param {Array} props.files - Array of file objects (controlled by parent, can include pre-loaded files from API)
 * @param {Array} props.acceptedFileTypes - Array of accepted MIME types
 * @param {number} props.maxFileSize - Maximum file size in MB
 * @param {boolean} props.multiple - Allow multiple file selection (default: true)
 * @param {string} props.label - Label for the dropzone
 * @param {string} props.dropzoneText - Main text shown in dropzone
 * @param {string} props.buttonText - Text for the browse button
 * @param {boolean} props.showOCRToggle - Show OCR toggle option
 * @param {string} props.ocrToggleText - Text for OCR toggle
 * @param {string} props.ocrTooltip - Tooltip text for OCR info icon
 * @param {Function} props.onOCRToggle - Callback when OCR toggle changes
 * @param {boolean} props.disabled - Disable the dropzone
 * @param {string} props.uploadedSectionTitle - Title for uploaded documents section
 * @param {string} props.viewButtonText - Text for view button
 * @param {string} props.removeButtonText - Text for remove button
 * @param {string} props.closeButtonText - Text for modal close button
 * @param {Object} props.statusLabels - Custom labels for file statuses
 * @param {Object} props.mimeTypeMap - Custom MIME type to extension mapping
 */
const FileDropzone = ({
  onFilesSelected,
  onFileRemove,
  files = [],
  acceptedFileTypes,
  maxFileSize,
  multiple = true,
  label,
  dropzoneText,
  buttonText,
  showOCRToggle,
  ocrToggleText,
  ocrTooltip,
  onOCRToggle,
  disabled,
  uploadedSectionTitle,
  viewButtonText,
  removeButtonText,
  closeButtonText,
  statusLabels,
  mimeTypeMap,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [ocrEnabled, setOCREnabled] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Get file extension from MIME type
  const getFileExtension = (mimeType) => {
    const defaultMimeMap = {
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
    const finalMimeMap = { ...defaultMimeMap, ...mimeTypeMap };
    return finalMimeMap[mimeType] || mimeType.split('/')[1]?.toUpperCase() || 'FILE';
  };

  // Format accepted types for display
  const getAcceptedTypesDisplay = () => {
    if (!acceptedFileTypes || acceptedFileTypes.length === 0) {
      return 'All file types';
    }
    return acceptedFileTypes.map(getFileExtension).join(', ');
  };

  // Validate file
  const validateFile = (file) => {
    const errors = [];
    
    // Check file type (only if acceptedFileTypes is specified)
    if (acceptedFileTypes && acceptedFileTypes.length > 0 && !acceptedFileTypes.includes(file.type)) {
      errors.push(`File type not supported. Accepted types: ${getAcceptedTypesDisplay()}`);
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

  // Handle file selection
  const handleFiles = useCallback((files) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    fileArray.forEach((file) => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        const fileData = {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
          status: 'uploaded', // uploaded, processing, processed, error
        };
        validFiles.push(fileData);
      } else {
        errors.push({ fileName: file.name, errors: fileErrors });
      }
    });

    if (errors.length > 0) {
      // Show errors to user
      errors.forEach(({ fileName, errors: fileErrors }) => {
        alertError(`${fileName}:\n${fileErrors.join('\n')}`, 'File Validation Error');
      });
    }

    if (validFiles.length > 0) {
      // For single select mode, only send the first file
      const filesToSend = multiple ? validFiles : [validFiles[0]];
      
      // Let parent handle the files (including API upload)
      if (onFilesSelected) {
        onFilesSelected(filesToSend);
      }
    }
  }, [disabled, acceptedFileTypes, maxFileSize, multiple, onFilesSelected]);

  // Drag event handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled) {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    }
  };

  // File input change handler
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Open file browser
  const handleBrowseClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove file - Let parent handle removal (including API deletion)
  const handleRemoveFile = (file) => {
    if (onFileRemove) {
      onFileRemove(file);
    }
  };

  // View file - Open in modal instead of new tab
  const handleViewFile = (file) => {
    setSelectedFile(file);
    setViewModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedFile(null);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Handle OCR toggle
  const handleOCRToggleChange = (e) => {
    const checked = e.target.checked;
    setOCREnabled(checked);
    if (onOCRToggle) {
      onOCRToggle(checked);
    }
  };

  // Get file accept attribute for input
  const getAcceptAttribute = () => {
    if (!acceptedFileTypes || acceptedFileTypes.length === 0) {
      return '*';
    }
    return acceptedFileTypes.join(',');
  };

  // Get status label
  const getStatusLabel = (status) => {
    const defaultLabels = {
      uploaded: 'Uploaded',
      processing: 'Processing...',
      processed: 'Processed',
      error: 'Error',
    };
    const finalLabels = { ...defaultLabels, ...statusLabels };
    return finalLabels[status] || status;
  };

  return (
    <div className="file-dropzone-container">
      {label && <h3 className="file-dropzone-label">{label}</h3>}
      
      <div
        className={`file-dropzone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept={getAcceptAttribute()}
          multiple={multiple}
          style={{ display: 'none' }}
          disabled={disabled}
        />
        
        <div className="dropzone-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M32 10V40M32 40L22 30M32 40L42 30"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 40V50C10 52.2091 11.7909 54 14 54H50C52.2091 54 54 52.2091 54 50V40"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        <p className="dropzone-text">
          {dropzoneText || 'Drag and drop files here, or click to browse'}
        </p>
        
        <p className="dropzone-subtext">
          Supported: {getAcceptedTypesDisplay()}{maxFileSize ? ` (max ${maxFileSize}MB per file)` : ''}
        </p>
        
        <button type="button" className="dropzone-button" onClick={(e) => { e.stopPropagation(); handleBrowseClick(); }}>
          {buttonText || 'Choose Files'}
        </button>
      </div>

      {showOCRToggle && (
        <div className="ocr-toggle-container">
          <label className="ocr-toggle-label">
            <input
              type="checkbox"
              className="ocr-toggle-input"
              checked={ocrEnabled}
              onChange={handleOCRToggleChange}
              disabled={disabled}
            />
            <span className="ocr-toggle-slider"></span>
            <span className="ocr-toggle-text">{ocrToggleText || 'Enable OCR Auto-Extract'}</span>
            <span className="ocr-info-icon" title={ocrTooltip || 'Automatically extract text from uploaded documents'}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 7V11M8 5V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
          </label>
        </div>
      )}

      <FileViewModal
        isOpen={viewModalOpen}
        onClose={handleCloseModal}
        file={selectedFile}
        closeButtonText={closeButtonText}
      />

      {files.length > 0 && (
        <div className="uploaded-documents-section">
          <h4 className="uploaded-documents-title">{uploadedSectionTitle || 'Uploaded Documents'}</h4>
          
          <div className="uploaded-documents-list">
            {files.map((file) => (
              <div key={file.id} className="uploaded-file-item">
                <div className="file-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M20 2H8C6.9 2 6 2.9 6 4V28C6 29.1 6.9 30 8 30H24C25.1 30 26 29.1 26 28V8L20 2Z"
                      fill="#4A90E2"
                    />
                    <path d="M20 2V8H26" fill="#357ABD" />
                    <path
                      d="M10 16H22M10 20H22M10 24H18"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-meta">
                    Uploaded {formatTimeAgo(file.uploadedAt)} • {formatFileSize(file.size)}
                  </div>
                </div>
                
                <div className="file-status">
                  <span className={`status-badge status-${file.status}`}>
                    {file.status === 'processed' && (
                      <>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {getStatusLabel('processed')}
                      </>
                    )}
                    {file.status !== 'processed' && getStatusLabel(file.status)}
                  </span>
                </div>
                
                <div className="file-actions">
                  <button
                    type="button"
                    className="file-action-btn view-btn"
                    onClick={() => handleViewFile(file)}
                    title={viewButtonText || 'View file'}
                  >
                    {viewButtonText || 'View'}
                  </button>
                  <button
                    type="button"
                    className="file-action-btn remove-btn"
                    onClick={() => handleRemoveFile(file)}
                    title={removeButtonText || 'Remove file'}
                  >
                    {removeButtonText || 'Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;

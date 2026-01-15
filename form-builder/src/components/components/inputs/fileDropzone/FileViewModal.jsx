import React from 'react';
import './FileViewModal.css';

/**
 * FileViewModal Component
 * A modal for previewing/viewing uploaded files
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {Object} props.file - File object to preview
 * @param {string} props.closeButtonText - Text for close button
 */
const FileViewModal = ({ isOpen, onClose, file, closeButtonText }) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Create blob URL for file preview
  const fileUrl = file?.file ? URL.createObjectURL(file.file) : null;

  // Determine file type for rendering
  const isPDF = file?.type === 'application/pdf';
  const isImage = file?.type?.startsWith('image/');
  const isText = file?.type?.startsWith('text/');
  const isWord = file?.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 file?.type === 'application/msword';

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (isFullscreen) {
          setIsFullscreen(false); // Exit fullscreen first
        } else {
          onClose(); // Then close modal
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isFullscreen, onClose]);

  // Reset fullscreen when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false);
    }
  }, [isOpen]);

  // Cleanup blob URL on unmount
  React.useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  // Don't render if modal is not open or no file
  if (!isOpen || !file) return null;

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="file-view-modal-overlay" onClick={handleBackdropClick}>
      <div className={`file-view-modal ${isFullscreen ? 'fullscreen' : ''}`}>
        {/* Modal Header */}
        <div className="file-view-modal-header">
          <div className="file-view-modal-title">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12.5 2.5H5C4.46957 2.5 3.96086 2.71071 3.58579 3.08579C3.21071 3.46086 3 3.96957 3 4.5V15.5C3 16.0304 3.21071 16.5391 3.58579 16.9142C3.96086 17.2893 4.46957 17.5 5 17.5H15C15.5304 17.5 16.0391 17.2893 16.4142 16.9142C16.7893 16.5391 17 16.0304 17 15.5V7.5L12.5 2.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.5 2.5V7.5H17"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{file?.name}</span>
          </div>
          <div className="file-view-modal-actions">
            <button 
              className="file-view-modal-action-btn" 
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M7.5 2.5H2.5V7.5M12.5 2.5H17.5V7.5M7.5 17.5H2.5V12.5M12.5 17.5H17.5V12.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2.5 7.5V2.5H7.5M17.5 7.5V2.5H12.5M2.5 12.5V17.5H7.5M17.5 12.5V17.5H12.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <button 
              className="file-view-modal-close" 
              onClick={onClose}
              aria-label="Close modal"
            >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            </button>
          </div>
        </div>

        {/* File Info */}
        <div className="file-view-modal-info">
          <span className="file-info-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 4V8L10.5 9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Size: {formatFileSize(file?.size || 0)}
          </span>
          <span className="file-info-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 2V8M8 8L11 5M8 8L5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Type: {file?.type || 'Unknown'}
          </span>
        </div>

        {/* File Content */}
        <div className="file-view-modal-content">
          {isPDF && fileUrl && (
            <iframe
              src={fileUrl}
              title={file.name}
              className="file-preview-iframe"
            />
          )}

          {isImage && fileUrl && (
            <div className="file-preview-image-container">
              <img
                src={fileUrl}
                alt={file.name}
                className="file-preview-image"
              />
            </div>
          )}

          {isText && fileUrl && (
            <iframe
              src={fileUrl}
              title={file.name}
              className="file-preview-iframe"
            />
          )}

          {isWord && (
            <div className="file-preview-unsupported">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M40 8H16C14.9391 8 13.9217 8.42143 13.1716 9.17157C12.4214 9.92172 12 10.9391 12 12V52C12 53.0609 12.4214 54.0783 13.1716 54.8284C13.9217 55.5786 14.9391 56 16 56H48C49.0609 56 50.0783 55.5786 50.8284 54.8284C51.5786 54.0783 52 53.0609 52 52V20L40 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M40 8V20H52"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="unsupported-title">Preview not available</p>
              <p className="unsupported-description">
                Word documents cannot be previewed in the browser.
              </p>
            </div>
          )}

          {!isPDF && !isImage && !isText && !isWord && (
            <div className="file-preview-unsupported">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M40 8H16C14.9391 8 13.9217 8.42143 13.1716 9.17157C12.4214 9.92172 12 10.9391 12 12V52C12 53.0609 12.4214 54.0783 13.1716 54.8284C13.9217 55.5786 14.9391 56 16 56H48C49.0609 56 50.0783 55.5786 50.8284 54.8284C51.5786 54.0783 52 53.0609 52 52V20L40 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M40 8V20H52"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="unsupported-title">Preview not available</p>
              <p className="unsupported-description">
                This file type cannot be previewed in the browser.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FileViewModal;

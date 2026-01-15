import React from 'react';
import { formatFileSize, formatTimeAgo, getStatusLabel } from '../utils/fileFormatters';

/**
 * FileList Component
 * Displays list of uploaded files with actions
 */
const FileList = ({
  files,
  onViewFile,
  onRemoveFile,
  uploadedSectionTitle,
  viewButtonText,
  removeButtonText,
  statusLabels,
}) => {
  if (files.length === 0) return null;

  return (
    <div className="uploaded-documents-section">
      <h4 className="uploaded-documents-title">
        {uploadedSectionTitle || 'Uploaded Documents'}
      </h4>
      
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
                    {getStatusLabel('processed', statusLabels)}
                  </>
                )}
                {file.status !== 'processed' && getStatusLabel(file.status, statusLabels)}
              </span>
            </div>
            
            <div className="file-actions">
              <button
                type="button"
                className="file-action-btn view-btn"
                onClick={() => onViewFile(file)}
                title={viewButtonText || 'View file'}
              >
                {viewButtonText || 'View'}
              </button>
              <button
                type="button"
                className="file-action-btn remove-btn"
                onClick={() => {
                  const confirmDelete = window.confirm(
                    `Would you like to delete "${file.name}"?`
                  );
                  if (confirmDelete) {
                    onRemoveFile(file);
                  }
                }}
                title={removeButtonText || 'Remove file'}
              >
                {removeButtonText || 'Remove'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;

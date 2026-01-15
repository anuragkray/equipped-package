import React from 'react';
import { getAcceptedTypesDisplay } from '../utils/fileFormatters';

/**
 * Dropzone Component
 * The drag and drop area for file upload
 */
const Dropzone = ({
  isDragging,
  disabled,
  acceptedFileTypes,
  maxFileSize,
  dropzoneText,
  buttonText,
  mimeTypeMap,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  fileInputRef,
  onFileInputChange,
  multiple,
  getAcceptAttribute,
}) => {
  return (
    <div
      className={`file-dropzone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={onFileInputChange}
        accept={getAcceptAttribute()}
        multiple={multiple}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      
      <div className="dropzone-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M32 54V24M32 24L22 34M32 24L42 34"
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
        Supported: {getAcceptedTypesDisplay(acceptedFileTypes, mimeTypeMap)}
        {maxFileSize ? ` (max ${maxFileSize}MB per file)` : ''}
      </p>
      
      <button 
        type="button" 
        className="dropzone-button" 
        onClick={(e) => { 
          e.stopPropagation(); 
          onClick(); 
        }}
      >
        {buttonText || 'Choose Files'}
      </button>
    </div>
  );
};

export default Dropzone;

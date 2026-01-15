import React, { useState, useRef, useCallback } from 'react';
import { alertError } from '../../../utils/alert.jsx';
import './FileDropzone.css';

// Hooks
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useFileModal } from './hooks/useFileModal';

// Components
import Dropzone from './components/Dropzone';
import OCRToggle from './components/OCRToggle';
import FileList from './components/FileList';
import FileViewModal from './FileViewModal';

// Utils
import { validateFile, processFiles } from './utils/fileValidation';
import { getAcceptedTypesDisplay, getAcceptAttribute } from './utils/fileFormatters';

/**
 * FileDropzone Component
 * A fully dynamic and reusable drag-and-drop file upload component
 * Designed to be controlled by parent component for API integration
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
  const [ocrEnabled, setOCREnabled] = useState(false);
  const fileInputRef = useRef(null);

  // Custom hooks
  const { viewModalOpen, selectedFile, handleViewFile, handleCloseModal } = useFileModal();

  // Handle file selection and validation
  const handleFiles = useCallback((fileList) => {
    if (disabled) return;

    const getDisplayTypes = () => getAcceptedTypesDisplay(acceptedFileTypes, mimeTypeMap);
    const validateFn = (file) => validateFile(file, acceptedFileTypes, maxFileSize, getDisplayTypes);
    
    const { validFiles, errors } = processFiles(fileList, validateFn);

    // Show errors
    if (errors.length > 0) {
      errors.forEach(({ fileName, errors: fileErrors }) => {
        alertError(`${fileName}:\n${fileErrors.join('\n')}`, 'File Validation Error');
      });
    }

    // Send valid files to parent
    if (validFiles.length > 0) {
      const filesToSend = multiple ? validFiles : [validFiles[0]];
      if (onFilesSelected) {
        onFilesSelected(filesToSend);
      }
    }
  }, [disabled, acceptedFileTypes, maxFileSize, multiple, mimeTypeMap, onFilesSelected]);

  // Drag and drop handlers
  const dragDropHandlers = useDragAndDrop(disabled, handleFiles);

  // File input handlers
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleBrowseClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // OCR toggle handler
  const handleOCRToggleChange = (e) => {
    const checked = e.target.checked;
    setOCREnabled(checked);
    if (onOCRToggle) {
      onOCRToggle(checked);
    }
  };

  return (
    <div className="file-dropzone-container">
      {label && <h3 className="file-dropzone-label">{label}</h3>}
      
      <Dropzone
        isDragging={dragDropHandlers.isDragging}
        disabled={disabled}
        acceptedFileTypes={acceptedFileTypes}
        maxFileSize={maxFileSize}
        dropzoneText={dropzoneText}
        buttonText={buttonText}
        mimeTypeMap={mimeTypeMap}
        onDragEnter={dragDropHandlers.handleDragEnter}
        onDragOver={dragDropHandlers.handleDragOver}
        onDragLeave={dragDropHandlers.handleDragLeave}
        onDrop={dragDropHandlers.handleDrop}
        onClick={handleBrowseClick}
        fileInputRef={fileInputRef}
        onFileInputChange={handleFileInputChange}
        multiple={multiple}
        getAcceptAttribute={() => getAcceptAttribute(acceptedFileTypes)}
      />

      {showOCRToggle && (
        <OCRToggle
          ocrEnabled={ocrEnabled}
          onOCRToggle={handleOCRToggleChange}
          disabled={disabled}
          ocrToggleText={ocrToggleText}
          ocrTooltip={ocrTooltip}
        />
      )}

      <FileViewModal
        isOpen={viewModalOpen}
        onClose={handleCloseModal}
        file={selectedFile}
        closeButtonText={closeButtonText}
      />

      <FileList
        files={files}
        onViewFile={handleViewFile}
        onRemoveFile={onFileRemove}
        uploadedSectionTitle={uploadedSectionTitle}
        viewButtonText={viewButtonText}
        removeButtonText={removeButtonText}
        statusLabels={statusLabels}
      />
    </div>
  );
};

export default FileDropzone;

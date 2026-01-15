import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for handling drag and drop functionality
 * @param {boolean} disabled - Whether drag and drop is disabled
 * @param {Function} onFilesDropped - Callback when files are dropped
 * @returns {Object} Drag and drop handlers and state
 */
export const useDragAndDrop = (disabled, onFilesDropped) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled) {
      dragCounter.current += 1;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled) {
      dragCounter.current -= 1;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    }
  }, [disabled]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set dropEffect to show the correct cursor
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current = 0;
    setIsDragging(false);

    if (!disabled) {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onFilesDropped(files);
      }
    }
  }, [disabled, onFilesDropped]);

  return {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
};

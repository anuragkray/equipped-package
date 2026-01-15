import { useState, useCallback } from 'react';

/**
 * Custom hook for managing file view modal state
 * @returns {Object} Modal state and handlers
 */
export const useFileModal = () => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleViewFile = useCallback((file) => {
    setSelectedFile(file);
    setViewModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setViewModalOpen(false);
    setSelectedFile(null);
  }, []);

  return {
    viewModalOpen,
    selectedFile,
    handleViewFile,
    handleCloseModal,
  };
};

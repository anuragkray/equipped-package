import React, { useState } from 'react';

const PaginationFooter = ({ total = 0, limit = 25, offset = 1, onPageChange, onLimitChange }) => {
  const [currentLimit, setCurrentLimit] = useState(limit);

  if (!total || total <= 0) {
    return null;
  }

  const pageSizeOptions = [5, 10, 15, 25, 50, 100, 200, 500, 1000];
  const totalPages = Math.ceil(total / currentLimit);
  // offset is page number (1, 2, 3...), not record position
  const currentPage = offset;

  const handlePageOffset = (newOffset) => {
    if (onPageChange) {
      onPageChange(newOffset);
    }
  };

  const handlePageLimit = (event) => {
    const value = Number(event.target.value);
    setCurrentLimit(value);
    if (onLimitChange) {
      onLimitChange(value, 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      // Go to previous page number
      handlePageOffset(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      // Go to next page number
      handlePageOffset(currentPage + 1);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '16px' }}>
      <div style={{ fontSize: '14px', padding: '2px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#333333' }}>Show</span>
        <select
          value={currentLimit}
          style={{
            borderRadius: '4px',
            padding: '4px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #d0d0d0',
            color: '#333333',
            cursor: 'pointer',
          }}
          onChange={handlePageLimit}
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span style={{ color: '#333333' }}>of {total}</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          style={{
            padding: '8px 12px',
            border: '1px solid #d0d0d0',
            borderRadius: '4px',
            backgroundColor: currentPage === 1 ? '#f5f5f5' : '#ffffff',
            color: '#333333',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
          }}
        >
          Previous
        </button>
        <span style={{ color: '#333333' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          style={{
            padding: '8px 12px',
            border: '1px solid #d0d0d0',
            borderRadius: '4px',
            backgroundColor: currentPage >= totalPages ? '#f5f5f5' : '#ffffff',
            color: '#333333',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage >= totalPages ? 0.5 : 1,
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginationFooter;

import React from 'react';

/**
 * OCRToggle Component
 * Toggle switch for enabling/disabling OCR functionality
 */
const OCRToggle = ({ 
  ocrEnabled, 
  onOCRToggle, 
  disabled,
  ocrToggleText,
  ocrTooltip,
}) => {
  return (
    <div className="ocr-toggle-container">
      <label className="ocr-toggle-label">
        <input
          type="checkbox"
          className="ocr-toggle-input"
          checked={ocrEnabled}
          onChange={onOCRToggle}
          disabled={disabled}
        />
        <span className="ocr-toggle-slider"></span>
        <span className="ocr-toggle-text">
          {ocrToggleText || 'Enable OCR Auto-Extract'}
        </span>
        <span 
          className="ocr-info-icon" 
          title={ocrTooltip || 'Automatically extract text from uploaded documents'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 7V11M8 5V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </span>
      </label>
    </div>
  );
};

export default OCRToggle;

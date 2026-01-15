import { useState, useEffect, useCallback } from 'react';
import './AmountInput.css';

/**
 * AmountInput Component
 * - Auto-formats values with commas (e.g., 1000000 → 1,000,000)
 * - Supports shorthand inputs: K (thousand), M (million), B (billion)
 * - Stores raw numeric value for backend
 */
const AmountInput = ({
  value,
  onChange,
  name,
  placeholder = 'Enter amount',
  disabled = false,
  className = '',
  hasError = false,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Format number with commas
  const formatWithCommas = (num) => {
    if (num === '' || num === null || num === undefined) return '';
    const parts = String(num).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  // Remove commas from string
  const removeCommas = (str) => {
    return String(str || '').replace(/,/g, '');
  };

  // Parse shorthand values (K, M, B)
  const parseShorthand = (input) => {
    if (!input || typeof input !== 'string') return input;
    
    const cleanInput = input.toUpperCase().trim();
    const match = cleanInput.match(/^([\d,.]+)\s*([KMB]?)$/);
    
    if (!match) return removeCommas(input);
    
    const numStr = removeCommas(match[1]);
    const num = parseFloat(numStr);
    
    if (isNaN(num)) return '';
    
    const suffix = match[2];
    switch (suffix) {
      case 'K':
        return String(num * 1000);
      case 'M':
        return String(num * 1000000);
      case 'B':
        return String(num * 1000000000);
      default:
        return String(num);
    }
  };

  // Initialize display value from prop
  useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      const numValue = removeCommas(String(value));
      if (!isNaN(parseFloat(numValue))) {
        setDisplayValue(formatWithCommas(numValue));
      } else {
        setDisplayValue(String(value));
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  // Handle input change
  const handleChange = useCallback((e) => {
    const inputValue = e.target.value;
    
    // Allow typing shorthand (K, M, B) at the end
    const lastChar = inputValue.slice(-1).toUpperCase();
    const isShorthand = ['K', 'M', 'B'].includes(lastChar);
    
    if (isShorthand) {
      // Parse and expand shorthand immediately
      const parsed = parseShorthand(inputValue);
      if (parsed && !isNaN(parseFloat(parsed))) {
        setDisplayValue(formatWithCommas(parsed));
        onChange(parsed);
      }
      return;
    }
    
    // Remove non-numeric characters except comma and decimal
    const cleanValue = inputValue.replace(/[^0-9.,]/g, '');
    
    // Prevent multiple decimals
    const parts = cleanValue.split('.');
    let sanitized = parts[0];
    if (parts.length > 1) {
      sanitized += '.' + parts.slice(1).join('');
    }
    
    // Update display with commas
    const withoutCommas = removeCommas(sanitized);
    if (withoutCommas === '' || withoutCommas === '.') {
      setDisplayValue(sanitized);
      onChange('');
      return;
    }
    
    // Format and update
    const formatted = formatWithCommas(withoutCommas);
    setDisplayValue(formatted);
    
    // Send raw numeric value to parent
    onChange(withoutCommas);
  }, [onChange]);

  // Handle blur - ensure proper formatting
  const handleBlur = useCallback(() => {
    if (displayValue) {
      const numValue = removeCommas(displayValue);
      if (!isNaN(parseFloat(numValue))) {
        setDisplayValue(formatWithCommas(numValue));
      }
    }
  }, [displayValue]);

  return (
    <div className="amount-input-wrapper">
      <input
        type="text"
        inputMode="decimal"
        name={name}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`amount-input ${className} ${hasError ? 'amount-input-error' : ''} ${disabled ? 'amount-input-disabled' : ''}`}
        autoComplete="off"
        {...props}
      />
      <span className="amount-input-hint">
        Supports: 1K, 1M, 1B
      </span>
    </div>
  );
};

export default AmountInput;

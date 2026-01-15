import React, { useMemo, useEffect, useState } from 'react';
import Select from 'react-select';
import { useTheme } from '../../../themes/ThemeProvider';

const SelectField = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  isMulti = false,
  isDisabled = false,
  isLoading = false,
  isClearable = true,
  isSearchable = true,
  className = '',
  classNamePrefix = '',
  formatOptionLabel,
  hasError = false,
  isLocked = false, // Visual disabled style but still interactive
  ...props
}) => {
  const theme = typeof useTheme === 'function' ? useTheme() : null;
  const darkMode = theme?.darkMode ?? false;
  
  // Get theme colors from CSS variables
  const [primaryColor, setPrimaryColor] = useState(darkMode ? '#6366f1' : '#3b82f6');
  const [primaryColorDark, setPrimaryColorDark] = useState(darkMode ? '#4f46e5' : '#2563eb');
  
  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const primary = rootStyles.getPropertyValue('--primary-color').trim();
    const primaryDark = rootStyles.getPropertyValue('--primary-color-dark').trim();
    if (primary) setPrimaryColor(primary);
    if (primaryDark) setPrimaryColorDark(primaryDark);
  }, [darkMode]);

  // Apply locked styling when isLocked is true OR isDisabled is true
  const isLockedOrDisabled = isLocked || isDisabled;

  const customStyles = useMemo(() => ({
    control: (provided, state) => ({
      ...provided,
      backgroundColor: hasError 
        ? (darkMode ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2')
        : isLockedOrDisabled
          ? (darkMode ? '#1f2937' : '#f5f5f5') // Disabled/locked background
          : (darkMode ? '#2a2f36' : 'white'),
      borderColor: hasError
        ? '#ef4444'
        : isLockedOrDisabled
          ? (darkMode ? '#374151' : '#d1d5db') // Disabled border
        : state.isFocused
          ? primaryColor
            : darkMode ? '#4b5563' : '#d0d0d0',
      boxShadow: hasError 
        ? `0 0 0 2px rgba(239, 68, 68, 0.2)`
        : state.isFocused 
          ? `0 0 0 2px rgba(59, 130, 246, 0.2)`
        : 'none',
      '&:hover': {
        borderColor: hasError ? '#ef4444' : isLockedOrDisabled ? (darkMode ? '#4b5563' : '#9ca3af') : primaryColor,
      },
      minHeight: '40px',
      cursor: isLockedOrDisabled ? 'not-allowed' : 'pointer',
    }),
    input: (provided) => ({
      ...provided,
      color: isLockedOrDisabled 
        ? (darkMode ? '#6b7280' : '#9ca3af') // Muted text for disabled
        : (darkMode ? '#e5e7eb' : '#1a1a1a'),
    }),
    placeholder: (provided) => ({
      ...provided,
      color: darkMode ? '#9ca3af' : '#999999',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isLockedOrDisabled 
        ? (darkMode ? '#6b7280' : '#9ca3af') // Muted text for disabled
        : (darkMode ? '#e5e7eb' : '#1a1a1a'),
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: darkMode ? '#374151' : '#f0f0f0',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: darkMode ? '#e5e7eb' : '#333333',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: darkMode ? '#9ca3af' : '#666666',
      '&:hover': {
        backgroundColor: '#e74c3c',
        color: 'white',
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: darkMode ? '#2a2f36' : 'white',
      border: `1px solid ${darkMode ? '#4b5563' : '#d0d0d0'}`,
      borderRadius: '6px',
      boxShadow: darkMode 
        ? '0 8px 24px rgba(0, 0, 0, 0.4)'
        : '0 4px 12px rgba(0, 0, 0, 0.1)',
      zIndex: 10000,
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '4px',
      maxHeight: '300px',
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: darkMode ? '#1f2937' : '#f5f5f5',
      },
      '&::-webkit-scrollbar-thumb': {
        background: darkMode ? '#4b5563' : '#cccccc',
        borderRadius: '4px',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? primaryColor
        : state.isFocused
          ? darkMode ? '#374151' : '#f5f5f5'
          : 'transparent',
      color: state.isSelected ? '#ffffff' : darkMode ? '#e5e7eb' : '#1a1a1a',
      borderRadius: '4px',
      margin: '2px 0',
      '&:active': {
        backgroundColor: primaryColorDark,
      },
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 10000,
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: darkMode ? '#4b5563' : '#d0d0d0',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: darkMode ? '#9ca3af' : '#999999',
      '&:hover': {
        color: darkMode ? '#e5e7eb' : '#666666',
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: darkMode ? '#9ca3af' : '#999999',
      '&:hover': {
        color: '#e74c3c',
      },
    }),
  }), [darkMode, primaryColor, primaryColorDark, hasError, isLocked, isDisabled, isLockedOrDisabled]);

  return (
    <div className="w-full">
      <Select
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isMulti={isMulti}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isClearable={isClearable}
        isSearchable={isSearchable}
        styles={customStyles}
        className={className}
        classNamePrefix={classNamePrefix}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        menuShouldBlockScroll={false}
        formatOptionLabel={formatOptionLabel}
        getOptionLabel={(option) => option?.label || option?.name || String(option?.value ?? '')}
        getOptionValue={(option) => String(option?.value ?? '')}
        {...props}
      />
    </div>
  );
};

export default SelectField;


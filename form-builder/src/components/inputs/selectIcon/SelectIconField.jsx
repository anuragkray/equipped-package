import React, { useMemo, useState, useRef, useEffect } from 'react';
import { AddressBook, Briefcase, Building, CalendarBlank, CalendarCheck, ChartLineUp, House } from '@phosphor-icons/react';
import './SelectIconField.css';

const SelectIconField = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const iconOptions = useMemo(() => {
    const icons = { House, Briefcase, ChartLineUp, AddressBook, Building, CalendarBlank, CalendarCheck };
    return Object.entries(icons)
      .filter(([_, Icon]) =>
        typeof Icon === 'function' ||
        (typeof Icon === 'object' && typeof Icon?.render === 'function')
      )
      .map(([name, Icon]) => ({
        label: name,
        value: name,
        icon: Icon,
      }));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const selectedOption = value 
    ? iconOptions.find(opt => opt.value === (value.value || value))
    : null;
  const SelectedIcon = selectedOption?.icon;

  return (
    <div className="select-icon-field" ref={dropdownRef}>
      <div
        className="select-icon-trigger"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        {selectedOption ? (
          <div className="select-icon-selected">
            <SelectedIcon size={20} weight="regular" />
            <span>{selectedOption.label}</span>
          </div>
        ) : (
          <span className="select-icon-placeholder">Select an icon</span>
        )}
        <span className="select-icon-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className="select-icon-dropdown">
          {iconOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.value}
                className={`select-icon-option ${selectedOption?.value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(option);
                  }
                }}
              >
                <IconComponent size={20} weight="regular" />
                <span>{option.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelectIconField;


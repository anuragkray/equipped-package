import React from 'react';
import SelectField from './SelectField';

const SearchInput = ({ disabled, handleSelect = () => { }, options, selectedValue, placeholder = "Select an option...", className = "" }) => {
  return (
    <SelectField
      isDisabled={disabled}
      value={options?.find(option => option.value === selectedValue)}
      options={options}
      placeholder={placeholder}
      isClearable
      onChange={selected => handleSelect(selected)}
      className={className}
    />
  );
};

export default SearchInput;


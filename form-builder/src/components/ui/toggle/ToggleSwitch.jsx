import React from 'react';
import './ToggleSwitch.css';

/**
 * Reusable Toggle Switch component
 * Props:
 * - checked: boolean - current state
 * - onChange: function(event) - change handler
 * - label: string|node - optional label to render on the right
 * - disabled: boolean - disable interactions
 * - name/id/className: passthrough attributes
 */
const ToggleSwitch = ({
  checked = false,
  onChange = () => {},
  label,
  disabled = false,
  name,
  id,
  className = '',
}) => {
  return (
    <label className={`toggle-switch ${disabled ? 'toggle-switch--disabled' : ''} ${className}`}>
      <input
        type="checkbox"
        className="toggle-switch__input"
        checked={Boolean(checked)}
        onChange={onChange}
        disabled={disabled}
        name={name}
        id={id}
      />
      <span className="toggle-switch__slider" aria-hidden="true" />
      {label && <span className="toggle-switch__label">{label}</span>}
    </label>
  );
};

export default ToggleSwitch;

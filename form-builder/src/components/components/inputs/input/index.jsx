import React, { forwardRef } from 'react';
import './Input.css';

export const InputField = forwardRef(({
    className = '',
    onChange = () => {},
    name = '',
    id = '',
    placeholder = '',
    type = 'text',
    value = '',
    defaultValue = '',
    register = () => {},
    validationRules = {},
    readOnly = false,
    disabled = false,
    autoComplete = 'off',
    ...rest
}, ref) => {
    // Use controlled (value) if value prop is provided (even if empty string), otherwise use uncontrolled (defaultValue)
    const inputProps = value !== undefined
        ? { value: value || '' }
        : (defaultValue !== undefined ? { defaultValue } : {});

    return (
        <input
            {...(!readOnly && register(name, validationRules))}
            placeholder={placeholder}
            className={`input-field ${readOnly ? 'input-readonly' : ''} ${className}`}
            onChange={onChange}
            type={type}
            id={id}
            name={name}
            {...inputProps}
            ref={ref}
            readOnly={readOnly}
            disabled={disabled}
            autoComplete={autoComplete}
            {...rest}
        />
    );
});

InputField.displayName = 'InputField';

export const TextareaField = ({
    className = '',
    onChange = () => { },
    name = '',
    id = '',
    placeholder = '',
    rows = 2,
    value = '',
    register = () => { },
    validationRules = {},
    ...rest
}) => {
    return (
        <textarea
            rows={rows}
            placeholder={placeholder}
            className={`textarea-field ${className}`}
            onChange={onChange}
            id={id}
            name={name}
            value={value}
            {...register(name, validationRules)}
            {...rest}
        />
    );
};


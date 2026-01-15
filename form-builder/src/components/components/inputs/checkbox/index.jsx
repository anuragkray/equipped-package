import React, { forwardRef, useId } from "react";

const sizeMap = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
};

const Checkbox = forwardRef(({
    id,
    name,
    checked,
    defaultChecked,
    onChange,
    disabled = false,
    label,
    helperText,
    className = "",
    labelClassName = "",
    helperClassName = "",
    containerClassName = "",
    size = "md",
    type = "checkbox",
    ...rest
}, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;
    const dimensionClasses = sizeMap[size] ?? sizeMap.md;
    const isControlled = typeof checked !== "undefined";
    const controlledProps = {};
    if (isControlled) {
        controlledProps.checked = checked;
    }
    if (typeof defaultChecked !== "undefined") {
        controlledProps.defaultChecked = defaultChecked;
    }
    const isDisabled = Boolean(disabled);

    return (
        <label
            htmlFor={checkboxId}
            className={`inline-flex items-start gap-2 ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${containerClassName}`}
        >
            <span className="relative flex items-center justify-center">
                <input
                    id={checkboxId}
                    ref={ref}
                    name={name}
                    type={type}
                    onChange={onChange}
                    disabled={disabled}
                    className={`${dimensionClasses} peer rounded border transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 ${isDisabled ? "bg-gray-100 border-gray-200" : "cursor-pointer hover:shadow-md"} ${className} ${isControlled && checked ? "bg-primary border-primary" : ""}`}
                    {...controlledProps}
                    {...rest}
                />
                <span
                    className="pointer-events-none absolute inset-0 flex items-center justify-center text-white opacity-0 scale-90 transition duration-150 ease-out peer-checked:opacity-100 peer-checked:scale-100"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                </span>
            </span>
            {(label || helperText) && (
                <span className="flex flex-col">
                    {label && (
                        <span className={`text-sm font-medium text-textTertiary ${labelClassName}`}>
                            {label}
                        </span>
                    )}
                    {helperText && (
                        <span className={`text-xs text-gray-500 ${helperClassName}`}>
                            {helperText}
                        </span>
                    )}
                </span>
            )}
        </label>
    );
});

Checkbox.displayName = "Checkbox";

export default Checkbox;


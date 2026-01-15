import React from 'react';

const CancelButton = ({
    type = "button",
    disabled,
    load,
    children,
    onClick = () => { },
    className = '',
    style = {}
}) => {
    const hasBgOverride = /(?:^|\s)(?:!bg-|bg-)/.test(className) || (style && typeof style.background !== 'undefined');
    const hasTextOverride = /(?:^|\s)(?:!text-|text-)/.test(className) || (style && typeof style.color !== 'undefined');

    const defaultStyle = {
        ...(hasBgOverride ? {} : { background: 'transparent' }),
        ...(hasTextOverride ? {} : { color: 'var(--button-secondary-text, var(--surface-nav-selected2-color, #308BE0))' }),
    };

    return (
        <button
            onClick={onClick}
            type={type}
            disabled={disabled}
            className={`align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-2 px-6 rounded-lg hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] dark:bg-[#171819] ${className}`}
            style={{ ...defaultStyle, ...style }}
        >
            {load ? "Processing..." : children}
        </button>
    );
};

export default CancelButton;

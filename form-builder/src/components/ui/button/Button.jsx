import React from 'react';

const Button = ({
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
        ...(hasBgOverride ? {} : {
            background: 'linear-gradient(180deg, var(--surface-nav-selected2-color, #308BE0) 0%, var(--surface-nav-selected1-color, #AFD2F3) 100%)'
        }),
        ...(hasTextOverride ? {} : {
            color: 'var(--button-text-color, #ffffff)'
        }),
    };

    const baseClasses = [
        'flex justify-start items-center text-nowrap space-x-2 align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-2 px-6 rounded-lg hover:shadow-lg focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none'
    ];

    if (className) {
        baseClasses.push(className);
    }

    return (
        <button
            onClick={onClick}
            type={type}
            disabled={disabled}
            className={baseClasses.join(' ')}
            style={{ ...defaultStyle, ...style }}
        >
            {load ? "Processing..." : children}
        </button>
    );
};

export default Button;


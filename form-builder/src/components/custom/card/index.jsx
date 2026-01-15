import React from 'react';

const Card = ({ children, className = '' }) => {
    return (
        <div className={`p-2 rounded-xl border border-surfaceCardStroke dark:bg-[#0E0E0F] dark:border-darkplaceholder/30 text-textPrimary dark:text-textdarkPrimary ${className}`}>
            {children}
        </div>
    );
};

export default Card;


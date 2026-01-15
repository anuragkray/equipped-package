import React from 'react';
import './IconButton.css';

const IconButton = ({ 
  children, 
  onClick, 
  title, 
  size = 10, 
  className = "", 
  disabled = false, 
  type = 'button' 
}) => {
  const buttonStyle = {
    width: `${size * 4}px`,
    height: `${size * 4}px`
  };

  return (
    <div className="icon-button-wrapper">
      <button
        disabled={disabled}
        onClick={onClick}
        type={type}
        className={`icon-button ${className}`}
        style={buttonStyle}
        title={title}
        aria-label={title}
      >
        {children}
      </button>
    </div>
  );
};

export default IconButton;

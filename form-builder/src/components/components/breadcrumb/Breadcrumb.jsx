import React from 'react';
import PropTypes from 'prop-types';
import './Breadcrumb.css';

/**
 * @param {Array} items - Array of breadcrumb items with structure: [{ label: string, onClick: function, isActive: boolean }]
 */
const Breadcrumb = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="breadcrumb-container">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.isActive ? (
            <span className="breadcrumb-item breadcrumb-item-active">
              {item.label}
            </span>
          ) : (
            <span 
              className="breadcrumb-item breadcrumb-item-link"
              onClick={item.onClick}
            >
              {item.label}
            </span>
          )}
          {index < items.length - 1 && <span className="breadcrumb-separator">›</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      isActive: PropTypes.bool,
    })
  ).isRequired,
};

export default Breadcrumb;

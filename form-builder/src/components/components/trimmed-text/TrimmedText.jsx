import React from 'react';

const TrimmedText = ({ text = '', numOfChar = 30, className = '' }) => {
  const getTrimmedText = () => {
    if (typeof text !== 'string') {
      return text ?? '';
    }
    if (text.length > numOfChar) {
      return `${text.slice(0, numOfChar)}...`;
    }
    return text;
  };

  const content = typeof text === 'string' && text.length > numOfChar ? text : '';

  return (
    <div className={className} title={content}>
      {getTrimmedText()}
    </div>
  );
};

export default TrimmedText;

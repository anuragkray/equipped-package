import React from 'react';

const DataNotFound = ({ moduleName = 'this module', className = '' }) => {
  return (
    <div className={`w-full h-full flex justify-center items-center ${className}`}>
      <p className="text-xl animate-pulse font-extrabold dark:text-textdarkPrimary">
        No record found!
      </p>
    </div>
  );
};

export default DataNotFound;

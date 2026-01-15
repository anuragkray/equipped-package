import React from 'react';

const Loader = ({ className = '', heading = 'Loading...', subHeading = 'We are preparing your content.' }) => {
  return (
    <div className={`scroll-container-thin w-full h-full rounded-lg relative overflow-x-auto flex justify-center items-center ${className}`}>
      <div className="text-center">
        <p className="text-xl animate-pulse font-extrabold text-gray-400 dark:text-primary">{heading}</p>
        <p className="text-sm font-semibold text-gray-800 dark:text-textdarkPrimary">{subHeading}</p>
      </div>
    </div>
  );
};

export default Loader;

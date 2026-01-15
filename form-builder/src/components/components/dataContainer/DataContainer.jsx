import React from 'react';
import Loader from '../loader/Loader';
import DataNotFound from '../dataNotFound/DataNotFound';

const DataContainer = ({
  loading = false,
  isDataPresent = true,
  children,
  moduleName,
  loaderClassName = '',
  notFoundClassName = '',
  loaderElement,
  notFoundElement,
}) => {
  if (loading) {
    return loaderElement ?? <Loader className={loaderClassName} />;
  }

  if (!isDataPresent) {
    return notFoundElement ?? (
      <DataNotFound moduleName={moduleName} className={notFoundClassName} />
    );
  }

  return <>{children}</>;
};

export default DataContainer;

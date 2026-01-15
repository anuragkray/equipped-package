import { useLocation } from 'react-router-dom';

const useParamsValue = () => {
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const searchParams = {};

  search.forEach((value, key) => {
    searchParams[key] = value;
  });

  return {
    pathname: location.pathname,
    search,
    searchParams,
    hash: location.hash,
    state: location.state,
    key: location.key,
  };
};

export default useParamsValue;


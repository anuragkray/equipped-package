const DEFAULT_BASE_PATH = '/form-builder';

export const getFormBuilderBasePath = () => {
  const basePath = window.__FORM_BUILDER_BASE_PATH__ || DEFAULT_BASE_PATH;
  return basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
};

export const buildFormBuilderPath = (suffix = '') => {
  const basePath = getFormBuilderBasePath();
  if (!suffix) return basePath;
  if (suffix.startsWith('?')) return `${basePath}${suffix}`;
  const normalized = suffix.startsWith('/') ? suffix : `/${suffix}`;
  return `${basePath}${normalized}`;
};

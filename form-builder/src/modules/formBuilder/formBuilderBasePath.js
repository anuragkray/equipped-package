const DEFAULT_BASE_PATH = '/form-builder';

export const getFormBuilderBasePath = () => {
  const basePath = window.__FORM_BUILDER_BASE_PATH__ || DEFAULT_BASE_PATH;
  return basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
};

export const buildFormBuilderPath = (suffix = '') => {
  const basePath = getFormBuilderBasePath();
  const orgParams = (() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    const orgId = params.get('orgId') || params.get('organizationId');
    if (!orgId) return '';
    return `orgId=${encodeURIComponent(orgId)}`;
  })();

  if (!suffix) {
    return orgParams ? `${basePath}?${orgParams}` : basePath;
  }

  if (suffix.startsWith('?')) {
    if (!orgParams) return `${basePath}${suffix}`;
    const hasOrg = /(^|[?&])orgId=|(^|[?&])organizationId=/i.test(suffix);
    return `${basePath}${suffix}${hasOrg ? '' : `&${orgParams}`}`;
  }

  const normalized = suffix.startsWith('/') ? suffix : `/${suffix}`;
  if (!orgParams) return `${basePath}${normalized}`;
  const joiner = normalized.includes('?') ? '&' : '?';
  const hasOrg = /(^|[?&])orgId=|(^|[?&])organizationId=/i.test(normalized);
  return `${basePath}${normalized}${hasOrg ? '' : `${joiner}${orgParams}`}`;
};

import React, { useEffect, useMemo, useState } from 'react';
import {
  MemoryRouter,
  Navigate,
  Route,
  Routes,
  useInRouterContext,
} from 'react-router-dom';
import FormBuilderScreen from './modules/formBuilder/FormBuilderScreen.jsx';
import FormBuilderCreateScreen from './modules/formBuilder/FormBuilderCreateScreen.jsx';
import { RuleEngineApiProvider } from './contexts/RuleEngineApiContext.jsx';
import { setExternalApiClient } from './services/apiClient.js';
import { setFormOrganizationId } from './services/formApi.js';

let globalStylesLoaded = false;
const ensureGlobalStyles = () => {
  if (globalStylesLoaded) return;
  globalStylesLoaded = true;
  import('./index.css');
  import('./App.css');
};

const normalizePath = (path) => {
  if (!path) return '/form-builder';
  return path.startsWith('/') ? path : `/${path}`;
};

const applyToken = (token, primaryKey, secondaryKey) => {
  if (!token) return;
  localStorage.setItem(primaryKey, token);
  if (secondaryKey && secondaryKey !== primaryKey) {
    localStorage.setItem(secondaryKey, token);
  }
};

const FormBuilderModule = ({
  apiBaseUrl,
  authToken,
  tokenStorageKey = 'accessToken',
  secondaryTokenKey = 'authToken',
  organizationId,
  disableGlobalStyles = false,
  themeClassName,
  wrapperClassName,
  initialPath = '/form-builder',
  basePath = '/form-builder',
  formBuilderApiClient,
  ruleEngineApiClient,
  ruleEngineComponent,
}) => {
  const [resolvedThemeClass, setResolvedThemeClass] = useState('');
  const initialEntry = useMemo(() => normalizePath(initialPath), [initialPath]);
  const resolvedBasePath = useMemo(
    () => normalizePath(basePath).replace(/\/+$/, '') || '/form-builder',
    [basePath],
  );
  const inRouter = useInRouterContext();

  useEffect(() => {
    if (formBuilderApiClient) {
      return;
    }
    if (apiBaseUrl) {
      window.__APP_API_BASE__ = apiBaseUrl;
    }
  }, [apiBaseUrl, formBuilderApiClient]);

  useEffect(() => {
    window.__FORM_BUILDER_BASE_PATH__ = resolvedBasePath;
  }, [resolvedBasePath]);

  useEffect(() => {
    if (formBuilderApiClient) {
      return;
    }
    applyToken(authToken, tokenStorageKey, secondaryTokenKey);
  }, [authToken, tokenStorageKey, secondaryTokenKey, formBuilderApiClient]);

  useEffect(() => {
    setExternalApiClient(formBuilderApiClient || null);
  }, [formBuilderApiClient]);

  useEffect(() => {
    setFormOrganizationId(organizationId);
  }, [organizationId]);

  useEffect(() => {
    if (disableGlobalStyles) return;
    ensureGlobalStyles();
  }, [disableGlobalStyles]);

  useEffect(() => {
    if (!wrapperClassName || typeof document === 'undefined') return;
    const className = 'fb-host-admin-modal';
    const darkClassName = 'dark';
    const rootEl = document.getElementById('root') || document.documentElement;
    const syncBodyTheme = () => {
      const isDark = rootEl?.classList?.contains('dark');
      if (isDark) {
        document.body.classList.add(darkClassName);
      } else {
        document.body.classList.remove(darkClassName);
      }
    };
    if (wrapperClassName.includes('fb-host-admin')) {
      document.body.classList.add(className);
      syncBodyTheme();
      const observer = new MutationObserver(syncBodyTheme);
      observer.observe(rootEl, { attributes: true, attributeFilter: ['class'] });
      return () => {
        document.body.classList.remove(className);
        document.body.classList.remove(darkClassName);
        observer.disconnect();
      };
    }
    return undefined;
  }, [wrapperClassName]);

  useEffect(() => {
    if (themeClassName !== undefined && themeClassName !== null) {
      setResolvedThemeClass(themeClassName);
      return;
    }
    const rootEl = document.getElementById('root') || document.documentElement;
    const updateTheme = () => {
      const isDark = rootEl?.classList?.contains('dark');
      setResolvedThemeClass(isDark ? 'dark' : '');
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(rootEl, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [themeClassName]);

  const wrapperClass = [
    'form-builder-scope',
    resolvedThemeClass,
    wrapperClassName,
  ]
    .filter(Boolean)
    .join(' ');

  if (inRouter) {
    return (
      <div className={wrapperClass}>
        <RuleEngineApiProvider apiClient={ruleEngineApiClient} RuleEngineModal={ruleEngineComponent}>
          <Routes>
            <Route index element={<FormBuilderScreen />} />
            <Route path="create" element={<FormBuilderCreateScreen />} />
            <Route path="*" element={<Navigate to="." replace />} />
          </Routes>
        </RuleEngineApiProvider>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <RuleEngineApiProvider apiClient={ruleEngineApiClient} RuleEngineModal={ruleEngineComponent}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path={resolvedBasePath} element={<FormBuilderScreen />} />
            <Route
              path={`${resolvedBasePath}/create`}
              element={<FormBuilderCreateScreen />}
            />
            <Route path="*" element={<Navigate to={resolvedBasePath} replace />} />
          </Routes>
        </MemoryRouter>
      </RuleEngineApiProvider>
    </div>
  );
};

export default FormBuilderModule;

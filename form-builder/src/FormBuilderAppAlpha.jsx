import React, { useEffect, useMemo } from 'react';
import {
  MemoryRouter,
  Navigate,
  Route,
  Routes,
  useInRouterContext,
} from 'react-router-dom';
import FormBuilderScreen from './modules/formBuilder/FormBuilderScreen.jsx';
import FormBuilderCreateScreen from './modules/formBuilder/FormBuilderCreateScreen.jsx';
import { RuleEngineApiProvider } from './contexts/RuleEngineApiContext.js';

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

const FormBuilderAppAlpha = ({
  apiBaseUrl,
  authToken,
  tokenStorageKey = 'accessToken',
  secondaryTokenKey = 'authToken',
  initialPath = '/form-builder',
  basePath = '/form-builder',
  ruleEngineApiClient,
}) => {
  const initialEntry = useMemo(() => normalizePath(initialPath), [initialPath]);
  const resolvedBasePath = useMemo(
    () => normalizePath(basePath).replace(/\/+$/, '') || '/form-builder',
    [basePath],
  );
  const inRouter = useInRouterContext();

  useEffect(() => {
    if (apiBaseUrl) {
      window.__APP_API_BASE__ = apiBaseUrl;
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    window.__FORM_BUILDER_BASE_PATH__ = resolvedBasePath;
  }, [resolvedBasePath]);

  useEffect(() => {
    applyToken(authToken, tokenStorageKey, secondaryTokenKey);
  }, [authToken, tokenStorageKey, secondaryTokenKey]);

  if (inRouter) {
    return (
      <RuleEngineApiProvider value={ruleEngineApiClient}>
        <Routes>
          <Route index element={<FormBuilderScreen />} />
          <Route path="create" element={<FormBuilderCreateScreen />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </RuleEngineApiProvider>
    );
  }

  return (
    <RuleEngineApiProvider value={ruleEngineApiClient}>
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
  );
};

export default FormBuilderAppAlpha;

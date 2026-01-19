# @equipped/form-builder

Form Builder UI package. Depends on `@equipped/rule-engine`.

## Install

From registry:

```json
{
  "dependencies": {
    "@equipped/form-builder": "^0.1.0",
    "@equipped/rule-engine": "^0.1.0"
  }
}
```

Local dev (file deps):

```json
{
  "dependencies": {
    "@equipped/form-builder": "file:../equipped-package/form-builder",
    "@equipped/rule-engine": "file:../equipped-package/rule-engine"
  }
}
```

## Usage

```jsx
import FormBuilderModule from '@equipped/form-builder';
import {
  getAuthHeaders,
  getMethodApiCall,
  postMethodApiCall,
  patchMethodApiCall,
  putMethodApiCall,
  deleteMethodApiCall,
} from 'your-app/services/apiClient';
import RuleEngineModule from '@equipped/rule-engine';

const formBuilderApiClient = {
  get: (path, options = {}) =>
    getMethodApiCall(path, getAuthHeaders(), options.query, options),
  post: (path, body, options = {}) =>
    postMethodApiCall(path, getAuthHeaders(), body, options.query, options),
  patch: (path, body, options = {}) =>
    patchMethodApiCall(path, getAuthHeaders(), body, options),
  put: (path, body, options = {}) =>
    putMethodApiCall(path, getAuthHeaders(), body, options),
  delete: (path, body, options = {}) =>
    deleteMethodApiCall(path, getAuthHeaders(), body, options),
};

const ruleEngineApiClient = {
  get: (path, options = {}) =>
    getMethodApiCall(path, getAuthHeaders(), options.query, options),
  post: (path, body, options = {}) =>
    postMethodApiCall(path, getAuthHeaders(), body, options.query, options),
  patch: (path, body, options = {}) =>
    patchMethodApiCall(path, getAuthHeaders(), body, options),
};

export default function FormBuilderHost() {
  return (
    <FormBuilderModule
      initialPath="/form-builder"
      basePath="/form-builder"
      formBuilderApiClient={formBuilderApiClient}
      ruleEngineApiClient={ruleEngineApiClient}
      ruleEngineComponent={RuleEngineModule}
    />
  );
}
```

## Usage by environment

### Standard app (no orgId)

```jsx
import FormBuilderModule from '@equipped/form-builder';
import RuleEngineModule from '@equipped/rule-engine';
import {
  getAuthHeaders,
  getMethodApiCall,
  postMethodApiCall,
  patchMethodApiCall,
  putMethodApiCall,
  deleteMethodApiCall,
} from './services/apiClient';

const formBuilderApiClient = {
  get: (path, options = {}) =>
    getMethodApiCall(path, getAuthHeaders(), options.query, options),
  post: (path, body, options = {}) =>
    postMethodApiCall(path, getAuthHeaders(), body, options.query, options),
  patch: (path, body, options = {}) =>
    patchMethodApiCall(path, getAuthHeaders(), body, options),
  put: (path, body, options = {}) =>
    putMethodApiCall(path, getAuthHeaders(), body, options),
  delete: (path, body, options = {}) =>
    deleteMethodApiCall(path, getAuthHeaders(), body, options),
};

export default function App() {
  return (
    <FormBuilderModule
      formBuilderApiClient={formBuilderApiClient}
      ruleEngineApiClient={formBuilderApiClient}
      ruleEngineComponent={RuleEngineModule}
    />
  );
}
```

### Admin app (orgId + scoped styles)

```jsx
import FormBuilderModule from '@equipped/form-builder';
import RuleEngineModule from '@equipped/rule-engine';
import { useLocation } from 'react-router-dom';
import {
  getMethodApiCall,
  postMethodApiCall,
  patchMethodApiCall,
  putMethodApiCall,
  deleteMethodApiCall,
} from './services/apiClient';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'x-auth-token': `bearer ${localStorage.getItem('accessToken')}`,
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
});

export default function AdminFormBuilder() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const organizationId = params.get('orgId') || params.get('organizationId') || '';

  const formBuilderApiClient = {
    get: (path, options = {}) =>
      getMethodApiCall(path, getAuthHeaders(), options.query, options),
    post: (path, body, options = {}) =>
      postMethodApiCall(path, getAuthHeaders(), body, options.query, options),
    patch: (path, body, options = {}) =>
      patchMethodApiCall(path, getAuthHeaders(), body, options),
    put: (path, body, options = {}) =>
      putMethodApiCall(path, getAuthHeaders(), body, options),
    delete: (path, body, options = {}) =>
      deleteMethodApiCall(path, getAuthHeaders(), body, options),
  };

  return (
    <FormBuilderModule
      organizationId={organizationId}
      formBuilderApiClient={formBuilderApiClient}
      ruleEngineApiClient={formBuilderApiClient}
      ruleEngineComponent={RuleEngineModule}
      disableGlobalStyles
      wrapperClassName="fb-host-admin"
    />
  );
}
```

### Required inputs and settings

- Recommended: pass `formBuilderApiClient` and `ruleEngineApiClient` so the host
  app controls base URL, headers, and auth.
- Fallback: pass `apiBaseUrl` and `authToken` and let the package manage tokens.
- If neither is provided, UI renders but API calls fail.

### Props (most used)

- `formBuilderApiClient`: `{ get, post, patch, put, delete }`
- `ruleEngineApiClient`: `{ get, post, patch }`
- `ruleEngineComponent`: pass `RuleEngineModule` to enable rule engine
- `apiBaseUrl`: only if you want package-managed API
- `authToken`: only if you want package-managed auth
- `tokenStorageKey`: defaults to `accessToken`
- `secondaryTokenKey`: defaults to `authToken`
- `organizationId`: optional; when set, form APIs use org-aware endpoints
- `initialPath`: optional; defaults to `/form-builder`
- `basePath`: optional; defaults to `/form-builder`
- `disableGlobalStyles`: optional; when true, package does not inject global CSS
- `themeClassName`: optional; pass `"dark"` to force dark theme
- `wrapperClassName`: optional; extra class on wrapper (use for host-specific styling)

## Development mode

This package exports `src` directly, so Vite can compile it without a prebuild.

1. Add local `file:` deps to the host app.
2. Run `npm install` in the host app.
3. Start the host app dev server.

If your host tooling requires built output, run `npm run build` inside this
package first.

## Production mode

Publish to your registry and install by version in the host app. The host app
build then bundles the package sources.

## Styling

By default the package ships global styles. You can disable them and scope the
UI inside `.form-builder-scope` to avoid affecting the host app.

Admin hosts can pass `wrapperClassName="fb-host-admin"` and override styles
in a targeted way without changing other hosts.

Example:

```jsx
<FormBuilderModule
  disableGlobalStyles
  wrapperClassName="fb-host-admin"
  themeClassName="dark"
/>
```

When `themeClassName` is not provided, the module auto-detects a `dark` class
on the host `#root` element.

## Rule Engine API control

The form builder uses `@equipped/rule-engine` internally. If you need the rule
engine to use a parent-managed API client, pass `ruleEngineApiClient` to
`FormBuilderModule`. To keep the module independent, pass the Rule Engine
component only when you want the feature:

```jsx
<FormBuilderModule ruleEngineComponent={RuleEngineModule} />
```

## Form Builder API control

To keep all API calls in the host app, pass `formBuilderApiClient`. When provided,
the package will use it for all API calls instead of the internal client.

### API helper structure (host app)

```ts
getAuthHeaders(): Record<string, string>;

getMethodApiCall(
  path: string,
  headers: Record<string, string>,
  query?: Record<string, string | number | boolean>,
  options?: { signal?: AbortSignal }
): Promise<{ statusCode: number; data: any }>;

postMethodApiCall(
  path: string,
  headers: Record<string, string>,
  body?: any,
  query?: Record<string, string | number | boolean>,
  options?: { signal?: AbortSignal }
): Promise<{ statusCode: number; data: any }>;

patchMethodApiCall(
  path: string,
  headers: Record<string, string>,
  body?: any,
  options?: { signal?: AbortSignal }
): Promise<{ statusCode: number; data: any }>;
```

Notes:
- `getAuthHeaders` should include your auth tokens.
- Return shape should include `{ statusCode, data }`.

## Organization-aware mode (admin)

If `organizationId` is provided, the package switches to org-aware form APIs:

- `GET /form/group/{organizationId}?offset=1&limit=10`
- `GET /form/get/{organizationId}?offset=1&limit=20&formTitle=...`
- `POST /form/create/{organizationId}`
- `PATCH /form/update/{formId}/{organizationId}`

Without `organizationId`, it uses the original endpoints (e.g. `/form/group`,
`/form/get`, `/form/create`, `/form/update/{id}`).

The module also preserves `orgId` in internal navigation URLs so create/edit
routes keep the org context.

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
- `initialPath`: optional; defaults to `/form-builder`
- `basePath`: optional; defaults to `/form-builder`

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

No styles are auto-imported from this package. Apply styles from the host app.

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

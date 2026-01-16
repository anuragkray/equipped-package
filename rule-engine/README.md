# @equipped/rule-engine

Rule Engine modal package.

## Install

From registry:

```json
{
  "dependencies": {
    "@equipped/rule-engine": "^0.1.0"
  }
}
```

Local dev (file deps):

```json
{
  "dependencies": {
    "@equipped/rule-engine": "file:../equipped-package/rule-engine"
  }
}
```

## Usage

```jsx
import RuleEngineModule from '@equipped/rule-engine';

<RuleEngineModule
  isOpen
  onClose={() => {}}
  initialData={{ formula: '' }}
  group="ModuleName"
  showRuleName={false}
  onSave={(formula) => {}}
/>;
```

## Configuration and settings

This module can use a host-managed API client or its internal API client.

### API base URL

- Set `window.__APP_API_BASE__` in the host app, or
- Set `VITE_API_BASE_URL` at build time.

If neither is set, it falls back to `http://localhost:3001`.

### Auth token

- Store a token in `localStorage` as `accessToken` or `authToken`, or
- Pass a host-managed `apiClient` (recommended).

### Parent-managed API (recommended)

You can inject API handlers from the host app to control auth, base URL, and headers.

```jsx
import {
  getAuthHeaders,
  getMethodApiCall,
  postMethodApiCall,
  patchMethodApiCall,
} from 'your-app/services/apiClient';

const apiClient = {
  get: (path, options = {}) =>
    getMethodApiCall(path, getAuthHeaders(), options.query, options),
  post: (path, body, options = {}) =>
    postMethodApiCall(path, getAuthHeaders(), body, options.query, options),
  patch: (path, body, options = {}) =>
    patchMethodApiCall(path, getAuthHeaders(), body, options),
};

<RuleEngineModule apiClient={apiClient} />;
```

If `apiClient` is not provided, the package falls back to its internal API client.

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

## Development mode

This package exports `src` directly, so Vite can compile it without a prebuild.

1. Add the local `file:` dep to the host app.
2. Run `npm install` in the host app.
3. Start the host app dev server.

If your host tooling requires built output, run `npm run build` inside this
package first.

## Production mode

Publish to your registry and install by version in the host app. The host app
build then bundles the package sources.

## Styling

No styles are auto-imported from this package. Apply styles from the host app.

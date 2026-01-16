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
import RuleEngineModal from '@equipped/rule-engine';

<RuleEngineModal
  isOpen
  onClose={() => {}}
  initialData={{ formula: '' }}
  group="ModuleName"
  showRuleName={false}
  onSave={(formula) => {}}
/>;
```

## Configuration

- API base URL: set `window.__APP_API_BASE__` in the host app, or set
  `VITE_API_BASE_URL` at build time.
- Auth token: store in `localStorage` as `accessToken` or `authToken`.

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

<RuleEngineModal apiClient={apiClient} />;
```

If `apiClient` is not provided, the package falls back to its internal API client.

## Development mode

Run the host app that renders this package.

1. Add the local `file:` dep to the host app.
2. `npm install` in the host app.
3. Start the host app dev server.

Changes in `equipped-package/rule-engine/src` will be reflected.

## Production mode

Publish to your registry and install by version in the host app.

## Styling

No styles are auto-imported from this package. Apply styles from the host app.

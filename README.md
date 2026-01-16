# Equipped UI Packages or Module

This folder contains the shared UI modules used by the main app and other consumers.

## Packages/Module

- `@equipped/form-builder`: Form builder UI and flows.
- `@equipped/rule-engine`: Rule engine modal and helpers.

## Using these packages

In any app, install from a registry (GitHub Packages/Azure Artifacts) or use local file deps.

Local file deps example:

```json
{
  "dependencies": {
    "@equipped/form-builder": "file:../equipped-package/form-builder",
    "@equipped/rule-engine": "file:../equipped-package/rule-engine"
  }
}
```

Then import and render the components in your app.

## Development mode (local)

These packages export `src` directly (see `package.json`), so Vite can compile
them without a prebuild.

1. Add local `file:` deps in your host app.
2. Run `npm install` in the host app.
3. Start the host app dev server (Vite/React).

Optional: if your host tooling needs built output, run:

```
npm install --prefix ../equipped-package/rule-engine
npm run build --prefix ../equipped-package/rule-engine
npm install --prefix ../equipped-package/form-builder
npm run build --prefix ../equipped-package/form-builder
```

## Production mode

Publish packages to your registry and install them by version:

```json
{
  "dependencies": {
    "@equipped/form-builder": "^0.1.0",
    "@equipped/rule-engine": "^0.1.0"
  }
}
```

Then build and deploy the host app as usual.

## Settings required (local and production)

These packages rely on API base URL, auth tokens, and optional API clients.
The host app is responsible for providing one of the supported setups.

### API base URL

- Option A: set `VITE_API_BASE_URL` in the host app environment.
- Option B: set `window.__APP_API_BASE__` before rendering the app.
- Option C: pass `apiBaseUrl` to `@equipped/form-builder` (it sets the global).

### Auth tokens

- Store tokens in `localStorage` as `accessToken` or `authToken`, or
- Pass tokens via `@equipped/form-builder` props (`authToken`, `tokenStorageKey`,
  `secondaryTokenKey`).

### API control

- Recommended: pass `formBuilderApiClient` and `ruleEngineApiClient` from the
  host app. This gives full control over headers, base URL, and auth.
- Fallback: let packages use their internal API clients.

### API client shape (host-managed)

Your host app API helpers should follow this structure:

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
- `getAuthHeaders` must include auth tokens as required by your API.
- Return shape should include `{ statusCode, data }` (other fields are ignored).

## Host app integration (example)

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
      // Optional: defaults to "/form-builder"
      basePath="/form-builder"
      // Optional: defaults to "/form-builder"
      initialPath="/form-builder"
      formBuilderApiClient={formBuilderApiClient}
      ruleEngineApiClient={ruleEngineApiClient}
      ruleEngineComponent={RuleEngineModule}
    />
  );
}
```

## CI/CD publish

### GitHub Packages

- Workflow: `.github/workflows/publish-github-packages.yml` (inside the `equipped-package` repo)
- Triggers: `workflow_dispatch` or git tags matching `v*`
- Requirements:
  - The package scope `@equipped` must match your GitHub org/user.
  - `packages:write` permission (uses `GITHUB_TOKEN`).
  - This workflow runs from the `equipped-package` repo root.

### Azure Artifacts

- Pipeline: `equipped-package/azure-pipelines.yml`
- Requirements:
  - Replace `<org>/<project>/<feed>` in the file.
  - Enable “Allow scripts to access OAuth token” so `$(System.AccessToken)` works.
  - Ensure the feed allows package publish.

## When modules work vs. when they do not

- Works with API access when:
  - `formBuilderApiClient` is provided, or
  - `apiBaseUrl` + `authToken` are provided.
- Rule Engine only runs when you pass `ruleEngineComponent`.
- API calls fail when no API client and no auth/base URL is provided.

## Styling

These packages do not auto-import styles. Apply styles from the host app.

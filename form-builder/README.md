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
import FormBuilderApp from '@equipped/form-builder';
import {
  getAuthHeaders,
  getMethodApiCall,
  postMethodApiCall,
  patchMethodApiCall,
} from 'your-app/services/apiClient';

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
    <FormBuilderApp
      apiBaseUrl="http://localhost:3001"
      authToken="<token>"
      initialPath="/form-builder"
      basePath="/form-builder"
      ruleEngineApiClient={ruleEngineApiClient}
    />
  );
}
```

### Required inputs

- `apiBaseUrl`: Base API URL for requests.
- `authToken`: Auth token; stored into `localStorage` by the package.

## Development mode

Run the host app that renders this package.

1. Add the local `file:` deps to the host app.
2. `npm install` in the host app.
3. Start the host app dev server.

Changes in `equipped-package/form-builder/src` will be reflected.

## Production mode

Publish to your registry and install by version in the host app.

## Styling

No styles are auto-imported from this package. Apply styles from the host app.

## Rule Engine API control

The form builder uses `@equipped/rule-engine` internally. If you need the rule
engine to use a parent-managed API client, pass `ruleEngineApiClient` to
`FormBuilderApp` (see Usage above).

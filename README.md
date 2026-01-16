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

## Development mode

There is no standalone dev app in this repo. Use a host app to render the packages.

Recommended flow:

1. Add the local `file:` dependencies to your host app.
2. Run `npm install` in the host app.
3. Start the host app dev server (Vite/React).

Changes in `equipped-package/*/src` will be picked up by the host app.

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

## Configuration, auth, and runtime behavior

These packages depend on **headers + authentication** to talk to your API.
If you do not provide them, the modules will not be able to fetch data.

### Form Builder

Two supported modes:

1) **Parent-managed API (recommended)**
   - Pass `formBuilderApiClient` from the host app.
   - The client must expose `get`, `post`, `patch`, `put`, `delete` and return
     the same response shape the package expects (`{ statusCode, data }`).
   - In this mode the package does **not** set base URL or tokens itself.

2) **Package-managed API (fallback)**
   - Pass `apiBaseUrl` and `authToken`.
   - The package writes the token to `localStorage` and uses its internal API client.

If neither is provided, Form Builder renders but API calls will fail.

### Rule Engine

- Optional inside Form Builder. Provide only when needed:
  - `ruleEngineComponent={RuleEngineModal}`
- API control:
  - Parent-managed: pass `ruleEngineApiClient` (same shape as above).
  - Fallback: package uses `window.__APP_API_BASE__` or `VITE_API_BASE_URL`,
    and reads `accessToken`/`authToken` from `localStorage`.

If no API client/headers are available, Rule Engine renders but API calls fail.

### When it runs vs. when it does not

- **Runs with API access** when:
  - `formBuilderApiClient` is provided, or
  - `apiBaseUrl` + `authToken` are provided, and
  - Rule Engine is passed when you want that feature.

- **Does not fetch data** when:
  - No API client and no auth/base URL is provided.
  - Rule Engine component is not provided (feature hidden).

## Styling

These packages do not auto-import styles. Apply styles from the host app.

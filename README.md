# Equipped Packages

This folder contains the shared UI modules used by the main app and other consumers.

## Packages

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

## Configuration and auth

- `@equipped/form-builder` expects `apiBaseUrl` and `authToken` props.
- `@equipped/rule-engine` reads the API base URL from `window.__APP_API_BASE__`
  (preferred) or `VITE_API_BASE_URL` at build time, and reads tokens from
  `localStorage` (`accessToken` or `authToken`).

Set these in the host app, not inside the packages.

You can also inject a parent-managed API client into `@equipped/rule-engine`
via the `apiClient` prop to control auth and headers centrally.

## Styling

These packages do not auto-import styles. Apply styles from the host app.

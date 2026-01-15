# Form Builder Package

Standalone Form Builder package for workspace installs. Depends on `rule-engine`.

## Build

```bash
cd package/form-builder
npm install
npm run build
```

## Use in another app (workspace)

Add to the consuming app `package.json`:

```json
{
  "dependencies": {
    "form-builder": "workspace:*",
    "rule-engine": "workspace:*"
  }
}
```

Import and render:

```jsx
import FormBuilderApp from 'form-builder';

export default function FormBuilderHost() {
  return (
    <FormBuilderApp
      apiBaseUrl="http://localhost:3001"
      authToken="<token>"
      initialPath="/form-builder"
    />
  );
}
```

If your bundler does not handle CSS imports from packages, also import:

```js
import 'form-builder/style.css';
import 'rule-engine/style.css';
```

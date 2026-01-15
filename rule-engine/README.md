# Rule Engine Package

Standalone Rule Engine package for workspace installs.

## Build

```bash
cd package/rule-engine
npm install
npm run build
```

## Use in another app (workspace)

Add to the consuming app `package.json`:

```json
{
  "dependencies": {
    "rule-engine": "workspace:*"
  }
}
```

Import and render:

```jsx
import RuleEngineModal from 'rule-engine';

<RuleEngineModal isOpen onClose={() => {}} initialData={{ formula: '' }} />
```

If your bundler does not handle CSS imports from packages, also import:

```js
import 'rule-engine/style.css';
```

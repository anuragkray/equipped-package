# Rule Engine Modal - Refactored Structure

This document describes the refactored RuleEngineModal component structure.

## Overview

The RuleEngineModal has been refactored from a single large file (~1000 lines) into smaller, modular, and maintainable components and hooks.

## File Structure

```
src/components/ruleEngine/
├── RuleEngineModal.jsx          # Main component (clean, ~180 lines)
├── RuleEngineModal.old.jsx      # Backup of original file
├── RuleEngineModal.css          # Styles (unchanged)
│
├── components/                   # UI Components
│   ├── SuggestionList.jsx       # Module, field, and snippet suggestion lists
│   ├── FormulaInput.jsx         # Formula textarea with all suggestions
│   └── FormulaActions.jsx       # Check syntax button and result display
│
├── hooks/                        # Custom Hooks
│   ├── useRuleEngineState.js    # Main state management (form, loading, errors)
│   ├── useSuggestionState.js    # Suggestion-related state
│   ├── useRuleEngineInit.js     # Initialization and data fetching
│   ├── useFormulaHandlers.js    # Form submission and syntax checking
│   ├── useSuggestionHandlers.js # Autocomplete and suggestion logic
│   └── useKeyboardNav.js        # Keyboard navigation for suggestions
│
└── utils/                        # Utility Functions
    └── moduleUtils.js           # Module normalization and field extraction
```

## Component Breakdown

### Main Component
**RuleEngineModal.jsx** (~180 lines)
- Orchestrates all hooks and components
- Manages refs and component composition
- Clean, easy to understand

### UI Components

**SuggestionList.jsx**
- `ModuleSuggestionList`: Displays module autocomplete
- `FieldSuggestionList`: Displays field autocomplete  
- `SnippetSuggestionList`: Displays operator/function snippets

**FormulaInput.jsx**
- Formula textarea with all suggestion overlays
- Handles rendering of all suggestion types
- Cleanly separates UI from logic

**FormulaActions.jsx**
- Check Syntax button
- Result message display (success/error)

### Custom Hooks

**useRuleEngineState.js**
- Manages form state (formulaTitle, formula)
- Loading states
- Error states
- Check result state
- Group list state

**useSuggestionState.js**
- All suggestion-related state
- Highlighted indices for each suggestion type
- Show/hide flags for suggestions
- Filtered suggestions

**useRuleEngineInit.js**
- useEffect hook for initialization
- Fetches module/group list on mount
- Populates form with initial data
- Cleanup on unmount

**useFormulaHandlers.js**
- Form submission logic
- Module and field validation
- API calls (create/update formula)
- Check syntax functionality

**useSuggestionHandlers.js**
- Formula change handler
- Autocomplete logic for modules and fields
- Suggestion click handlers
- Snippet insertion logic

**useKeyboardNav.js**
- Keyboard navigation (Arrow Up/Down, Tab, Enter)
- Handles navigation for all suggestion types
- Cleanly separated from other logic

### Utilities

**moduleUtils.js**
- `normalizeModuleName()`: Normalize module names for comparison
- `STATIC_MODULES`: Static module list
- `extractFieldNames()`: Recursively extract field names from sections

## Benefits of Refactoring

1. **Maintainability**: Each file has a single, clear responsibility
2. **Reusability**: Hooks and components can be reused elsewhere
3. **Testability**: Smaller units are easier to test
4. **Readability**: ~180 line main component vs ~1000 line monolith
5. **Debugging**: Easier to locate and fix issues
6. **Collaboration**: Multiple developers can work on different parts

## No Functionality Lost

✅ All original functionality preserved:
- Module autocomplete
- Field autocomplete  
- Operator suggestions
- Function suggestions
- If/else snippets
- Keyboard navigation
- Form validation
- API integration
- Error handling
- Check syntax
- Both modes (with/without Rule Name)

## Usage

The component API remains unchanged:

```jsx
<RuleEngineModal
  isOpen={isOpen}
  onClose={onClose}
  initialData={{ formula: 'existing formula' }}
  group="loanonboarding"
  showRuleName={false}  // Hide Rule Name field
  onSave={handleSave}   // Custom save callback
/>
```

## Migration Notes

- The old file is backed up as `RuleEngineModal.old.jsx`
- All imports remain the same (no breaking changes)
- All functionality works identically
- CSS file unchanged

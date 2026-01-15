import {
  ARITHMETIC_OPERATOR_SNIPPETS,
  COMPARISON_OPERATOR_SNIPPETS,
} from '../../../utils/formulaConstants';

export const useKeyboardNavigation = (suggestionState, suggestionHandlers) => {
  const {
    showArithmeticSuggestion,
    showSuggestions,
    showFieldSuggestions,
    showLogicSuggestion,
    showIfElseSuggestion,
    showOperatorSuggestion,
    showFunctionSuggestion,
    suggestions,
    fieldSuggestions,
    filteredFunctions,
    highlightedArithmeticIndex,
    highlightedIfElseIndex,
    highlightedModuleIndex,
    highlightedFieldIndex,
    highlightedOperatorIndex,
    highlightedFunctionIndex,
    setHighlightedArithmeticIndex,
    setHighlightedIfElseIndex,
    setHighlightedModuleIndex,
    setHighlightedFieldIndex,
    setHighlightedOperatorIndex,
    setHighlightedFunctionIndex,
    ifElseSnippets,
    operatorSnippets,
  } = suggestionState;

  const {
    handleArithmeticSuggestionClick,
    handleIfElseSuggestionClick,
    handleSuggestionClick,
    handleFieldSuggestionClick,
    handleOperatorSuggestionClick,
    handleFunctionSuggestionClick,
  } = suggestionHandlers;

  const ALL_OPERATOR_SNIPPETS = operatorSnippets.length > 0
    ? operatorSnippets
    : [...ARITHMETIC_OPERATOR_SNIPPETS, ...COMPARISON_OPERATOR_SNIPPETS];

  const handleFormulaKeyDown = e => {
    // Field suggestions (highest priority after module.field pattern)
    if (showFieldSuggestions && fieldSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedFieldIndex(prev => (prev + 1) % fieldSuggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedFieldIndex(prev => (prev - 1 + fieldSuggestions.length) % fieldSuggestions.length);
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        handleFieldSuggestionClick(fieldSuggestions[highlightedFieldIndex]);
        return;
      }
    }
    
    // Module suggestions
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedModuleIndex(prev => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedModuleIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        handleSuggestionClick(suggestions[highlightedModuleIndex]);
        return;
      }
    }
    
    // If/Else suggestions
    if (showIfElseSuggestion && ifElseSnippets.length > 0 && !showSuggestions && !showFieldSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIfElseIndex(prev => (prev + 1) % ifElseSnippets.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIfElseIndex(prev => (prev - 1 + ifElseSnippets.length) % ifElseSnippets.length);
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        handleIfElseSuggestionClick(highlightedIfElseIndex);
        return;
      }
    }
    
    // Operator suggestions (all operators - arithmetic + comparison)
    if (showOperatorSuggestion && !showSuggestions && !showFieldSuggestions && !showLogicSuggestion) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedOperatorIndex(prev => (prev + 1) % ALL_OPERATOR_SNIPPETS.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedOperatorIndex(prev => (prev - 1 + ALL_OPERATOR_SNIPPETS.length) % ALL_OPERATOR_SNIPPETS.length);
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        handleOperatorSuggestionClick(highlightedOperatorIndex);
        return;
      }
    }
    
    // Function suggestions
    if (showFunctionSuggestion && !showSuggestions && !showFieldSuggestions && !showLogicSuggestion && !showOperatorSuggestion) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedFunctionIndex(prev => (prev + 1) % filteredFunctions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedFunctionIndex(prev => (prev - 1 + filteredFunctions.length) % filteredFunctions.length);
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        handleFunctionSuggestionClick(highlightedFunctionIndex);
        return;
      }
    }
  };

  return { handleFormulaKeyDown };
};

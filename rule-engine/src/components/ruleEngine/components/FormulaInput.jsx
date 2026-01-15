import React from 'react';
import { ModuleSuggestionList, FieldSuggestionList, SnippetSuggestionList } from './SuggestionList';
import {
  ARITHMETIC_OPERATOR_SNIPPETS,
  COMPARISON_OPERATOR_SNIPPETS,
} from '../../../utils/formulaConstants';
const FormulaInput = ({
  formulaRef,
  value,
  onChange,
  onKeyDown,
  onBlur,
  onFocus,
  fieldError,
  moduleError,
  suggestionState,
  suggestionHandlers,
}) => {
  const {
    showSuggestions,
    suggestions,
    highlightedModuleIndex,
    showFieldSuggestions,
    fieldSuggestions,
    highlightedFieldIndex,
    showIfElseSuggestion,
    highlightedIfElseIndex,
    showArithmeticSuggestion,
    highlightedArithmeticIndex,
    showOperatorSuggestion,
    highlightedOperatorIndex,
    showFunctionSuggestion,
    filteredFunctions,
    highlightedFunctionIndex,
    ifElseSnippets,
    operatorSnippets,
  } = suggestionState;

  const {
    handleSuggestionClick,
    handleFieldSuggestionClick,
    handleIfElseSuggestionClick,
    handleArithmeticSuggestionClick,
    handleOperatorSuggestionClick,
    handleFunctionSuggestionClick,
    setHighlightedModuleIndex,
    setHighlightedFieldIndex,
    setHighlightedIfElseIndex,
    setHighlightedArithmeticIndex,
    setHighlightedOperatorIndex,
    setHighlightedFunctionIndex,
  } = suggestionHandlers;

  const ALL_OPERATOR_SNIPPETS = operatorSnippets.length > 0
    ? operatorSnippets
    : [...ARITHMETIC_OPERATOR_SNIPPETS, ...COMPARISON_OPERATOR_SNIPPETS];

  const getOperatorSuggestions = () => {
    if (showOperatorSuggestion) {
      const beforeCursor = value.slice(0, formulaRef.current?.selectionStart || 0);
      if (/=$/.test(beforeCursor)) {
        const eqIdx = ALL_OPERATOR_SNIPPETS.findIndex(s => s.value === '==');
        if (eqIdx !== -1) {
          return [
            ALL_OPERATOR_SNIPPETS[eqIdx],
            ...ALL_OPERATOR_SNIPPETS.slice(0, eqIdx),
            ...ALL_OPERATOR_SNIPPETS.slice(eqIdx + 1),
          ];
        }
      }
      return ALL_OPERATOR_SNIPPETS;
    }
    return [];
  };

  return (
    <div className="rule-field">
      <label className="rule-label">Rule (Formula)</label>
      <div className="rule-textarea-wrapper">
        <textarea
          ref={formulaRef}
          name="formula"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          className="rule-textarea"
          rows={8}
          required
          style={{ minHeight: '180px', fontSize: '1.1rem', padding: '1rem' }}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder="Enter formula using suggestions"
        />
        
        {showSuggestions && (
          <ModuleSuggestionList
            suggestions={suggestions}
            highlightedIndex={highlightedModuleIndex}
            onSelect={handleSuggestionClick}
            onHover={setHighlightedModuleIndex}
          />
        )}

        {showFieldSuggestions && (
          <FieldSuggestionList
            fieldSuggestions={fieldSuggestions}
            highlightedIndex={highlightedFieldIndex}
            onSelect={handleFieldSuggestionClick}
            onHover={setHighlightedFieldIndex}
          />
        )}

        {showIfElseSuggestion && !showSuggestions && !showFieldSuggestions && (
          <SnippetSuggestionList
            snippets={ifElseSnippets}
            highlightedIndex={highlightedIfElseIndex}
            onSelect={handleIfElseSuggestionClick}
            onHover={setHighlightedIfElseIndex}
            wide={true}
          />
        )}

        {showOperatorSuggestion && !showSuggestions && !showFieldSuggestions && !showIfElseSuggestion && (
          <SnippetSuggestionList
            snippets={getOperatorSuggestions()}
            highlightedIndex={highlightedOperatorIndex}
            onSelect={handleOperatorSuggestionClick}
            onHover={setHighlightedOperatorIndex}
          />
        )}

        {showFunctionSuggestion && !showSuggestions && !showFieldSuggestions && (
          <SnippetSuggestionList
            snippets={filteredFunctions}
            highlightedIndex={highlightedFunctionIndex}
            onSelect={handleFunctionSuggestionClick}
            onHover={setHighlightedFunctionIndex}
          />
        )}

        {fieldError && <div className="rule-error">{fieldError}</div>}
        {moduleError && <div className="rule-error">{moduleError}</div>}
      </div>
    </div>
  );
};

export default FormulaInput;

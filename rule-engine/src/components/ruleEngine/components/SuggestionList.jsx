import React from 'react';

export const ModuleSuggestionList = ({ suggestions, highlightedIndex, onSelect, onHover }) => {
  if (!suggestions.length) return null;

  return (
    <ul className="rule-suggestion-list" style={{ minWidth: '320px' }}>
      {suggestions.map((s, idx) => (
        <li
          key={s._id}
          className={`rule-suggestion-item ${idx === highlightedIndex ? 'is-active' : ''}`}
          onMouseDown={() => onSelect(s)}
          onMouseEnter={() => onHover(idx)}
        >
          {s.moduleIcon && <span className={`icon-${s.moduleIcon.toLowerCase()}`}></span>}
          <span className="rule-suggestion-primary">{s._id}</span>
          <span className="rule-suggestion-secondary">{s.moduleLabel}</span>
        </li>
      ))}
    </ul>
  );
};

export const FieldSuggestionList = ({ fieldSuggestions, highlightedIndex, onSelect, onHover }) => {
  if (!fieldSuggestions || fieldSuggestions.length === 0) return null;

  return (
    <ul className="rule-suggestion-list" style={{ minWidth: '320px' }}>
      {fieldSuggestions.map((field, idx) => (
        <li
          key={field}
          className={`rule-suggestion-item ${idx === highlightedIndex ? 'is-active' : ''}`}
          onMouseDown={() => onSelect(field)}
          onMouseEnter={() => onHover(idx)}
        >
          {field}
        </li>
      ))}
    </ul>
  );
};

export const SnippetSuggestionList = ({ snippets, highlightedIndex, onSelect, onHover, wide = false }) => {
  if (!snippets.length) return null;

  return (
    <ul
      className={`rule-suggestion-list ${wide ? 'rule-suggestion-list--wide' : 'rule-suggestion-list--medium'}`}
      style={{ minWidth: wide ? '700px' : '400px' }}
    >
      {snippets.map((snippet, idx) => (
        <li
          key={snippet.label}
          className={`rule-suggestion-item rule-suggestion-item--code ${
            idx === highlightedIndex ? 'is-active' : ''
          }`}
          onMouseDown={() => onSelect(idx)}
          onMouseEnter={() => onHover(idx)}
        >
          {snippet.display}
          <span className="rule-suggestion-hint">(Tab/Enter to insert)</span>
        </li>
      ))}
    </ul>
  );
};

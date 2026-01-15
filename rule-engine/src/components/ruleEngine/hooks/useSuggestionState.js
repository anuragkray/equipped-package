import { useState } from 'react';
import {
  ARITHMETIC_OPERATOR_SNIPPETS,
  COMPARISON_OPERATOR_SNIPPETS,
} from '../../../utils/formulaConstants';

export const useSuggestionState = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);
  const [fieldSuggestions, setFieldSuggestions] = useState([]);
  const [showFieldSuggestions, setShowFieldSuggestions] = useState(false);
  
  const [showIfElseSuggestion, setShowIfElseSuggestion] = useState(false);
  const [highlightedIfElseIndex, setHighlightedIfElseIndex] = useState(0);
  const [pendingIfElseInsert, setPendingIfElseInsert] = useState(false);
  
  const [highlightedModuleIndex, setHighlightedModuleIndex] = useState(0);
  const [highlightedFieldIndex, setHighlightedFieldIndex] = useState(0);
  
  const [showArithmeticSuggestion, setShowArithmeticSuggestion] = useState(false);
  const [highlightedArithmeticIndex, setHighlightedArithmeticIndex] = useState(0);
  const [pendingArithmeticInsert, setPendingArithmeticInsert] = useState(false);
  
  const [highlightedLogicIndex, setHighlightedLogicIndex] = useState(0);
  const [showLogicSuggestion, setShowLogicSuggestion] = useState(false);
  const [pendingLogicInsert, setPendingLogicInsert] = useState(false);
  
  const [showOperatorSuggestion, setShowOperatorSuggestion] = useState(false);
  const [highlightedOperatorIndex, setHighlightedOperatorIndex] = useState(0);
  
  const [showMathFunctionSuggestion, setShowMathFunctionSuggestion] = useState(false);
  const [highlightedMathFunctionIndex, setHighlightedMathFunctionIndex] = useState(0);
  const [filteredMathFunctions, setFilteredMathFunctions] = useState([]);
  
  const [showFunctionSuggestion, setShowFunctionSuggestion] = useState(false);
  const [highlightedFunctionIndex, setHighlightedFunctionIndex] = useState(0);
  const [filteredFunctions, setFilteredFunctions] = useState([]);
  const [ifElseSnippets, setIfElseSnippets] = useState([]);
  const [arithmeticSnippets, setArithmeticSnippets] = useState(ARITHMETIC_OPERATOR_SNIPPETS);
  const [operatorSnippets, setOperatorSnippets] = useState([
    ...ARITHMETIC_OPERATOR_SNIPPETS,
    ...COMPARISON_OPERATOR_SNIPPETS,
  ]);

  return {
    suggestions,
    setSuggestions,
    showSuggestions,
    setShowSuggestions,
    cursorPos,
    setCursorPos,
    fieldSuggestions,
    setFieldSuggestions,
    showFieldSuggestions,
    setShowFieldSuggestions,
    showIfElseSuggestion,
    setShowIfElseSuggestion,
    highlightedIfElseIndex,
    setHighlightedIfElseIndex,
    pendingIfElseInsert,
    setPendingIfElseInsert,
    highlightedModuleIndex,
    setHighlightedModuleIndex,
    highlightedFieldIndex,
    setHighlightedFieldIndex,
    showArithmeticSuggestion,
    setShowArithmeticSuggestion,
    highlightedArithmeticIndex,
    setHighlightedArithmeticIndex,
    pendingArithmeticInsert,
    setPendingArithmeticInsert,
    highlightedLogicIndex,
    setHighlightedLogicIndex,
    showLogicSuggestion,
    setShowLogicSuggestion,
    pendingLogicInsert,
    setPendingLogicInsert,
    showOperatorSuggestion,
    setShowOperatorSuggestion,
    highlightedOperatorIndex,
    setHighlightedOperatorIndex,
    showMathFunctionSuggestion,
    setShowMathFunctionSuggestion,
    highlightedMathFunctionIndex,
    setHighlightedMathFunctionIndex,
    filteredMathFunctions,
    setFilteredMathFunctions,
    showFunctionSuggestion,
    setShowFunctionSuggestion,
    highlightedFunctionIndex,
    setHighlightedFunctionIndex,
    filteredFunctions,
    setFilteredFunctions,
    ifElseSnippets,
    setIfElseSnippets,
    arithmeticSnippets,
    setArithmeticSnippets,
    operatorSnippets,
    setOperatorSnippets,
  };
};

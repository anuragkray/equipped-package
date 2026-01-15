import { useRef } from 'react';
import { getMethodApiCall, postMethodApiCall, getAuthHeaders } from '../../../services/apiClient';
import { normalizeModuleName, extractFieldNames, STATIC_MODULES } from '../utils/moduleUtils';
import {
  ARITHMETIC_OPERATOR_SNIPPETS,
  COMPARISON_OPERATOR_SNIPPETS,
  FUNCTION_SNIPPETS,
} from '../../../utils/formulaConstants';

export const useSuggestionHandlers = ({
  formulaRef,
  form,
  setForm,
  group,
  groupList,
  currentSections,
  suggestionState,
  setFieldError,
  setModuleError,
}) => {
  const {
    cursorPos,
    setCursorPos,
    setSuggestions,
    setShowSuggestions,
    setFieldSuggestions,
    setShowFieldSuggestions,
    setShowIfElseSuggestion,
    setHighlightedIfElseIndex,
    setShowArithmeticSuggestion,
    setHighlightedArithmeticIndex,
    setShowOperatorSuggestion,
    setHighlightedOperatorIndex,
    setShowFunctionSuggestion,
    setFilteredFunctions,
    setHighlightedFunctionIndex,
    setHighlightedModuleIndex,
    setHighlightedFieldIndex,
    setIfElseSnippets,
    setArithmeticSnippets,
    setOperatorSnippets,
    ifElseSnippets,
    arithmeticSnippets,
    operatorSnippets,
  } = suggestionState;

  const formulaSuggestionCache = useRef(new Map());

  const normalizeFormulaSnippets = (rawSuggestions) => {
    if (!Array.isArray(rawSuggestions)) return [];
    return rawSuggestions
      .map(item => {
        const example =
          item?.exampleWithVariable ??
          item?.example ??
          item?.value ??
          item?.label ??
          '';
        if (!example) return null;
        const value = String(example);
        return { label: value, value, display: value, cursorOffset: 0 };
      })
      .filter(Boolean);
  };

  const fetchFormulaSnippets = async (query) => {
    const safeQuery = query ? query.toString() : '';
    if (!safeQuery) return [];
    const cacheKey = safeQuery.toLowerCase();
    if (formulaSuggestionCache.current.has(cacheKey)) {
      return formulaSuggestionCache.current.get(cacheKey);
    }
    try {
      const res = await postMethodApiCall(
        '/settings/formula-suggestions',
        getAuthHeaders(),
        {
          query: safeQuery,
          options: { limit: 20 },
        },
      );
      const snippets = normalizeFormulaSnippets(res?.data?.suggestions);
      formulaSuggestionCache.current.set(cacheKey, snippets);
      return snippets;
    } catch (err) {
      return [];
    }
  };

  const handleFormulaChange = async e => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, formula: value }));
    setCursorPos(e.target.selectionStart);
    setFieldError('');
    setModuleError('');

    const beforeCursor = value.slice(0, e.target.selectionStart);
    
    // Check for if/else suggestions
    const ifMatch = /(^|\s)if$/.test(beforeCursor);
    setShowIfElseSuggestion(ifMatch);
    setHighlightedIfElseIndex(0);
    if (ifMatch) {
      const apiSnippets = await fetchFormulaSnippets('if');
      setIfElseSnippets(apiSnippets);
      setShowIfElseSuggestion(apiSnippets.length > 0);
    }

    // Check for arithmetic suggestions
    const arithmeticMatch = /[+\-*/%^]$/.exec(beforeCursor);
    setShowArithmeticSuggestion(!!arithmeticMatch);
    setHighlightedArithmeticIndex(0);
    if (arithmeticMatch) {
      const apiSnippets = await fetchFormulaSnippets(arithmeticMatch[0]);
      setArithmeticSnippets(
        apiSnippets.length > 0 ? apiSnippets : ARITHMETIC_OPERATOR_SNIPPETS,
      );
    }

    // Check for operator suggestions
    const operatorMatch = /[+\-*/%^=<!>]$/.exec(beforeCursor);
    setShowOperatorSuggestion(!!operatorMatch);
    setHighlightedOperatorIndex(0);
    if (operatorMatch) {
      const apiSnippets = await fetchFormulaSnippets(operatorMatch[0]);
      setOperatorSnippets(
        apiSnippets.length > 0
          ? apiSnippets
          : [...ARITHMETIC_OPERATOR_SNIPPETS, ...COMPARISON_OPERATOR_SNIPPETS],
      );
    }

    // Check for function suggestions
    const match = beforeCursor.match(/([a-zA-Z]+)$/);
    if (match) {
      const typed = match[1];
      const apiSnippets = await fetchFormulaSnippets(typed);
      if (apiSnippets.length > 0) {
        setShowFunctionSuggestion(true);
        setFilteredFunctions(apiSnippets);
      } else {
        const typedLower = typed.toLowerCase();
        const filtered = FUNCTION_SNIPPETS.filter(fn => fn.label.toLowerCase().startsWith(typedLower));
        setShowFunctionSuggestion(filtered.length > 0);
        setFilteredFunctions(filtered);
      }
      setHighlightedFunctionIndex(0);
    } else {
      setShowFunctionSuggestion(false);
      setFilteredFunctions([]);
    }

    // Check for field suggestions (after dot notation)
    const dotMatch = beforeCursor.match(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]*)$/);
    if (dotMatch) {
      const moduleName = dotMatch[1];
      const partialField = dotMatch[2] || '';
      const typedNormalized = normalizeModuleName(moduleName);
      const moduleMatch = groupList.find(
        g => normalizeModuleName(g?._id) === typedNormalized,
      ) || (normalizeModuleName(group) === typedNormalized ? { _id: group } : null);
      
      if (!moduleMatch) {
        setModuleError('Only select module from suggestions');
        setFieldSuggestions([]);
        setShowFieldSuggestions(false);
        setShowSuggestions(false);
        return;
      }
      
      setModuleError('');
      try {
        const targetModule = moduleMatch._id;
        let fieldNames = [];
        
        const isCurrentModule = normalizeModuleName(targetModule) === normalizeModuleName(group);
        if (isCurrentModule && Array.isArray(currentSections)) {
          currentSections.forEach(section => {
            if (section.inputs && typeof section.inputs === 'object') {
              fieldNames.push(...extractFieldNames(section.inputs));
            }
          });
        }
        
        try {
          const res = await getMethodApiCall(
            `/form/get?offset=1&limit=10&formTitle=${targetModule}`,
            getAuthHeaders(),
          );
          if (res?.data?.formData && Array.isArray(res.data.formData)) {
            const forms = res.data.formData;
            const defaultFormRes = forms.find(f => f.default === true) || forms[0];
            if (defaultFormRes && Array.isArray(defaultFormRes.sections)) {
              defaultFormRes.sections.forEach(section => {
                if (section.inputs && typeof section.inputs === 'object') {
                  fieldNames.push(...extractFieldNames(section.inputs));
                }
              });
            }
          }
        } catch (apiErr) {
        }
        
        const uniqueFieldNames = [...new Set(fieldNames)];
        const safeFieldNames = uniqueFieldNames.filter(
          name => typeof name === 'string' && name.trim() !== '',
        );
        const filteredFields = safeFieldNames.filter(name =>
          name.toLowerCase().startsWith(partialField.toLowerCase()),
        );
        
        setFieldSuggestions(filteredFields);
        setShowFieldSuggestions(true);
        setFieldError('');
      } catch (err) {
        setFieldSuggestions([]);
        setShowFieldSuggestions(false);
        setFieldError('');
      }
      setShowSuggestions(false);
      setHighlightedModuleIndex(0);
      setHighlightedFieldIndex(0);
      return;
    }

    // Check for module suggestions
    if (groupList && Array.isArray(groupList)) {
      const modMatch = beforeCursor.match(/([a-zA-Z0-9_]+)$/);
      const search = modMatch ? modMatch[1] : '';
      const mergedModulesRaw = [
        ...STATIC_MODULES,
        ...groupList.filter(apiMod => !STATIC_MODULES.some(staticMod => staticMod._id === apiMod._id)),
        { _id: group, moduleLabel: group, moduleIcon: '' },
      ];
      
      const seenMods = new Set();
      const mergedModules = mergedModulesRaw.filter(mod => {
        const normId = normalizeModuleName(mod?._id);
        if (!normId || seenMods.has(normId)) return false;
        seenMods.add(normId);
        return true;
      });
      
      if (search.length > 0) {
        const filtered = mergedModules.filter(
          g => {
            const modId = g?._id || '';
            return (
              modId.toLowerCase().startsWith(search.toLowerCase()) ||
              normalizeModuleName(modId).startsWith(normalizeModuleName(search))
            );
          },
        );
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setShowSuggestions(false);
      }
      setShowFieldSuggestions(false);
      setHighlightedModuleIndex(0);
      setHighlightedFieldIndex(0);
    }
  };

  const insertSnippet = (snippet, removeChars = 0) => {
    const formula = form.formula;
    const before = formula.slice(0, cursorPos - removeChars);
    const after = formula.slice(cursorPos);
    const newBefore = before + snippet.value;
    const newFormula = newBefore + after;
    setForm(prev => ({ ...prev, formula: newFormula }));
    setTimeout(() => {
      if (formulaRef.current) {
        const pos = newBefore.length + (snippet.cursorOffset || 0);
        formulaRef.current.selectionStart = pos;
        formulaRef.current.selectionEnd = pos;
        formulaRef.current.focus();
      }
    }, 0);
  };

  const handleSuggestionClick = suggestion => {
    const formula = form.formula;
    const before = formula.slice(0, cursorPos);
    const after = formula.slice(cursorPos);
    const insert = suggestion._id;
    const newFormula = before.replace(/([a-zA-Z0-9_]+)$/, insert) + after;
    setForm(prev => ({ ...prev, formula: newFormula }));
    setShowSuggestions(false);
    setTimeout(() => {
      if (formulaRef.current) {
        const pos = before.replace(/([a-zA-Z0-9_]+)$/, insert).length;
        formulaRef.current.selectionStart = pos;
        formulaRef.current.selectionEnd = pos;
        formulaRef.current.focus();
      }
    }, 0);
  };

  const handleFieldSuggestionClick = fieldName => {
    const formula = form.formula;
    const before = formula.slice(0, cursorPos);
    const after = formula.slice(cursorPos);
    const newBefore = before.replace(/\.([a-zA-Z0-9_]*)$/, `.${fieldName}`);
    const newFormula = newBefore + after;
    setForm(prev => ({ ...prev, formula: newFormula }));
    setShowFieldSuggestions(false);
    setTimeout(() => {
      if (formulaRef.current) {
        const pos = newBefore.length;
        formulaRef.current.selectionStart = pos;
        formulaRef.current.selectionEnd = pos;
        formulaRef.current.focus();
      }
    }, 0);
  };

  const handleIfElseSuggestionClick = idx => {
    const snippet = ifElseSnippets[idx];
    const formula = form.formula;
    const before = formula.slice(0, cursorPos);
    const after = formula.slice(cursorPos);
    const newBefore = before.replace(/(^|\s)if$/, `$1${snippet.value}`);
    const newFormula = newBefore + after;
    setForm(prev => ({ ...prev, formula: newFormula }));
    setShowIfElseSuggestion(false);
    setTimeout(() => {
      if (formulaRef.current) {
        const pos = newBefore.length - snippet.value.length + snippet.cursorOffset;
        formulaRef.current.selectionStart = pos;
        formulaRef.current.selectionEnd = pos;
        formulaRef.current.focus();
      }
    }, 0);
  };

  const handleArithmeticSuggestionClick = idx => {
    insertSnippet(arithmeticSnippets[idx], 1);
    setShowArithmeticSuggestion(false);
  };

  const handleOperatorSuggestionClick = idx => {
    const ALL_OPERATOR_SNIPPETS = operatorSnippets.length > 0
      ? operatorSnippets
      : [...ARITHMETIC_OPERATOR_SNIPPETS, ...COMPARISON_OPERATOR_SNIPPETS];
    insertSnippet(ALL_OPERATOR_SNIPPETS[idx], 1);
    setShowOperatorSuggestion(false);
  };

  const handleFunctionSuggestionClick = idx => {
    const snippet = suggestionState.filteredFunctions[idx];
    const formula = form.formula;
    const before = formula.slice(0, cursorPos);
    const after = formula.slice(cursorPos);
    const newBefore = before.replace(/([a-zA-Z]+)$/, snippet.value);
    const newFormula = newBefore + after;
    setForm(prev => ({ ...prev, formula: newFormula }));
    setShowFunctionSuggestion(false);
    setTimeout(() => {
      if (formulaRef.current) {
        const pos = newBefore.length - 1 + snippet.cursorOffset;
        formulaRef.current.selectionStart = pos;
        formulaRef.current.selectionEnd = pos;
        formulaRef.current.focus();
      }
    }, 0);
  };

  return {
    handleFormulaChange,
    handleSuggestionClick,
    handleFieldSuggestionClick,
    handleIfElseSuggestionClick,
    handleArithmeticSuggestionClick,
    handleOperatorSuggestionClick,
    handleFunctionSuggestionClick,
  };
};

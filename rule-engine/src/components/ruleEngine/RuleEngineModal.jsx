import React, { useRef } from 'react';
import Modal from '../custom/modal/Modal.jsx';
import FormulaInput from './components/FormulaInput';
import FormulaActions from './components/FormulaActions';
import { useRuleEngineState } from './hooks/useRuleEngineState';
import { useSuggestionState } from './hooks/useSuggestionState';
import { useRuleEngineInit } from './hooks/useRuleEngineInit';
import { useFormulaHandlers } from './hooks/useFormulaHandlers';
import { useSuggestionHandlers } from './hooks/useSuggestionHandlers';
import { useKeyboardNavigation } from './hooks/useKeyboardNav';
import './RuleEngineModal.css';

const RuleEngineModal = ({
  isOpen,
  onClose,
  initialData,
  group,
  sectionIndex,
  inputKey,
  setSections,
  subSectionId,
  currentSections = [],
  showRuleName = true,
  onSave,
  title, // Custom title prop
  apiClient,
}) => {
  const formulaRef = useRef(null);
  
  // State management
  const ruleEngineState = useRuleEngineState();
  const suggestionState = useSuggestionState();
  
  const {
    form,
    setForm,
    loading,
    setLoading,
    error,
    setError,
    checkLoading,
    setCheckLoading,
    checkResult,
    setCheckResult,
    groupList,
    setGroupList,
    fieldError,
    setFieldError,
    moduleError,
    setModuleError,
    resetForm,
  } = ruleEngineState;

  // Initialize component
  useRuleEngineInit({
    isOpen,
    initialData,
    group,
    setForm,
    setCheckResult,
    setError,
    setGroupList,
    resetForm,
    apiClient,
  });

  // Formula handlers (submit, check syntax)
  const formHandlers = useFormulaHandlers({
    form,
    setForm,
    setLoading,
    setError,
    setCheckLoading,
    setCheckResult,
    checkResult,
    group,
    groupList,
    currentSections,
    initialData,
    setSections,
    sectionIndex,
    inputKey,
    subSectionId,
    onClose,
    showRuleName,
    onSave,
    setFieldError,
    setModuleError,
    apiClient,
  });

  // Suggestion handlers
  const suggestionHandlers = useSuggestionHandlers({
    formulaRef,
    form,
    setForm,
    group,
    groupList,
    currentSections,
    suggestionState,
    setFieldError,
    setModuleError,
    apiClient,
  });

  // Keyboard navigation
  const { handleFormulaKeyDown } = useKeyboardNavigation(suggestionState, suggestionHandlers);

  const handleFormulaBlur = () => {
    setTimeout(() => {
      suggestionState.setShowFieldSuggestions(false);
      suggestionState.setShowIfElseSuggestion(false);
      suggestionState.setShowArithmeticSuggestion(false);
    }, 200);
  };

  // Determine the modal title
  const modalTitle = title || (showRuleName ? 'Create New Rule' : 'Formula Builder');

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form className="rule-modal-form" onSubmit={formHandlers.handleSubmit}>
        <h2 className="rule-modal-title">{modalTitle}</h2>
        
        {showRuleName && (
          <div className="rule-field">
            <label className="rule-label">Rule Name</label>
            <input
              type="text"
              name="formulaTitle"
              value={form.formulaTitle}
              onChange={formHandlers.handleChange}
              className="rule-input"
              required
              placeholder="Rule Name"
            />
          </div>
        )}

        <FormulaInput
          formulaRef={formulaRef}
          value={form.formula}
          onChange={suggestionHandlers.handleFormulaChange}
          onKeyDown={handleFormulaKeyDown}
          onBlur={handleFormulaBlur}
          onFocus={suggestionHandlers.handleFormulaChange}
          fieldError={fieldError}
          moduleError={moduleError}
          suggestionState={suggestionState}
          suggestionHandlers={suggestionHandlers}
        />

        <FormulaActions
          form={form}
          checkLoading={checkLoading}
          checkResult={checkResult}
          onCheckSyntax={formHandlers.handleCheckSyntax}
          showRuleName={showRuleName}
        />

        {error && <div className="rule-error rule-error-inline">{error}</div>}

        <div className="rule-actions">
          <button
            type="submit"
            className="rule-btn rule-btn-primary"
            disabled={
              loading ||
              (showRuleName && !form.formulaTitle) ||
              !form.formula ||
              !checkResult ||
              !checkResult.success ||
              !!fieldError ||
              !!moduleError
            }
          >
            {loading ? 'Saving...' : showRuleName ? 'Save Rule' : 'Save Formula'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RuleEngineModal;

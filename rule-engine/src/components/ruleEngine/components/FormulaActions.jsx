import React from 'react';

const FormulaActions = ({ 
  form, 
  checkLoading, 
  checkResult, 
  onCheckSyntax, 
  showRuleName 
}) => {
  return (
    <>
      <div className="rule-actions-inline">
        <button
          type="button"
          className="rule-btn rule-btn-secondary"
          onClick={onCheckSyntax}
          disabled={!form.formula || (showRuleName && !form.formulaTitle) || checkLoading}
        >
          {checkLoading ? 'Checking...' : 'Check Syntax'}
        </button>
        {checkResult && (
          <span className={checkResult.success ? 'rule-success' : 'rule-error'}>
            {checkResult.message}
          </span>
        )}
      </div>
    </>
  );
};

export default FormulaActions;

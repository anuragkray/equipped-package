import { useState } from 'react';

const defaultForm = {
  formulaTitle: '',
  formula: '',
};

export const useRuleEngineState = () => {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [groupList, setGroupList] = useState([]);
  const [fieldError, setFieldError] = useState('');
  const [moduleError, setModuleError] = useState('');

  const resetForm = () => {
    setForm(defaultForm);
    setCheckResult(null);
    setError('');
    setGroupList([]);
    setFieldError('');
    setModuleError('');
  };

  return {
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
  };
};

import { 
  postMethodApiCall, 
  getAuthHeaders, 
  getMethodApiCall,
  patchMethodApiCall 
} from '../../../services/apiClient';
import { normalizeModuleName, extractFieldNames } from '../utils/moduleUtils';

export const useFormulaHandlers = ({
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
}) => {
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckSyntax = async () => {
    setCheckLoading(true);
    setCheckResult(null);
    try {
      const res = await postMethodApiCall('/settings/check-formula-syntax', getAuthHeaders(), {
        formula: form.formula,
        data: {
          Ordered: { Quantity: 3, Price: 1 },
          deal: { Discount: 1 },
        },
      });
      if (res?.data) {
        if (res.data.valid === false) {
          setCheckResult({ success: false, message: res.data.error || 'Syntax check failed.' });
        } else if (res.data.valid === true) {
          setCheckResult({ success: true, message: 'Syntax is valid!' });
        } else {
          setCheckResult({ success: false, message: 'Syntax check failed.' });
        }
      } else {
        setCheckResult({ success: false, message: 'Syntax check failed.' });
      }
    } catch (err) {
      setCheckResult({
        success: false,
        message: err?.response?.data?.message || 'Syntax check failed.',
      });
    } finally {
      setCheckLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // If showRuleName is false, use custom save callback (for schedule template)
    if (!showRuleName && onSave) {
      if (!form.formula) {
        setError('Please enter a formula.');
        return;
      }
      if (!checkResult || !checkResult.success) {
        setError('Please check formula syntax before saving.');
        return;
      }
      onSave(form.formula);
      onClose();
      return;
    }
    
    setLoading(true);
    setError('');
    setModuleError('');

    const formula = form.formula;
    const moduleFieldMatches = formula.matchAll(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/g);
    
    for (const match of moduleFieldMatches) {
      const moduleName = match[1];
      const fieldName = match[2];
      const typedNormalized = normalizeModuleName(moduleName);
      const moduleMatch = groupList.find(
        g => normalizeModuleName(g?._id) === typedNormalized,
      ) || (normalizeModuleName(group) === typedNormalized ? { _id: group } : null);
      
      if (!moduleMatch) {
        setLoading(false);
        setError(`Module "${moduleName}" not found. Please select a valid module.`);
        return;
      }
      
      try {
        const targetModule = moduleMatch._id;
        let fieldNames = [];
        
        // 1. Get fields from current unsaved sections (PRIORITY)
        const isCurrentModule = normalizeModuleName(targetModule) === normalizeModuleName(group);
        if (isCurrentModule && Array.isArray(currentSections)) {
          currentSections.forEach(section => {
            if (section.inputs && typeof section.inputs === 'object') {
              fieldNames.push(...extractFieldNames(section.inputs));
            }
          });
        }
        
        // 2. Get fields from saved form via API (if exists)
        try {
          const res = await getMethodApiCall(
            `/form/get?offset=1&limit=10&formTitle=${targetModule}`,
            getAuthHeaders(),
          );
          if (res?.data?.formData && Array.isArray(res.data.formData)) {
            const defaultFormRes = res.data.formData.find(f => f.default === true);
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
        
        if (!uniqueFieldNames.some(name => name.toLowerCase() === fieldName.toLowerCase())) {
          setLoading(false);
          setError(`Field "${fieldName}" not found in module "${moduleName}".`);
          return;
        }
      } catch (err) {
        setLoading(false);
        setError(`Error validating field "${fieldName}": ${err.message || 'Unknown error'}`);
        return;
      }
    }

    if (!checkResult || !checkResult.success) {
      setError('Please check formula syntax before saving.');
      setLoading(false);
      return;
    }

    try {
      let res;
      if (initialData?.isEdit && initialData?._id) {
        res = await patchMethodApiCall(
          `/settings/update-formula/${initialData._id}`,
          getAuthHeaders(),
          {
            formulaTitle: form.formulaTitle,
            moduleName: group,
            moduleFilds: initialData?.moduleFilds || '',
            formula: form.formula,
          },
        );
        if (res?.statusCode === 200 || res?.statusCode === 201) {
          onClose();
        } else {
          setError('Failed to update rule.');
        }
      } else {
        res = await postMethodApiCall('/settings/add-formula', getAuthHeaders(), {
          formulaTitle: form.formulaTitle,
          moduleName: group,
          moduleFilds: initialData?.moduleFilds || '',
          formula: form.formula,
        });
        if (res?.statusCode === 200 || res?.statusCode === 201) {
          const formulaId = res?.data;
          if (setSections && typeof sectionIndex === 'number' && inputKey) {
            setSections(prevSections => {
              const newSections = [...prevSections];
              const section = newSections[sectionIndex];
              if (!section?.inputs) return newSections;
              if (subSectionId && section.inputs[subSectionId]?.inputs?.[inputKey]) {
                const subSection = section.inputs[subSectionId];
                const updatedInputs = {
                  ...subSection.inputs,
                  [inputKey]: {
                    ...subSection.inputs[inputKey],
                    formulaId,
                  },
                };
                section.inputs[subSectionId] = { ...subSection, inputs: updatedInputs };
              } else if (section.inputs[inputKey]) {
                section.inputs[inputKey] = {
                  ...section.inputs[inputKey],
                  formulaId,
                };
              }
              return newSections;
            });
          }
          onClose();
        } else {
          setError('Failed to save rule.');
        }
      }
    } catch (err) {
      setError('Failed to save/update rule.');
    } finally {
      setLoading(false);
    }
  };

  return {
    handleChange,
    handleCheckSyntax,
    handleSubmit,
  };
};

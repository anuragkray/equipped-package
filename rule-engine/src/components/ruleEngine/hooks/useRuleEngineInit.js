import { useEffect } from 'react';
import { resolveApiClient } from '../../../services/apiAdapter';
import { normalizeModuleName } from '../utils/moduleUtils';

export const useRuleEngineInit = ({
  isOpen,
  initialData,
  group,
  setForm,
  setCheckResult,
  setError,
  setGroupList,
  resetForm,
  apiClient,
}) => {
  const api = resolveApiClient(apiClient);

  useEffect(() => {
    if (isOpen && initialData) {
      setForm({
        formulaTitle: initialData.formulaTitle || '',
        formula: initialData.formula || '',
      });
      setCheckResult(null);
      setError('');

      (async () => {
        try {
          const res = await api.get('/form/group?offset=1&limit=20');
          let list = [];
          if (res?.data?.formData && Array.isArray(res.data.formData)) {
            list = res.data.formData;
          } else if (Array.isArray(res?.data)) {
            list = res.data;
          }
          
          const normalizedGroupId = normalizeModuleName(group);
          const hasCurrentModule = list.some(
            g => normalizeModuleName(g?._id) === normalizedGroupId,
          );
          const mergedUnDeduped = hasCurrentModule
            ? list
            : [...list, { _id: group, moduleLabel: group, moduleIcon: '' }];
          const seen = new Set();
          const merged = mergedUnDeduped.filter(mod => {
            const normId = normalizeModuleName(mod?._id);
            if (!normId || seen.has(normId)) return false;
            seen.add(normId);
            return true;
          });
          setGroupList(merged);
          
          const params = new URLSearchParams(window.location.search);
          const groupFromUrl = params.get('group');
          if (groupFromUrl) {
            setForm(f => ({ ...f, moduleName: groupFromUrl }));
          }
        } catch (e) {
          setGroupList([]);
        }
      })();
    } else if (!isOpen) {
      resetForm();
    }
  }, [isOpen, initialData, group]);
};

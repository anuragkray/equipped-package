import { useState, useEffect, useMemo } from "react";
import Modal from "../../../../../components/custom/modal/Modal.jsx";
import Button from "../../../../../components/ui/button/Button.jsx";
import SelectField from "../../../../../components/inputs/searchInput/SelectField.jsx";
import { InputField } from "../../../../../components/inputs/input/index.jsx";
import { getFormGroupApi } from "../../../../../services/formApi.js";
import { convertToCamelCase } from "../../../../../utils/index.js";
import './Lookup.css';
import ConditionalDisplay from "./ConditionalDisplay.jsx";

const getDefaultGridSize = (type) => {
  const normalised = (type || '').toLowerCase();
  if (normalised === 'checkbox') return 12;
  return 6;
};

const LookupConfig = ({ selectItem, setSelectedItem, setSections, section, sectionsList = [] }) => {
  const [formGroups, setFormGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  // Deep clone helper to avoid reference issues
  const deepCloneInputs = (inputs) => {
    if (!inputs || typeof inputs !== 'object') return {};
    // Use JSON parse/stringify for complete deep clone
    try {
      return JSON.parse(JSON.stringify(inputs));
    } catch (e) {
      const cloned = {};
      Object.entries(inputs).forEach(([key, value]) => {
        if (!value) {
          cloned[key] = value;
          return;
        }
        if (value.type === 'SubSection') {
          cloned[key] = {
            ...value,
            inputs: deepCloneInputs(value.inputs || {})
          };
        } else {
          cloned[key] = { ...value };
          if (Array.isArray(value.options)) {
            cloned[key].options = value.options.map(opt => ({ ...opt }));
          }
        }
      });
      return cloned;
    }
  };

  useEffect(() => {
    const loadFormGroups = async () => {
      setLoading(true);
      try {
        const response = await getFormGroupApi();
        if (response?.statusCode === 200) {
          // Handle different response structures
          const payload = response?.data ?? response;
          
          // Check if data is directly an array
          if (Array.isArray(payload)) {
            setFormGroups(payload);
          } 
          // Check if data has formData property (like MinervaLMS Redux structure)
          else if (payload?.formData && Array.isArray(payload.formData)) {
            setFormGroups(payload.formData);
          }
          // Check if data is an object with array values
          else if (typeof payload === 'object') {
            // Try to find first array in the object
            const findFirstArray = (input) => {
              if (!input) return [];
              if (Array.isArray(input)) return input;
              if (typeof input === 'object') {
                for (const value of Object.values(input)) {
                  const result = findFirstArray(value);
                  if (result.length) return result;
                }
              }
              return [];
            };
            const arrayData = findFirstArray(payload);
            setFormGroups(arrayData);
          } else {
            setFormGroups([]);
          }
        } else {
          setFormGroups([]);
        }
      } catch (error) {
        setFormGroups([]);
      } finally {
        setLoading(false);
      }
    };

    loadFormGroups();
  }, []);

  const onClose = () => {
    setSelectedItem(null);
  };

  const saveLookup = async () => {
    await setSections((prevSections) => {
      // Get subsection context from selectItem
      let targetSubSectionId = selectItem?.subSectionId;
      let targetParentSubSectionId = selectItem?.parentSubSectionId;
      
      // Remove context properties from saved item
      const { parentSubSectionId: _, subSectionId: __, ...cleanedItem } = selectItem;
      
      // If not found in selectItem, search through sections to find which subsection contains this input
      if (!targetSubSectionId) {
        for (const s of prevSections) {
          for (const [inputKey, input] of Object.entries(s.inputs || {})) {
            if (input?.type === 'SubSection' && input?.inputs) {
              // Check first-level sub-section
              if (input.inputs[selectItem?.id]) {
                targetSubSectionId = inputKey;
                break;
              }
              // Check nested sub-sections (2nd level)
              for (const [nestedKey, nestedInput] of Object.entries(input.inputs || {})) {
                if (nestedInput?.type === 'SubSection' && nestedInput?.inputs) {
                  if (nestedInput.inputs[selectItem?.id]) {
                    targetSubSectionId = nestedKey;
                    targetParentSubSectionId = inputKey;
                    break;
                  }
                }
              }
            }
            if (targetSubSectionId) break;
          }
          if (targetSubSectionId) break;
        }
      }
      
      // Find the section to modify
      return prevSections.map((s) => {
        if (s.id === section?.id) {
          // Deep clone inputs to avoid reference issues
          const clonedInputs = deepCloneInputs(s.inputs || {});
          
          // If this is a nested subsection input (2 levels deep)
          if (targetParentSubSectionId && targetSubSectionId) {
            const parentSubSection = clonedInputs[targetParentSubSectionId];
            if (parentSubSection?.type === 'SubSection' && parentSubSection?.inputs?.[targetSubSectionId]) {
              const nestedSubSection = parentSubSection.inputs[targetSubSectionId];
              if (nestedSubSection?.type === 'SubSection') {
                nestedSubSection.inputs = {
                  ...nestedSubSection.inputs,
                  [selectItem?.id]: cleanedItem
                };
                return { ...s, inputs: clonedInputs };
              }
            }
          }
          
          // If this is a first-level subsection input
          if (targetSubSectionId) {
            const subSection = clonedInputs[targetSubSectionId];
            if (subSection && subSection.type === 'SubSection') {
              subSection.inputs = {
                ...subSection.inputs,
                [selectItem?.id]: cleanedItem
              };
              return { ...s, inputs: clonedInputs };
            }
          }
          
          // Update at section level (for regular fields)
          clonedInputs[selectItem?.id] = cleanedItem;
          return { ...s, inputs: clonedInputs };
        }
        return s; // Return the section as-is if it doesn't match
      });
    });
    setSelectedItem(null);
  };

  const options = useMemo(() => {
    if (formGroups && Array.isArray(formGroups) && formGroups.length > 0) {
      return formGroups.map(g => {
        return {
          label: g?.moduleLabel || g?.title || g?.name || g?._id || String(g?.id || ''),
          // Use moduleName or name FIRST (not _id) - API needs the actual module name to fetch records
          value: g?.moduleName || g?.name || g?.title || g?._id || g?.id
        };
      }).filter(opt => opt.value); // Filter out any invalid options
    }
    return [];
  }, [formGroups]);

  const handleChange = (name, value) => {
    if (name === 'label') {
      // When label changes, convert to camelCase and update the name field
      const camelCaseName = convertToCamelCase(value);
      setSelectedItem({ ...selectItem, label: value, name: camelCaseName });
    } else {
      const nextValue = name === 'gridSize' ? Number(value) : value;
      setSelectedItem({ ...selectItem, [name]: nextValue });
    }
  };

  const selectedOption = useMemo(() => {
    if (!selectItem?.moduleName || !options.length) return null;
    return options.find(option => 
      String(option.value) === String(selectItem?.moduleName) ||
      option.value === selectItem?.moduleName?._id
    ) || null;
  }, [options, selectItem?.moduleName]);

  return (
    <Modal
      className="properties-modal"
      onClose={onClose}
      title={`Config for ${selectItem?.type}`}
      isOpen={selectItem !== null}
    >
      <div className="lookup-config-container">
        <div className="lookup-config-field">
          <label className="lookup-config-label">Label Name</label>
          <InputField
            onChange={(e) => handleChange('label', e.target.value)}
            id={selectItem?.id}
            name='label'
            value={selectItem?.label || ''}
            className="lookup-config-input"
            placeholder="Label"
          />
        </div>
        <div className="lookup-config-field">
          <label className="lookup-config-label">Form Group</label>
          <SelectField
            options={options || []}
            value={selectedOption}
            onChange={(selected) => handleChange('moduleName', selected?.value || '')}
            placeholder="Select Form Group"
            isLoading={loading}
            isClearable={true}
            isSearchable={true}
            className="lookup-config-select"
            classNamePrefix="react-select"
          />
        </div>
        <div className="lookup-config-field lookup-config-checkbox">
          <label className="lookup-config-checkbox-label">
            <input
              type="checkbox"
              onChange={(e) => handleChange('multi', e.target.checked)}
              checked={selectItem?.multi || false}
              className="lookup-config-checkbox-input"
            />
            <span>Multi Select</span>
          </label>
        </div>
        <div className="lookup-config-field lookup-config-checkbox">
          <label className="lookup-config-checkbox-label">
            <input
              type="checkbox"
              onChange={(e) => handleChange('addExistingUI', e.target.checked)}
              checked={selectItem?.addExistingUI || false}
              className="lookup-config-checkbox-input"
            />
            <span>Add Existing UI</span>
          </label>
        </div>
        <div className="lookup-config-field lookup-config-checkbox">
          <label className="lookup-config-checkbox-label">
            <input
              type="checkbox"
              onChange={(e) => handleChange('showQuickCreate', e.target.checked)}
              checked={selectItem?.showQuickCreate || false}
              className="lookup-config-checkbox-input"
            />
            <span>Show Quick Create Button (+)</span>
          </label>
        </div>
        
        {/* Show All Data - only visible when Quick Create is enabled */}
        {selectItem?.showQuickCreate && (
          <div className="lookup-config-field lookup-config-checkbox lookup-config-nested">
            <label className="lookup-config-checkbox-label">
              <input
                type="checkbox"
                onChange={(e) => handleChange('showAllQuickCreateData', e.target.checked)}
                checked={selectItem?.showAllQuickCreateData || false}
                className="lookup-config-checkbox-input"
              />
              <span>Show All Data (Display all Quick Create entries as list below input)</span>
            </label>
          </div>
        )}
        
        {/* Show Lookup Module Form - hides lookup dropdown and shows the module form directly */}
        <div className="lookup-config-field lookup-config-checkbox">
          <label className="lookup-config-checkbox-label">
            <input
              type="checkbox"
              onChange={(e) => handleChange('showLookupModuleForm', e.target.checked)}
              checked={selectItem?.showLookupModuleForm || false}
              className="lookup-config-checkbox-input"
            />
            <span>Show Module Form (Hide lookup dropdown and display module's form fields directly)</span>
          </label>
          {selectItem?.showLookupModuleForm && (
            <p className="text-xs text-blue-600 mt-1 ml-6">
              ℹ️ Lookup field will be hidden. Module form will be displayed in its place.
            </p>
          )}
        </div>
        
        <div className="lookup-config-field">
          <label className="lookup-config-label">Grid Size</label>
          <select
            name="gridSize"
            value={selectItem?.gridSize ?? getDefaultGridSize(selectItem?.type)}
            onChange={(e) => handleChange('gridSize', e.target.value)}
            className="lookup-config-input"
          >
            {Array.from({ length: 12 }, (_, idx) => idx + 1).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="lookup-config-field">
          <ConditionalDisplay
            selectItem={selectItem}
            setSelectedItem={setSelectedItem}
            section={section}
            sectionsList={sectionsList}
            show={true}
          />
        </div>
        <div className="lookup-config-actions">
          <Button className="lookup-config-save-btn" onClick={saveLookup}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LookupConfig;

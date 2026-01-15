import { useEffect, useRef, useState } from "react";
import { DotsThreeVertical, Check } from "@phosphor-icons/react";
import RuleEngineModal from "@equipped/rule-engine";
import { getAuthHeaders, getMethodApiCall } from "../../../../../services/apiClient.js";
import { alertWarning } from "../../../../../utils/alert.jsx";
import './FieldConfig.css';

const DropdownMenu = ({ children, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="field-config-dropdown" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="field-config-trigger">
        {trigger}
      </button>
      {isOpen && (
        <div className="field-config-menu">
          <ul>{children}</ul>
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ onClick, children }) => (
  <li onClick={onClick} className="field-config-item">
    {children}
  </li>
);

const FieldConfig = ({ hooksAndValue, group }) => {
  let {
    inputKey,
    sectionIndex,
    field,
    section,
    handleRequired,
    handleQuickCreate,
    handleViewable,
    handleRemoveField,
    setSelectedItem,
    setSelectSection,
    setSections,
    subSectionId, // Get subSectionId if this is a subsection input
    parentSubSectionId, // Get parentSubSectionId for nested sub-section inputs
  } = hooksAndValue;

  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [ruleModalData, setRuleModalData] = useState(null);

  const handleField = () => {
    // CRITICAL: Deep clone the field to avoid reference sharing (especially for options array)
    const clonedField = JSON.parse(JSON.stringify(field));
    const itemToSelect = { ...clonedField, id: inputKey };
    // If this is a subsection input, include subSectionId
    if (subSectionId) {
      itemToSelect.subSectionId = subSectionId;
    }
    // If this is a nested subsection input, include parentSubSectionId
    if (parentSubSectionId) {
      itemToSelect.parentSubSectionId = parentSubSectionId;
    }
    setSelectedItem(itemToSelect);
    setSelectSection(section);
  };

  const handleRuleEngine = async () => {
    try {
      const res = await getMethodApiCall(
        `/settings/get-formula-by-module-name/${group}`,
        getAuthHeaders(),
      );
      const rule = res?.data?.find(r => r._id === field?.formulaId);
      if (rule) {
        const ruleDetailRes = await getMethodApiCall(
          `/settings/get-formula-by-id/${rule._id}`,
          getAuthHeaders(),
        );
        setRuleModalData({ ...ruleDetailRes.data, isEdit: true });
        setRuleModalOpen(true);
      } else {
        setRuleModalData({ moduleName: group, moduleFilds: field?.name });
        setRuleModalOpen(true);
      }
    } catch (e) {
      setRuleModalData({ moduleName: group, moduleFilds: field?.name });
      setRuleModalOpen(true);
    }
  };

  return (
    <>
      <DropdownMenu trigger={<DotsThreeVertical size={20} className="field-config-icon" />}>
        {field?.removeAble && (
          <DropdownItem onClick={() => handleRemoveField(sectionIndex, inputKey)}>
            Remove
          </DropdownItem>
        )}
        <DropdownItem onClick={() => handleRequired(inputKey, !field?.required, section, subSectionId)}>
          Required {field?.required && <Check size={16} style={{ marginLeft: '4px' }} />}
        </DropdownItem>
        <DropdownItem 
          onClick={() => {
            // Cannot deselect Quick Create if field is Required
            if (field?.required && field?.quick) {
              alertWarning('Cannot disable Quick Create while field is Required. Please uncheck Required first.', 'Action Blocked');
              return;
            }
            handleQuickCreate(inputKey, !field?.quick, section, subSectionId);
          }}
        >
          Quick Create {field?.quick && <Check size={16} style={{ marginLeft: '4px' }} />}
          {field?.required && field?.quick && <span style={{ marginLeft: '4px', fontSize: '10px', color: '#999' }}>(locked)</span>}
        </DropdownItem>
        <DropdownItem onClick={() => handleViewable(inputKey, !(field?.isViewable !== false), section, subSectionId)}>
          Viewable {(field?.isViewable !== false) && <Check size={16} style={{ marginLeft: '4px' }} />}
        </DropdownItem>
        {field?.type !== "Lookup" && field?.type !== "Owner" && (
          <DropdownItem onClick={handleField}>Properties</DropdownItem>
        )}
        {field?.type === "Lookup" && <DropdownItem onClick={handleField}>Properties</DropdownItem>}
        {field?.type === "amount" && (
          <DropdownItem onClick={handleRuleEngine}>Rule Engine</DropdownItem>
        )}
      </DropdownMenu>
      <RuleEngineModal
        isOpen={ruleModalOpen}
        onClose={() => setRuleModalOpen(false)}
        initialData={ruleModalData}
        group={group}
        setSections={setSections}
        sectionIndex={sectionIndex}
        inputKey={inputKey}
        subSectionId={subSectionId}
        parentSubSectionId={parentSubSectionId}
        currentSections={hooksAndValue.sections}
      />
    </>
  );
};

export default FieldConfig;

import { useMemo, useState } from 'react';
import { canBeConditionalField, getNormalizedOptions } from '../../../../../utils/checkboxConditionalHelper.js';
import ToggleSwitch from '../../../../../components/ui/toggle/ToggleSwitch.jsx';

/**
 * ConditionalDisplay Component
 * Provides conditional display functionality for form fields based on Select/Radio/Checkbox field values
 * Enhanced to support Checkbox fields with options
 * 
 * @param {Object} props
 * @param {Object} props.selectItem - The currently selected field item
 * @param {Function} props.setSelectedItem - Function to update the selected field item
 * @param {Object} props.section - The current section containing the field
 * @param {Array} props.sectionsList - All sections in the form (to search across all sections)
 * @param {boolean} props.show - Whether to show this component (based on field type)
 */
const ConditionalDisplay = ({ selectItem, setSelectedItem, section, sectionsList = [], show = true }) => {
    if (!show) return null;

    // Get all Select/Radio/Checkbox fields from ALL sections across the entire form (including SubSections)
    // RECURSIVE scanning for all nesting levels
    const conditionalDisplayCandidates = useMemo(() => {
        const candidates = [];
        
        // Use sectionsList if available, otherwise fall back to current section
        const sectionsToScan = sectionsList.length > 0 ? sectionsList : (section ? [section] : []);
        
        // Recursive function to scan fields inside SubSections at any nesting level
        const scanFieldsRecursively = (inputs, pathPrefix, excludeId = null) => {
            Object.entries(inputs || {}).forEach(([id, input]) => {
                if (!input || id === excludeId) return;
                
                const inputType = (input?.type || '').toLowerCase();
                
                // If this is a SubSection, scan its contents recursively
                if (inputType === 'subsection') {
                    const subSectionLabel = input?.label || 'Untitled SubSection';
                    const newPath = `${pathPrefix} → ${subSectionLabel}`;
                    
                    // Recursively scan inside this SubSection
                    scanFieldsRecursively(input?.inputs, newPath, selectItem?.id);
                } else {
                    // This is a regular field - check if it's a candidate for conditional display
                    
                    // Handle fields with options (select, multiselect, radio)
                    if (['select', 'multiselect', 'radio'].includes(inputType)) {
                        const options = getNormalizedOptions(input);
                        if (options.length > 0) {
                            candidates.push({
                                id,
                                label: input?.label || 'Untitled',
                                name: input?.name || '',
                                type: inputType,
                                options: options,
                                sectionTitle: pathPrefix,
                                isFromSubSection: pathPrefix.includes('→'),
                            });
                        }
                    }
                    
                    // Handle checkbox fields (boolean - simple enable/disable toggle)
                    if (inputType === 'checkbox') {
                        candidates.push({
                            id,
                            label: input?.label || 'Untitled',
                            name: input?.name || '',
                            type: inputType,
                            isBoolean: true, // Flag to indicate this is a boolean checkbox
                            sectionTitle: pathPrefix,
                            isFromSubSection: pathPrefix.includes('→'),
                        });
                    }
                }
            });
        };
        
        // Scan all sections
        sectionsToScan.forEach(sec => {
            const sectionTitle = sec?.sectionsTitle || 'Untitled Section';
            
            // Scan fields in this section (including nested SubSections recursively)
            scanFieldsRecursively(sec?.inputs, sectionTitle, selectItem?.id);
        });
        
        return candidates;
    }, [sectionsList, section, selectItem?.id]);

    // Handle toggle of Conditional Display checkbox
    const handleConditionalDisplayToggle = (event) => {
        if (!selectItem) return;
        const { checked } = event.target;

        let conditionalField = {
            id: selectItem?.conditionalDisplay?.fieldId || "",
            name: selectItem?.conditionalDisplay?.fieldName || "",
            label: selectItem?.conditionalDisplay?.fieldLabel || "",
        };

        let selectedOptions = selectItem?.conditionalDisplay?.selectedOptions || [];
        let optionDetails = selectItem?.conditionalDisplay?.optionDetails || [];
        const conditionalDisplayCheckbox = selectItem?.conditionalDisplay?.conditionalDisplayCheckbox;
        const isFromSubSection = selectItem?.conditionalDisplay?.isFromSubSection;
        const sectionTitle = selectItem?.conditionalDisplay?.sectionTitle;

        const updatedItem = {
            ...selectItem,
            isConditionalDisplay: checked,
        };

        if (checked) {
            updatedItem.conditionalDisplay = {
                fieldId: conditionalField.id || "",
                fieldName: conditionalField.name || "",
                fieldLabel: conditionalField.label || "",
                selectedOptions: selectedOptions,
                optionDetails: optionDetails,
            };
            if (conditionalDisplayCheckbox !== undefined) {
                updatedItem.conditionalDisplay.conditionalDisplayCheckbox = conditionalDisplayCheckbox;
            }
            // Preserve subsection metadata if it exists
            if (isFromSubSection) {
                updatedItem.conditionalDisplay.isFromSubSection = isFromSubSection;
                updatedItem.conditionalDisplay.sectionTitle = sectionTitle || "";
            }
        } else {
            delete updatedItem.conditionalDisplay;
        }

        setSelectedItem(updatedItem);
    };

    // Handle change of parent field selection
    const handleConditionalDisplayFieldChange = (event) => {
        const { value } = event.target;
        const selectedField = conditionalDisplayCandidates.find(candidate => candidate.id === value);
        
        if (!selectedField || !selectItem) return;

        // Check if selected field is a checkbox
        const isCheckboxField = selectedField.isBoolean && selectedField.type === 'checkbox';

        const conditionalDisplayPayload = {
            fieldId: selectedField.id || "",
            fieldName: selectedField.name || "",
            fieldLabel: selectedField.label || "",
            isFromSubSection: selectedField.isFromSubSection || false,
        };

        // Add subsection info if the field is from a subsection
        if (selectedField.isFromSubSection) {
            conditionalDisplayPayload.sectionTitle = selectedField.sectionTitle || "";
        }

        // Add checkbox-specific or select/radio-specific properties
        if (isCheckboxField) {
            conditionalDisplayPayload.conditionalDisplayCheckbox = true;
        } else {
            conditionalDisplayPayload.selectedOptions = [];
            conditionalDisplayPayload.optionDetails = [];
        }

        const nextItem = {
            ...selectItem,
            conditionalDisplay: conditionalDisplayPayload,
        };

        setSelectedItem(nextItem);
    };

    // Handle toggle of individual options
    const handleConditionalOptionToggle = (option, checked) => {
        if (!selectItem?.conditionalDisplay) return;

        let selectedOptions = [...(selectItem.conditionalDisplay.selectedOptions || [])];
        let optionDetails = [...(selectItem.conditionalDisplay.optionDetails || [])];

        if (checked) {
            // Add option
            if (!selectedOptions.includes(option.id)) {
                selectedOptions.push(option.id);
                optionDetails.push({
                    id: option.id,
                    label: option.label || "",
                    value: option.value ?? "",
                });
            }
        } else {
            // Remove option
            selectedOptions = selectedOptions.filter(id => id !== option.id);
            optionDetails = optionDetails.filter(detail => detail.id !== option.id);
        }

        setSelectedItem({
            ...selectItem,
            conditionalDisplay: {
                ...selectItem.conditionalDisplay,
                selectedOptions,
                optionDetails,
            },
        });
    };

    // Get normalized options from the selected parent field
    const conditionalDisplayOptions = useMemo(() => {
        if (!selectItem?.conditionalDisplay?.fieldId) return [];
        const selectedField = conditionalDisplayCandidates.find(
            candidate => candidate.id === selectItem.conditionalDisplay.fieldId
        );
        if (!selectedField) return [];
        return (selectedField?.options || []).map(option => {
            if (option && typeof option === 'object') {
                const optionId = option?.id ?? option?.value ?? String(option?.label ?? option);
                const optionValue = option?.value ?? option?.id ?? optionId;
                const optionLabel = option?.label ?? option?.name ?? optionValue;
                return {
                    id: String(optionId),
                    value: optionValue,
                    label: String(optionLabel),
                };
            }
            return {
                id: String(option),
                value: option,
                label: String(option),
            };
        });
    }, [conditionalDisplayCandidates, selectItem?.conditionalDisplay?.fieldId]);

    return (
      <div className="col-span-2">
        <div className="flex flex-col gap-2">
          <ToggleSwitch
            checked={Boolean(selectItem?.isConditionalDisplay)}
            onChange={handleConditionalDisplayToggle}
            label={<span className="text-base font-medium">Conditional Display</span>}
            className="property-label"
          />
          {selectItem?.isConditionalDisplay && (
            <div className="flex flex-col gap-3 pl-6 border-l-2 border-gray-300">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium property-label">
                  Show this field when:
                </label>
                
                {/* Simple Select Dropdown */}
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectItem?.conditionalDisplay?.fieldId || ""}
                  onChange={handleConditionalDisplayFieldChange}
                >
                  <option value="">Select a field...</option>
                  {conditionalDisplayCandidates.map((candidate) => {
                    const fieldTypeLabel = candidate.type ? `[${candidate.type.toUpperCase()}]` : '';
                    const displayLabel = candidate.sectionTitle
                      ? `${candidate.sectionTitle} → ${candidate.label} ${fieldTypeLabel}`
                      : `${candidate.label} ${fieldTypeLabel}`;
                    
                    return (
                      <option key={candidate.id} value={candidate.id}>
                        {displayLabel}
                      </option>
                    );
                  })}
                </select>
              </div>
              {selectItem?.conditionalDisplay?.fieldId &&
                (() => {
                  const selectedField = conditionalDisplayCandidates.find(
                    (candidate) =>
                      candidate.id === selectItem.conditionalDisplay.fieldId
                  );
                  const isCheckboxField =
                    selectedField?.isBoolean &&
                    selectedField?.type === "checkbox";

                  // For checkbox fields: show simple enable/disable toggle
                  if (isCheckboxField) {
                    const isEnabled =
                      selectItem?.conditionalDisplay
                        ?.conditionalDisplayCheckbox ?? true;

                    return (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium property-label">
                          Show field when checkbox is:
                        </label>
                        <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
                          <span className={`text-sm font-medium ${!isEnabled ? 'text-blue-600' : 'text-gray-400'}`}>
                            Unchecked
                          </span>
                          <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                              className="sr-only peer"
                            checked={isEnabled}
                            onChange={(e) => {
                              setSelectedItem({
                                ...selectItem,
                                conditionalDisplay: {
                                  ...selectItem.conditionalDisplay,
                                  conditionalDisplayCheckbox: e.target.checked,
                                },
                              });
                            }}
                          />
                            <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                          <span className={`text-sm font-medium ${isEnabled ? 'text-blue-600' : 'text-gray-400'}`}>
                            Checked
                              </span>
                            </div>
                        <p className="text-xs text-gray-500">
                              {isEnabled
                                ? "Field will show when checkbox is checked (true)"
                                : "Field will show when checkbox is unchecked (false)"}
                            </p>
                      </div>
                    );
                  }

                  // For select/radio/multiselect fields: show options list
                  if (conditionalDisplayOptions.length > 0) {
                    return (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium property-label">
                          Has one of these values:
                        </label>
                        <div className="flex flex-col gap-1 max-h-32 overflow-y-auto border border-gray-300 rounded p-2 bg-gray-50">
                          {conditionalDisplayOptions.map((option) => {
                            const isEnabled =
                              selectItem?.conditionalDisplay?.selectedOptions?.includes(
                                option.id
                              ) || false;

                            return (
                              <label
                                key={option.id}
                                className={`flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 p-1 rounded ${
                                  isEnabled ? "bg-green-50" : ""
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 accent-primary"
                                  checked={isEnabled}
                                  onChange={(e) =>
                                    handleConditionalOptionToggle(
                                      option,
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="text-gray-700">
                                  {option.label}
                                </span>
                                <span
                                  className={`ml-auto text-xs font-medium px-2 py-0.5 rounded ${
                                    isEnabled
                                      ? "bg-green-600 text-white"
                                      : "bg-gray-400 text-white"
                                  }`}
                                >
                                  {isEnabled ? "Enabled" : "Disabled"}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                        {selectItem?.conditionalDisplay?.selectedOptions
                          ?.length > 0 && (
                          <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                            Selected:{" "}
                            {
                              selectItem.conditionalDisplay.selectedOptions
                                .length
                            }{" "}
                            option(s) - Field will show when ANY of these values
                            are selected
                          </div>
                        )}
                      </div>
                    );
                  }

                  return null;
                })()}
            </div>
          )}
        </div>
      </div>
    );
};

export default ConditionalDisplay;

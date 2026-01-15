import { Fragment, useMemo } from "react";
import { Plus, Minus } from "@phosphor-icons/react";
import Button from "../../../../../components/ui/button/Button.jsx";
import CancelButton from "../../../../../components/ui/button/CancelButton.jsx";
import Modal from "../../../../../components/custom/modal/Modal.jsx";
import { capitalize, generateUniqueInputName, genrateUID, getTitleByKeyName } from "../../../../../utils/index.js";
import { InputField } from "../../../../../components/inputs/input/index.jsx";
import ConditionalDisplay from './ConditionalDisplay.jsx';
import './Properties.css';

const getDefaultGridSize = (type) => {
    const normalised = (type || '').toLowerCase();
    if (normalised === 'checkbox') return 12;
    return 6;
};

const Properties = ({ selectItem, setSelectedItem, setSections, section, sectionsList = [], subSectionId }) => {

    const onClose = () => {
        setSelectedItem(null);
    };

    const supportsDependency = ['select', 'multiselect', 'radio'].includes((selectItem?.type || '').toLowerCase());
    const isFileType = (selectItem?.type || '').toLowerCase() === 'file';
    const isLookupType = (selectItem?.type || '').toLowerCase() === 'lookup';
    const isNumberType = ['number', 'amount'].includes((selectItem?.type || '').toLowerCase());
    // Show Conditional Display for ALL input types (including Select/Radio/Multiselect)
    const supportsConditionalDisplay = true;

    const dependencyCandidates = useMemo(() => {
        const pool = section ? [section] : Array.isArray(sectionsList) ? sectionsList : [];
        const candidates = [];
        pool.forEach(sec => {
            const rawInputs = sec?.inputs;
            const inputEntries = Array.isArray(rawInputs)
                ? rawInputs.map((input, index) => [input?.id || `index-${index}`, input])
                : Object.entries(rawInputs || {});

            inputEntries.forEach(([id, input]) => {
                if (!input || id === selectItem?.id) return;

                const rawType = input?.type || input?.FieldType || input?.FieldName || '';
                const inputType = typeof rawType === 'string' ? rawType.toLowerCase() : '';

                let rawOptions = input?.options ?? input?.Options ?? null;
                if (typeof rawOptions === 'string') {
                    try {
                        rawOptions = JSON.parse(rawOptions);
                    } catch (err) {
                        rawOptions = null;
                    }
                }

                let normalisedOptions = [];

                if (Array.isArray(rawOptions)) {
                    normalisedOptions = rawOptions.filter(Boolean);
                } else if (rawOptions && typeof rawOptions === 'object') {
                    normalisedOptions = Object.values(rawOptions).filter(Boolean);
                }

                if (!normalisedOptions.length) return;

                candidates.push({
                    id,
                    label: input?.label || input?.FieldLabel || input?.FieldName || input?.name || input?.placeholder || 'Untitled Field',
                    name: input?.name || input?.FieldName || '',
                    options: normalisedOptions,
                });
            });
        });
        return candidates;
    }, [sectionsList, selectItem?.id]);

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

    const saveProp = async () => {
        await setSections((prevSections) => {
            // Ensure the name is unique before saving
            const uniqueName = generateUniqueInputName(selectItem?.label || '', prevSections, selectItem?.id);
            // Remove parentSubSectionId from the saved item (it's just for reference)
            const { parentSubSectionId: _, subSectionId: __, ...cleanedItem } = selectItem;
            const updatedItem = { ...cleanedItem, name: uniqueName };
            
            // CRITICAL: Check if this is a nested subsection input (2 levels deep)
            let targetSubSectionId = subSectionId || selectItem?.subSectionId;
            let targetParentSubSectionId = selectItem?.parentSubSectionId;
            
            // If not found in props or selectItem, search through sections to find which subsection contains this input
            if (!targetSubSectionId) {
                // Search in first-level sub-sections
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
                                    [selectItem?.id]: updatedItem
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
                                            [selectItem?.id]: updatedItem
                            };
                            return { ...s, inputs: clonedInputs };
                        }
                    }
                    
                    // CRITICAL: Before updating section, double-check this input is NOT in any subsection
                    // This prevents accidentally adding subsection inputs to section
                    const isInSubSection = prevSections.some(sec => 
                        Object.values(sec.inputs || {}).some(input => {
                            if (input?.type === 'SubSection' && input?.inputs) {
                                // Check first level
                                if (input.inputs[selectItem?.id]) return true;
                                // Check nested level
                                return Object.values(input.inputs || {}).some(nestedInput => 
                                    nestedInput?.type === 'SubSection' && 
                                    nestedInput?.inputs && 
                                    nestedInput.inputs[selectItem?.id]
                                );
                            }
                            return false;
                        })
                    );
                    
                    // Only update section if input is NOT in any subsection
                    if (!isInSubSection) {
                        clonedInputs[selectItem?.id] = updatedItem;
                        return { ...s, inputs: clonedInputs };
                    }
                    
                    // If input is in subsection, return section unchanged
                    return s;
                }
                return s; // Return the section as-is if it doesn't match
            });
        });
        setSelectedItem(null);
    }

    const disablebyKey = (keyname) => {
        // Keys that should not be rendered by the generic loop (either hidden or rendered separately)
        const disabledKeys = [
            'id', 'name', 'value', 'type', 'options', 
            'isDependent', 'dependentFieldId', 'dependentFieldName', 'dependentFieldLabel', 'dependency',
            'isDraggable', 'isConditionalDisplay', 'conditionalDisplay',
            // File type properties (rendered separately)
            'maxFileSize', 'maxFiles', 'allowedFileTypes',
            // Number/Amount type properties (rendered separately at the end)
            'minValue', 'maxValue',
            // Sub-section related
            'subSectionId', 'enabled'
        ];
        return disabledKeys.includes(keyname);
    }

    const handleChecked = (e) => {
        let { checked, name } = e.target
        setSelectedItem({ ...selectItem, [name]: checked })
    }

    const renderInput = (keyname, value) => {
        if (keyname === 'gridSize') {
            const options = Array.from({ length: 12 }, (_, idx) => idx + 1);
            return (
                <div className="w-full">
                    <label className="property-label">Grid Size</label>
                    <select
                        name="gridSize"
                        value={value ?? 6}
                        onChange={handleonChange}
                        className="dependency-select-full mt-1"
                    >
                        {options.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }
        if (typeof value === 'boolean' && keyname !== 'removeAble') {
            return <div className="w-full">
                <label className="property-label">{getTitleByKeyName(keyname)}</label>
                <label className="inline-flex items-center cursor-pointer toggle-label-wrapper">
                    <InputField onChange={handleChecked}
                        id={selectItem?.id}
                        name={keyname}
                        defaultChecked={selectItem[keyname]}
                        type="checkbox" value={selectItem[keyname]} className="sr-only peer-toggle" />
                    <div className="toggle-switch-peer"></div>
                    <span className="ms-3 text-sm font-medium property-label">Yes/No</span>
                </label>
            </div>
        } else if (keyname !== 'removeAble' && keyname !== 'animationClass' && keyname !== 'moduleName') {
            return <div className="w-full">
                <label className="property-label">{getTitleByKeyName(keyname)}</label>
                <InputField
                    value={selectItem[keyname] ?? ""}
                    placeholder={getTitleByKeyName(keyname)}
                    id={selectItem?.id}
                    onChange={handleonChange}
                    name={keyname}
                    className="disabled:bg-gray-100 w-full text-sm mt-1 border p-2 rounded bg-transparent transition duration-300 ease focus:outline-none focus:none property-input-field"
                />
            </div>
        }
    }

    const handleOptionChange = (e) => {
        let { name, value, id } = e.target
        // CRITICAL: Create new option objects instead of mutating - prevents reference sharing issues
        let options = selectItem['options']?.map(option => {
            if (option?.id === id) {
                // Return a new object with the updated property (don't mutate original)
                return { ...option, [name]: capitalize(value) }
            }
            return { ...option } // Also clone unchanged options to be safe
        })
        setSelectedItem({ ...selectItem, options })
    }

    const handleonChange = (e) => {
        let { name, value } = e.target
        const nextValue = name === 'gridSize' ? Number(value) : value;
        if (name === 'label') {
            // Generate unique name based on label (trimmed for name generation only)
            const uniqueName = generateUniqueInputName(value?.trim() || '', sectionsList, selectItem?.id)
            setSelectedItem({ ...selectItem, [name]: nextValue, name: uniqueName })
        } else {
            setSelectedItem({ ...selectItem, [name]: nextValue })
        }
    }

    const buildOptionMappings = (optionsList = []) => {
        const mappings = {};
        optionsList.forEach(option => {
            const key = option?.id;
            if (!key) return;
            if (option?.dependentOptionId) {
                mappings[String(key)] = {
                    parentOptionId: option?.dependentOptionId,
                    parentOptionLabel: option?.dependentOptionLabel || "",
                    parentOptionValue: option?.dependentOptionValue ?? "",
                };
            }
        });
        return mappings;
    };

    const normaliseOptionDependency = (option, includeFields, mapping = {}) => {
        if (!option) return option;
        const key = option?.id ? String(option.id) : undefined;
        if (!includeFields) {
            const { dependentOptionId, dependentOptionLabel, dependentOptionValue, ...rest } = option;
            return rest;
        }
        const mapEntry = key ? mapping[key] : undefined;
        return {
            ...option,
            dependentOptionId: option?.dependentOptionId ?? mapEntry?.parentOptionId ?? "",
            dependentOptionLabel: option?.dependentOptionLabel ?? mapEntry?.parentOptionLabel ?? "",
            dependentOptionValue: option?.dependentOptionValue ?? mapEntry?.parentOptionValue ?? "",
        };
    };

    const handleDependencyToggle = (event) => {
        if (!supportsDependency || !selectItem) return;
        const { checked } = event.target;

        const existingMappings = selectItem?.dependency?.optionMappings || {};
        let updatedOptions = Array.isArray(selectItem?.options)
            ? selectItem.options.map(option => normaliseOptionDependency(option, checked, existingMappings))
            : [];

        let dependencyField = {
            id: selectItem?.dependentFieldId || selectItem?.dependency?.fieldId || "",
            name: selectItem?.dependentFieldName || selectItem?.dependency?.fieldName || "",
            label: selectItem?.dependentFieldLabel || selectItem?.dependency?.fieldLabel || "",
        };

        if (checked && !dependencyField.id && dependencyCandidates.length) {
            const first = dependencyCandidates[0];
            dependencyField = {
                id: first?.id || "",
                name: first?.name || "",
                label: first?.label || "",
            };
            updatedOptions = updatedOptions.map(option =>
                normaliseOptionDependency(
                    { ...option, dependentOptionId: "", dependentOptionLabel: "", dependentOptionValue: "" },
                    true
                )
            );
        }

        const updatedItem = {
            ...selectItem,
            isDependent: checked,
            dependentFieldId: checked ? dependencyField.id : "",
            dependentFieldName: checked ? dependencyField.name : "",
            dependentFieldLabel: checked ? dependencyField.label : "",
            options: updatedOptions,
        };

        if (checked) {
            updatedItem.dependency = {
                fieldId: dependencyField.id || "",
                fieldName: dependencyField.name || "",
                fieldLabel: dependencyField.label || "",
                optionMappings: buildOptionMappings(updatedOptions),
            };
        } else {
            delete updatedItem.dependency;
        }

        setSelectedItem(updatedItem);
    };

    const handleDependencyFieldChange = (event) => {
        if (!selectItem) return;
        const { value } = event.target;
        const selectedField = dependencyCandidates.find(candidate => candidate.id === value);
        const resetOptions = Array.isArray(selectItem?.options)
            ? selectItem.options.map(option =>
                normaliseOptionDependency(
                    { ...option, dependentOptionId: "", dependentOptionLabel: "", dependentOptionValue: "" },
                    true
                ))
            : [];

        const dependencyPayload = {
            fieldId: value || "",
            fieldName: selectedField?.name || "",
            fieldLabel: selectedField?.label || "",
            optionMappings: {},
        };

        const nextItem = {
            ...selectItem,
            dependentFieldId: value,
            dependentFieldName: selectedField?.name || "",
            dependentFieldLabel: selectedField?.label || "",
            options: resetOptions,
        };

        if (selectItem?.isDependent) {
            nextItem.dependency = dependencyPayload;
        } else {
            delete nextItem.dependency;
        }

        setSelectedItem(nextItem);
    };

    const parentOptions = useMemo(() => {
        if (!selectItem?.dependentFieldId) return [];
        const selectedField = dependencyCandidates.find(candidate => candidate.id === selectItem.dependentFieldId);
        if (!selectedField) return [];
        return (selectedField?.options || []).map(option => {
            if (option && typeof option === 'object') {
                const optionId = option?.id ?? option?.value ?? option?.key ?? option?.name ?? String(option?.label ?? option);
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
    }, [dependencyCandidates, selectItem?.dependentFieldId]);

    const addOptions = () => {
        const options = Array.isArray(selectItem?.options) ? [...selectItem.options] : [];
        const newOption = {
            id: genrateUID(),
            label: '',
            value: Number(options.length + 1),
        };
        if (selectItem?.isDependent) {
            newOption.dependentOptionId = "";
            newOption.dependentOptionLabel = "";
            newOption.dependentOptionValue = "";
        }
        const nextOptions = [...options, newOption];

        let nextDependency = selectItem?.dependency;
        if (selectItem?.isDependent) {
            nextDependency = {
                fieldId: selectItem?.dependentFieldId || selectItem?.dependency?.fieldId || "",
                fieldName: selectItem?.dependentFieldName || selectItem?.dependency?.fieldName || "",
                fieldLabel: selectItem?.dependentFieldLabel || selectItem?.dependency?.fieldLabel || "",
                optionMappings: { ...(selectItem?.dependency?.optionMappings || {}) },
            };
            nextDependency.optionMappings[String(newOption.id)] = {
                parentOptionId: "",
                parentOptionLabel: "",
                parentOptionValue: "",
            };
        }

        setSelectedItem({
            ...selectItem,
            options: nextOptions,
            dependency: selectItem?.isDependent ? nextDependency : selectItem?.dependency,
        })
    }

    const handleRemove = (opId) => {
        const filteredOptions = (selectItem?.options || []).filter((option) => option?.id !== opId);
        let dependencyPayload = selectItem?.dependency;
        if (selectItem?.isDependent && dependencyPayload) {
            const optionMappings = { ...(dependencyPayload.optionMappings || {}) };
            delete optionMappings[String(opId)];
            dependencyPayload = {
                ...dependencyPayload,
                optionMappings,
            };
        }
        setSelectedItem({
            ...selectItem,
            options: filteredOptions,
            dependency: dependencyPayload,
        })
    }

    const handleOptionDependencyChange = (optionId, parentId) => {
        const parentOption = parentOptions.find(option => option.id === parentId);
        const updatedOptions = (selectItem?.options || []).map(option => {
            if (option?.id !== optionId) return option;
            return {
                ...option,
                dependentOptionId: parentId,
                dependentOptionLabel: parentOption?.label || "",
                dependentOptionValue: parentOption?.value ?? "",
            };
        });
        let optionMappings = { ...(selectItem?.dependency?.optionMappings || {}) };
        const key = String(optionId);
        if (parentId) {
            optionMappings[key] = {
                parentOptionId: parentId,
                parentOptionLabel: parentOption?.label || "",
                parentOptionValue: parentOption?.value ?? "",
            };
        } else {
            delete optionMappings[key];
        }

        const dependencyPayload = selectItem?.isDependent
            ? {
                fieldId: selectItem?.dependentFieldId || "",
                fieldName: selectItem?.dependentFieldName || "",
                fieldLabel: selectItem?.dependentFieldLabel || "",
                optionMappings,
            }
            : selectItem?.dependency;

        setSelectedItem({ ...selectItem, options: updatedOptions, dependency: dependencyPayload });
    };

    return (
        <Modal
            className="w-1/2"
            onClose={onClose}
            title={`Config for ${selectItem?.type}`}
            isOpen={selectItem !== null}
        >
            <div className="grid grid-cols-2 gap-2">
                {supportsDependency && (
                    <div className="col-span-2">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                            <label className="flex items-center gap-2 text-sm font-medium property-label">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 accent-primary"
                                    checked={Boolean(selectItem?.isDependent)}
                                    onChange={handleDependencyToggle}
                                />
                                <span>Make this select box dependent</span>
                            </label>
                            {selectItem?.isDependent && (
                                <div className="flex w-full flex-col gap-1">
                                    <select
                                        className="dependency-select-full"
                                        value={selectItem?.dependentFieldId || ""}
                                        onChange={handleDependencyFieldChange}
                                    >
                                        <option value="">
                                            {dependencyCandidates.length ? 'Select field to depend on' : 'No select fields available'}
                                        </option>
                                        {dependencyCandidates.map(candidate => (
                                            <option key={candidate.id} value={candidate.id}>
                                                {candidate.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {isFileType && (
                    <>
                        <div className="col-span-2">
                            <label className="flex items-center gap-2 text-sm font-medium property-label">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 accent-primary"
                                    name="isDraggable"
                                    checked={selectItem?.isDraggable ?? true}
                                    onChange={handleChecked}
                                />
                                <span>Draggable Section</span>
                            </label>
                        </div>
                        
                        {/* File Size Limit */}
                        <div className="col-span-1">
                            <label className="property-label">Max File Size (MB)</label>
                            <InputField
                                type="number"
                                min="0"
                                step="0.1"
                                value={selectItem?.maxFileSize ?? ""}
                                placeholder="e.g., 5"
                                name="maxFileSize"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedItem({ 
                                        ...selectItem, 
                                        maxFileSize: val === "" ? undefined : parseFloat(val) 
                                    });
                                }}
                                className="disabled:bg-gray-100 w-full text-sm mt-1 border p-2 rounded bg-transparent transition duration-300 ease focus:outline-none focus:none property-input-field"
                            />
                            <span className="text-xs text-gray-500">Maximum file size in MB</span>
                        </div>
                        
                        {/* Max Number of Files */}
                        <div className="col-span-1">
                            <label className="property-label">Max Files</label>
                            <InputField
                                type="number"
                                min="1"
                                value={selectItem?.maxFiles ?? ""}
                                placeholder="e.g., 5"
                                name="maxFiles"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedItem({ 
                                        ...selectItem, 
                                        maxFiles: val === "" ? undefined : parseInt(val, 10) 
                                    });
                                }}
                                className="disabled:bg-gray-100 w-full text-sm mt-1 border p-2 rounded bg-transparent transition duration-300 ease focus:outline-none focus:none property-input-field"
                            />
                            <span className="text-xs text-gray-500">Maximum number of files allowed</span>
                        </div>
                        
                        {/* Allowed File Types */}
                        <div className="col-span-2">
                            <label className="property-label">Allowed File Types</label>
                            <InputField
                                type="text"
                                value={selectItem?.allowedFileTypes ?? ""}
                                placeholder="e.g., jpg, png, pdf, doc, xlsx"
                                name="allowedFileTypes"
                                onChange={(e) => {
                                    setSelectedItem({ 
                                        ...selectItem, 
                                        allowedFileTypes: e.target.value 
                                    });
                                }}
                                className="disabled:bg-gray-100 w-full text-sm mt-1 border p-2 rounded bg-transparent transition duration-300 ease focus:outline-none focus:none property-input-field"
                            />
                            <span className="text-xs text-gray-500">Comma-separated file extensions (leave empty for all types)</span>
                        </div>
                    </>
                )}
                {isLookupType && (
                    <div className="col-span-2">
                        <label className="flex items-center gap-2 text-sm font-medium property-label">
                            <input
                                type="checkbox"
                                className="h-4 w-4 accent-primary"
                                name="showQuickCreate"
                                checked={selectItem?.showQuickCreate ?? false}
                                onChange={handleChecked}
                            />
                            <span>Show Quick Create Button (+ button to create new record in popup)</span>
                        </label>
                    </div>
                )}
                {/* Conditional Display - Available for ALL input types */}
                <ConditionalDisplay
                    selectItem={selectItem}
                    setSelectedItem={setSelectedItem}
                    section={section}
                    sectionsList={sectionsList}
                    show={supportsConditionalDisplay}
                />
                {
                    selectItem && (() => {
                        const entries = Object.entries(selectItem || {});
                        return entries.map(([keyname, field]) => (
                            <Fragment key={keyname}>
                                {keyname !== 'gridSize' && keyname !== 'required' && !disablebyKey(keyname) ? renderInput(keyname, field) : ''}
                            </Fragment>
                        ));
                    })()
                }
                
                {/* Required and Grid Size - side by side on same line */}
                {selectItem && (
                    <>
                        <div className="col-span-1">
                            {renderInput('required', selectItem?.required ?? false)}
                        </div>
                        <div className="col-span-1">
                            {renderInput(
                                'gridSize',
                                selectItem?.gridSize ?? getDefaultGridSize(selectItem?.type || selectItem?.FieldType)
                            )}
                        </div>
                    </>
                )}
                
                {/* Min/Max Value for Number and Amount fields - at the end */}
                {isNumberType && (
                    <>
                        <div className="col-span-1">
                            <label className="property-label">Min Value</label>
                            <InputField
                                type="number"
                                value={selectItem?.minValue ?? ""}
                                placeholder="e.g., 10"
                                name="minValue"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedItem({ 
                                        ...selectItem, 
                                        minValue: val === "" ? undefined : parseFloat(val) 
                                    });
                                }}
                                className="disabled:bg-gray-100 w-full text-sm mt-1 border p-2 rounded bg-transparent transition duration-300 ease focus:outline-none focus:none property-input-field"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="property-label">Max Value</label>
                            <InputField
                                type="number"
                                value={selectItem?.maxValue ?? ""}
                                placeholder="e.g., 100"
                                name="maxValue"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedItem({ 
                                        ...selectItem, 
                                        maxValue: val === "" ? undefined : parseFloat(val) 
                                    });
                                }}
                                className="disabled:bg-gray-100 w-full text-sm mt-1 border p-2 rounded bg-transparent transition duration-300 ease focus:outline-none focus:none property-input-field"
                            />
                        </div>
                    </>
                )}
            </div>
            {selectItem?.options && <div className="h-52 scroll-container overflow-scroll">
                <div className="flex justify-between items-center mb-2">
                    <label className="property-label">Options</label>
                    <label className="select-all-checkbox-label">
                        <input
                            type="checkbox"
                            checked={selectItem?.options?.every(opt => opt?.enabled !== false)}
                            onChange={(e) => {
                                const newEnabled = e.target.checked;
                                const updatedOptions = selectItem?.options?.map(opt => ({
                                    ...opt,
                                    enabled: newEnabled
                                }));
                                setSelectedItem({ ...selectItem, options: updatedOptions });
                            }}
                            className="select-all-checkbox"
                        />
                        <span>Select All</span>
                    </label>
                </div>
                {
                    selectItem?.options?.map((option, i) => {
                        const showDependencyColumn = selectItem?.isDependent && parentOptions.length > 0;
                        const isEnabled = option?.enabled !== false; // Default to enabled
                        return (
                            <div
                                className={`option-row ${showDependencyColumn ? 'with-dependency' : ''}`}
                                key={option?.id}
                            >
                                {/* Enable/Disable Checkbox */}
                                <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={(e) => {
                                        const updatedOptions = selectItem?.options?.map(opt => 
                                            opt?.id === option?.id ? { ...opt, enabled: e.target.checked } : opt
                                        );
                                        setSelectedItem({ ...selectItem, options: updatedOptions });
                                    }}
                                    className="option-enable-checkbox"
                                    title={isEnabled ? 'Enabled - Click to disable' : 'Disabled - Click to enable'}
                                />
                                {showDependencyColumn && (
                                    <select
                                        className="dependency-select-full"
                                        value={option?.dependentOptionId || ""}
                                        onChange={(event) => handleOptionDependencyChange(option?.id, event.target.value)}
                                    >
                                        <option value="">Select parent option</option>
                                        {parentOptions.map(parent => (
                                            <option key={parent.id} value={parent.id}>
                                                {parent.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <InputField
                                    onChange={handleOptionChange}
                                    id={option?.id}
                                    name='label'
                                    value={option?.label || ''}
                                    className="disabled:bg-gray-100 capitalize w-full text-sm mt-1 border px-3 py-2 rounded bg-transparent transition duration-300 ease focus:outline-none focus:none"
                                    placeholder="Label" />
                                <InputField
                                    onChange={handleOptionChange}
                                    id={option?.id}
                                    disabled
                                    value={option?.value || ''}
                                    name='value'
                                    className="disabled:bg-gray-100 capitalize w-full text-sm mt-1 border px-3 py-2 rounded bg-transparent transition duration-300 ease focus:outline-none focus:none option-value-input"
                                    placeholder="Value" />
                                <div className="option-actions">
                                    <CancelButton disabled={selectItem?.options?.length === 1} onClick={() => handleRemove(option?.id)} >
                                        <Minus />
                                    </CancelButton>
                                    <Button onClick={addOptions} >
                                        <Plus />
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                }
            </div>}
            
            <hr className="my-3" />
            <Button className='float-end mt-2' onClick={saveProp}>
                Save
            </Button>
        </Modal>
    );
};

export default Properties;

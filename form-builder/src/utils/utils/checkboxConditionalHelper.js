/**
 * Checkbox Conditional Display Helper
 * Separate utility file for handling checkbox field conditional display logic
 * This keeps the enhancement modular and prevents breaking existing functionality
 */

/**
 * Determines if a field type supports options (including checkbox)
 * @param {string} type - The field type
 * @returns {boolean} - True if the field type supports options
 */
export const supportsOptions = (type) => {
    if (!type) return false;
    const normalizedType = String(type).toLowerCase();
    return ['select', 'multiselect', 'radio', 'checkbox'].includes(normalizedType);
};

/**
 * Checks if a field is a checkbox type
 * @param {string} type - The field type
 * @returns {boolean} - True if the field is a checkbox
 */
export const isCheckboxField = (type) => {
    if (!type) return false;
    return String(type).toLowerCase() === 'checkbox';
};

/**
 * Gets normalized options from a field, including checkbox fields
 * @param {Object} field - The field object
 * @returns {Array} - Normalized options array
 */
export const getNormalizedOptions = (field) => {
    if (!field) return [];
    
    const fieldType = String(field.type || '').toLowerCase();
    
    // For checkbox fields, options might be structured differently
    // Check for options in various formats
    let rawOptions = field?.options ?? field?.Options ?? null;
    
    if (typeof rawOptions === 'string') {
        try {
            rawOptions = JSON.parse(rawOptions);
        } catch (err) {
            rawOptions = null;
        }
    }

    let normalizedOptions = [];

    if (Array.isArray(rawOptions)) {
        normalizedOptions = rawOptions.filter(Boolean);
    } else if (rawOptions && typeof rawOptions === 'object') {
        normalizedOptions = Object.values(rawOptions).filter(Boolean);
    }

    return normalizedOptions;
};

/**
 * Checks if a checkbox option is enabled for conditional display
 * @param {Object} conditionalDisplay - The conditional display configuration
 * @param {string} optionId - The option ID to check
 * @returns {boolean} - True if the option is enabled
 */
export const isCheckboxOptionEnabled = (conditionalDisplay, optionId) => {
    if (!conditionalDisplay || !optionId) return false;
    
    const selectedOptions = conditionalDisplay?.selectedOptions || [];
    return selectedOptions.includes(String(optionId));
};

/**
 * Toggles a checkbox option in the conditional display configuration
 * @param {Object} conditionalDisplay - Current conditional display configuration
 * @param {Object} option - The option to toggle
 * @param {boolean} enabled - Whether to enable or disable the option
 * @returns {Object} - Updated conditional display configuration
 */
export const toggleCheckboxOption = (conditionalDisplay, option, enabled) => {
    if (!conditionalDisplay || !option) return conditionalDisplay;

    let selectedOptions = [...(conditionalDisplay.selectedOptions || [])];
    let optionDetails = [...(conditionalDisplay.optionDetails || [])];

    const optionId = String(option.id);

    if (enabled) {
        // Add option if not already present
        if (!selectedOptions.includes(optionId)) {
            selectedOptions.push(optionId);
            optionDetails.push({
                id: optionId,
                label: option.label || "",
                value: option.value ?? "",
            });
        }
    } else {
        // Remove option
        selectedOptions = selectedOptions.filter(id => id !== optionId);
        optionDetails = optionDetails.filter(detail => detail.id !== optionId);
    }

    return {
        ...conditionalDisplay,
        selectedOptions,
        optionDetails,
    };
};

/**
 * Formats checkbox options for display in conditional display UI
 * @param {Array} options - Raw options array
 * @returns {Array} - Formatted options with id, value, and label
 */
export const formatCheckboxOptions = (options) => {
    if (!Array.isArray(options)) return [];

    return options.map(option => {
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
};

/**
 * Validates if a field can be used for conditional display
 * @param {Object} field - The field to validate
 * @returns {boolean} - True if the field can be used for conditional display
 */
export const canBeConditionalField = (field) => {
    if (!field) return false;
    
    const fieldType = String(field.type || '').toLowerCase();
    const hasOptions = getNormalizedOptions(field).length > 0;
    
    return supportsOptions(fieldType) && hasOptions;
};

/**
 * Gets field type display label for UI
 * @param {string} type - The field type
 * @returns {string} - Display label for the field type
 */
export const getFieldTypeLabel = (type) => {
    if (!type) return 'Field';
    
    const normalizedType = String(type).toLowerCase();
    const labels = {
        'select': 'Select',
        'multiselect': 'Multi-Select',
        'radio': 'Radio',
        'checkbox': 'Checkbox'
    };
    
    return labels[normalizedType] || type;
};

export default {
    supportsOptions,
    isCheckboxField,
    getNormalizedOptions,
    isCheckboxOptionEnabled,
    toggleCheckboxOption,
    formatCheckboxOptions,
    canBeConditionalField,
    getFieldTypeLabel
};

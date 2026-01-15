
export const shouldShowField = (field, formData, allFieldsInSection = []) => {
  if (field?.isViewable === false) {
    return false;
  }

  // Always show if conditional display is not enabled
  if (!field?.isConditionalDisplay || !field?.conditionalDisplay) {
    return true;
  }

  const { fieldName, fieldId, fieldStateKey, selectedOptions, conditionalDisplayCheckbox } = field.conditionalDisplay;
  
  const getParentValue = () => {
    
    // IMPORTANT: If fieldStateKey is explicitly provided (instance-specific), use ONLY that key
    // This prevents cross-instance value pollution in SubSections with multiple instances
    if (fieldStateKey) {
      // Try exact match first
      if (formData?.[fieldStateKey] !== undefined) {
        return formData[fieldStateKey];
      }
      
      // Try case-insensitive exact match
      const fieldStateKeyLower = fieldStateKey.toLowerCase();
      for (const [key, value] of Object.entries(formData || {})) {
        if (key.toLowerCase() === fieldStateKeyLower) {
          return value;
        }
      }
      
      // If fieldStateKey was provided but not found, return undefined immediately
      // Do NOT fall back to other keys - this is critical for instance isolation
      return undefined;
    }
    
    // Build all possible search terms (convert to lowercase for comparison)
    // Only used when fieldStateKey is NOT provided
    const searchTerms = [];
    if (fieldName) searchTerms.push(fieldName.toLowerCase());
    if (fieldId) searchTerms.push(fieldId.toLowerCase());
    
    // Also add fieldLabel if available
    const fieldLabel = field?.conditionalDisplay?.fieldLabel;
    if (fieldLabel) {
      searchTerms.push(fieldLabel.toLowerCase());
      searchTerms.push(fieldLabel.toLowerCase().replace(/\s+/g, ''));
    }
    
    // 1. Try direct key matches first
    for (const term of searchTerms) {
      if (formData?.[term] !== undefined) {
        return formData[term];
      }
    }
    
    // 2. Search for parent field in allFieldsInSection
    if (allFieldsInSection && allFieldsInSection.length > 0) {
      const parentField = allFieldsInSection.find(f => {
        const fName = (f?.name || '').toLowerCase();
        const fStateKey = (f?.stateKey || '').toLowerCase();
        const fId = (f?.id || '').toLowerCase();
        const fLabel = (f?.label || '').toLowerCase();
        
        return searchTerms.some(term => 
          term === fName || term === fStateKey || term === fId || term === fLabel
        );
      });
      
      if (parentField) {
        const possibleKeys = [
          parentField.stateKey,
          parentField.name,
          parentField.id,
          parentField.label?.toLowerCase().replace(/\s+/g, ''),
        ].filter(Boolean);
        
        for (const key of possibleKeys) {
          if (formData?.[key] !== undefined) {
            return formData[key];
          }
        }
      }
    }
    
    // 3. Aggressive search through all form data keys
    for (const [key, value] of Object.entries(formData || {})) {
      const keyLower = key.toLowerCase();
      
      for (const searchTerm of searchTerms) {
        if (keyLower === searchTerm) {
          return value;
        }
        
        if (keyLower.endsWith('_' + searchTerm) || keyLower.endsWith(searchTerm)) {
          return value;
        }
        
        const regex = new RegExp(`(^|_)${searchTerm}($|_)`, 'i');
        if (regex.test(key)) {
          return value;
        }
      }
      
      if (fieldId && keyLower.includes(fieldId.toLowerCase())) {
        return value;
      }
    }
    
    // 4. Last resort: fuzzy match on fieldName only
    if (fieldName) {
      const fieldNameLower = fieldName.toLowerCase();
      for (const [key, value] of Object.entries(formData || {})) {
        const keyLower = key.toLowerCase();
        const keyParts = keyLower.split('_');
        if (keyParts.includes(fieldNameLower)) {
          return value;
    }
      }
    }
    
    return undefined;
  };

  const parentValue = getParentValue();

  // Handle checkbox conditional display (boolean logic)
  if (conditionalDisplayCheckbox !== undefined && conditionalDisplayCheckbox !== null) {
    // Get the parent checkbox field's current value from form data
    const parentCheckboxValue = parentValue;

    // Convert parent value to boolean - handle all possible truthy values
    const isChecked = 
      parentCheckboxValue === true || 
      parentCheckboxValue === 'true' || 
      parentCheckboxValue === 1 ||
      parentCheckboxValue === '1';
    
    // If conditionalDisplayCheckbox is true, show field when checkbox is checked
    // If conditionalDisplayCheckbox is false, show field when checkbox is unchecked
    if (conditionalDisplayCheckbox === true) {
      return isChecked; // Show when checkbox is checked
    } else {
      return !isChecked; // Show when checkbox is unchecked
    }
  }

  // Handle select/radio/multiselect conditional display (original logic)
  // If no parent field name or no selected options configured, hide the field
  if ((!fieldName && !fieldStateKey && !fieldId) || !Array.isArray(selectedOptions) || selectedOptions.length === 0) {
    return false;
  }

  // parentValue was already retrieved above

  // If parent field has no value, hide the conditional field
  if (parentValue === undefined || parentValue === null || parentValue === '') {
    return false;
  }

  // Build trigger values set first (needed for both array and single value handling)
  const optionDetails = field.conditionalDisplay?.optionDetails || [];
  const triggerValues = new Set();
  selectedOptions.forEach(optId => {
    const normalizedOptId = String(optId).trim().toLowerCase();
    triggerValues.add(normalizedOptId);
    
    // Also add the option ID without prefix (e.g., "item-xxx" -> "xxx")
    if (normalizedOptId.startsWith('item-')) {
      triggerValues.add(normalizedOptId.slice(5));
    }
    
    const detail = optionDetails.find(d => 
      String(d?.id || '').trim().toLowerCase() === normalizedOptId
    );
    
    if (detail) {
      if (detail.value !== undefined && detail.value !== null) {
        const detailValue = String(detail.value).trim().toLowerCase();
        triggerValues.add(detailValue);
        // Also add raw value (case-sensitive) for exact matching
        triggerValues.add(String(detail.value).trim());
      }
      if (detail.label) {
        triggerValues.add(String(detail.label).trim().toLowerCase());
        // Also add raw label
        triggerValues.add(String(detail.label).trim());
      }
    }
  });
  // Handle array values (multiselect fields)
  if (Array.isArray(parentValue)) {
    // Show if any of the parent's values match the trigger values
    const matches = parentValue.some(val => {
      const normalizedVal = String(val).trim().toLowerCase();
      return triggerValues.has(normalizedVal);
    });
    return matches;
  }

  // Handle single value (select, radio fields)
  const parentValueStr = String(parentValue).trim();
  const normalizedParentValue = parentValueStr.toLowerCase();
  // Check if parent value matches any trigger value (case-insensitive)
  let matches = triggerValues.has(normalizedParentValue);
  
  // Also try exact match (case-sensitive)
  if (!matches) {
    matches = triggerValues.has(parentValueStr);
  }
  
  // Try matching the raw parent value against option IDs
  if (!matches) {
    matches = selectedOptions.some(opt => {
      const optStr = String(opt).trim();
      return optStr === parentValueStr || optStr.toLowerCase() === normalizedParentValue;
    });
    }
  
  // Try matching against option details values/labels directly
  if (!matches && optionDetails.length > 0) {
    matches = optionDetails.some(detail => {
      const detailValue = String(detail?.value ?? '').trim();
      const detailLabel = String(detail?.label ?? '').trim();
      const detailId = String(detail?.id ?? '').trim();
      
      return (
        detailValue === parentValueStr ||
        detailValue.toLowerCase() === normalizedParentValue ||
        detailLabel === parentValueStr ||
        detailLabel.toLowerCase() === normalizedParentValue ||
        detailId === parentValueStr ||
        detailId.toLowerCase() === normalizedParentValue
      );
    });
    
    // Only match if the detail is in selectedOptions
    if (matches) {
      const matchedDetail = optionDetails.find(detail => {
        const detailValue = String(detail?.value ?? '').trim();
        const detailLabel = String(detail?.label ?? '').trim();
        const detailId = String(detail?.id ?? '').trim();
        
        return (
          detailValue === parentValueStr ||
          detailValue.toLowerCase() === normalizedParentValue ||
          detailLabel === parentValueStr ||
          detailLabel.toLowerCase() === normalizedParentValue ||
          detailId === parentValueStr ||
          detailId.toLowerCase() === normalizedParentValue
        );
      });
      
      if (matchedDetail) {
        const matchedId = String(matchedDetail.id || '').trim().toLowerCase();
        matches = selectedOptions.some(opt => String(opt).trim().toLowerCase() === matchedId);
      }
    }
  }
  
  return matches;
};

export const getVisibleFields = (fields, formData) => {
  if (!Array.isArray(fields)) {
    return [];
  }

  return fields.filter(field => shouldShowField(field, formData, fields));
};

export const shouldValidateField = (field, formData) => {
  return shouldShowField(field, formData);
};

export const clearHiddenFieldValues = (formData, allFields) => {
  if (!Array.isArray(allFields)) {
    return formData;
  }

  const cleanedData = { ...formData };

  allFields.forEach(field => {
    const fieldName = field?.name || field?.stateKey || field?.id;
    if (!fieldName) return;

    // If field is not visible, remove its value from form data
    if (!shouldShowField(field, formData, allFields)) {
      delete cleanedData[fieldName];
    }
  });

  return cleanedData;
};

export const getConditionalDisplayConfig = (field) => {
  if (!field?.isConditionalDisplay || !field?.conditionalDisplay) {
    return null;
  }

  return {
    isEnabled: true,
    parentFieldName: field.conditionalDisplay.fieldName,
    parentFieldLabel: field.conditionalDisplay.fieldLabel,
    selectedOptions: field.conditionalDisplay.selectedOptions,
    optionDetails: field.conditionalDisplay.optionDetails,
  };
};

export const getOrderedVisibleFields = (fields, formData) => {
  if (!Array.isArray(fields)) {
    return [];
  }

  // First, filter to only visible fields
  const visibleFields = fields.filter(field => shouldShowField(field, formData, fields));
  
  // Group fields by whether they're conditional and their parent
  const fieldGroups = [];
  const processedFields = new Set();
  
  visibleFields.forEach(field => {
    if (processedFields.has(field)) return;
    
    const fieldName = field?.name || field?.stateKey || field?.id;
    
    // Add the current field
    fieldGroups.push(field);
    processedFields.add(field);
    
    // Find all conditional fields that depend on this field
    const dependentFields = visibleFields.filter(f => {
      if (processedFields.has(f)) return false;
      if (!f?.isConditionalDisplay || !f?.conditionalDisplay) return false;
      
      const parentFieldName = f.conditionalDisplay.fieldName;
      // Match by field name, stateKey, or any identifier
      return parentFieldName === fieldName || 
             parentFieldName === field?.stateKey ||
             parentFieldName === field?.name;
    });
    
    // Add dependent fields immediately after their parent
    dependentFields.forEach(depField => {
      fieldGroups.push(depField);
      processedFields.add(depField);
    });
  });
  
  return fieldGroups;
};

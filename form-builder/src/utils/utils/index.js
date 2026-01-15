// Generate unique ID
export const genrateUID = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Convert label to camelCase format (removes special characters and spaces)
export const convertToCamelCase = (label = "") => {
  if (!label) return "";
  
  // Remove special characters, keep only alphanumeric and spaces
  // Then split by spaces and convert to camelCase
  const camelCaseName = label
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .trim()
    .split(' ')
    .filter(word => word.length > 0) // Remove empty strings
    .map((word, index) => {
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');

  return camelCaseName || "";
};

// Generate unique input name based on label
export const generateUniqueInputName = (label = "", sections = [], excludeFieldId = null) => {
  if (!label) return `field_${genrateUID()}`;
  
  // Convert label to camelCase
  const baseName = label
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .map((word, index) => {
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('')
    .replace(/\s+/g, '');

  // Helper to recursively check names in nested inputs
  const checkNameInInputs = (inputs, targetName, excludeId) => {
    if (!inputs) return false;
    for (const [key, input] of Object.entries(inputs)) {
      if (!input) continue;
      // Check current input's name
      if (key !== excludeId && (input?.name === targetName || key === targetName)) {
        return true;
      }
      // Recursively check nested sub-sections
      if (input?.type === 'SubSection' && input?.inputs) {
        if (checkNameInInputs(input.inputs, targetName, excludeId)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check if name already exists (including in nested sub-sections)
  let name = baseName;
  let counter = 1;
  let exists = false;

  do {
    exists = false;
    for (const section of sections) {
      if (section?.inputs) {
        if (checkNameInInputs(section.inputs, name, excludeFieldId)) {
            exists = true;
          break;
          }
      }
    }
    
    if (exists) {
      name = `${baseName}${counter}`;
      counter++;
    }
  } while (exists);

  return name || `field_${genrateUID()}`;
};

// Get title by key name (formats camelCase, underscores, hyphens)
export const getTitleByKeyName = (value) => {
  if (value) {
    try {
      // Replace camelCase, underscores, and hyphens, then format the string
      let titleis = value
        ?.replace(/([a-z])([A-Z])/g, "$1 $2") // Handle camelCase
        ?.replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
        ?.toLowerCase() // Convert everything to lowercase
        ?.replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize the first letter of each word
        ?.replace(/\sId$/, ""); // Remove " Id" from the end if present

      return titleis;
    } catch (error) {
      return "";
    }
  }
  return "";
};

// Capitalize first letter of string
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Get the key to search module data (matches MinervaLMS)
export const getKeytoSearchModuleData = (moduleName) => {
  if (!moduleName) return 'name';
  
  const lowerModuleName = moduleName.toLowerCase();
  
  // Special cases (matching MinervaLMS logic)
  if (lowerModuleName === 'meeting' || lowerModuleName === 'icmeeting') {
    return 'subject';
  }
  
  if (lowerModuleName === 'users') {
    return 'fullname';
  }
  
  // Default: moduleName + "Name" (e.g., "loanonboardingName")
  return `${lowerModuleName}Name`;
};

// Format number to K, M, B notation
export const formatNumber = (value) => {
  if (value === null || value === undefined) return '0';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
};

// Convert condition rows into backend-friendly query format
export const formatOutputToQuery = (conditions, dataColumns = []) => {
  const result = {
    lookups: [],
    conditions: { operator: 'AND', rules: [] },
  };

  if (!Array.isArray(conditions) || !conditions.length) {
    return result;
  }

  // Ensure we have valid rules
  const hasAllFields = (condition) => {
    const hasField = !!condition.field;
    const hasOperator = !!condition.operator;
    const hasType = !!condition.type;

    let isValueValid = false;
    if (condition.operator === 'BETWEEN') {
      isValueValid =
        condition.value &&
        typeof condition.value === 'object' &&
        condition.value.from !== '' &&
        condition.value.to !== '';
    } else {
      isValueValid =
        condition.value !== undefined &&
        condition.value !== null &&
        condition.value !== '';
    }

    const hasAndOr = !!condition.andOr;

    return hasField && hasOperator && hasType && isValueValid && hasAndOr;
  };

  const filtered = conditions.filter(hasAllFields);
  if (!filtered.length) return result;

  filtered.forEach((condition, index) => {
    const value =
      condition.operator === 'BETWEEN' && typeof condition.value === 'object'
        ? { from: condition.value.from || '', to: condition.value.to || '' }
        : condition.value;

    const type =
      condition.type ||
      dataColumns?.find((f) => f.name === condition.field)?.type ||
      '';

    const rule = {
      field: condition.field,
      operator: condition.operator,
      value,
      type,
    };

    if (index === 0) {
      result.conditions.rules.push(rule);
    } else {
      const lastRule = result.conditions.rules.at(-1);
      if (lastRule?.operator) {
        result.conditions.rules.splice(-1, 1, {
          operator: condition.andOr,
          rules: [lastRule, rule],
        });
      } else if (lastRule?.rules) {
        if (lastRule.operator === condition.andOr) {
          lastRule.rules.push(rule);
        } else {
          result.conditions.rules.push({
            operator: condition.andOr,
            rules: [rule],
          });
        }
      }
    }
  });

  return result;
};

// Returns formatted value for date/time fields; falls back to raw value
export const getValueDatetimeOrText = (item, key) => {
  try {
    const value = item?.[key];
    
    // Handle null or undefined
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    const lower = (key || '').toLowerCase();
    const isTime =
      lower.includes('time') ||
      lower === 'from' ||
      lower === 'to';

    if (isTime && !value) {
      return 'N/A';
    } else if (isTime) {
      return new Date(value).toLocaleString();
    } else if (lower.includes('date')) {
      return new Date(value).toLocaleDateString();
    }
    
    // If value is an object or array, stringify it
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    // Return primitive values as-is
    return value;
  } catch (error) {
    return 'Err: to generate value';
  }
};

// Validate that every condition row has required parts
export const areAllConditionsFilled = (conditions = []) => {
  return conditions.every((condition) => {
    const hasField = condition.field;
    const hasOperator = condition.operator;
    const hasType = condition.type;

    let isValueValid = false;
    if (condition.operator === 'BETWEEN') {
      isValueValid =
        condition.value &&
        condition.value.from !== '' &&
        condition.value.to !== '';
    } else {
      isValueValid =
        condition.value !== undefined &&
        condition.value !== null &&
        condition.value !== '';
    }

    const hasAndOr = condition.andOr;

    return hasField && hasOperator && hasType && isValueValid && hasAndOr;
  });
};

const DEPENDENCY_SUPPORTED_TYPES = new Set(['select', 'multiselect', 'radio']);

// Deep clone function to avoid reference issues with nested objects
const deepCloneInputs = (inputs) => {
  if (!inputs || typeof inputs !== 'object') return {};

  // Use JSON parse/stringify for complete deep clone of ALL properties
  // This handles nested arrays (like options) and nested objects properly
  try {
    return JSON.parse(JSON.stringify(inputs));
  } catch (e) {
    // Fallback to manual clone if JSON parse fails (e.g., circular references)
    const cloned = {};
    Object.entries(inputs).forEach(([key, value]) => {
      if (!value) {
        cloned[key] = value;
        return;
      }

      if (value.type === 'SubSection') {
        // Deep clone sub-section with its nested inputs
        cloned[key] = {
          ...value,
          inputs: deepCloneInputs(value.inputs || {}),
        };
      } else {
        // Deep clone regular field
        cloned[key] = { ...value };
        // Also clone options array if present
        if (Array.isArray(value.options)) {
          cloned[key].options = value.options.map((opt) => ({ ...opt }));
        }
      }
    });
    return cloned;
  }
};

const getDefaultGridSize = (type) => {
  const normalisedType = (type || '').toLowerCase();
  if (normalisedType === 'checkbox') return 12;
  return 6;
};

const normaliseFieldDependency = (input) => {
  if (!input) return input;
  const field = {
    ...input,
    gridSize:
      input?.gridSize !== undefined && input?.gridSize !== null
        ? input.gridSize
        : getDefaultGridSize(input?.type || input?.FieldType),
    isViewable: input?.isViewable !== undefined ? input.isViewable : true, // Default isViewable to true
  };
  const type = (field?.type || field?.FieldType || '').toLowerCase();

  if (!DEPENDENCY_SUPPORTED_TYPES.has(type)) {
    if (field?.dependency === undefined) return field;
    delete field.dependency;
    return field;
  }

  return field;
};

// Helper function to generate camelCase name from label
const generateCamelCaseName = (label, fallbackKey) => {
  if (!label) return `subSection_${fallbackKey}`;

  return (
    label
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .filter((word) => word.length > 0)
      .map((word, index) => {
        if (index === 0) return word.toLowerCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('') || `subSection_${fallbackKey}`
  );
};

// Recursive function to normalise sub-section inputs (handles nested sub-sections)
const normaliseSubSectionInputs = (inputs, existingNames = new Set()) => {
  const normalisedInputs = {};

  Object.entries(inputs || {}).forEach(([key, input]) => {
    if (!input) return;

    if (input?.type === 'SubSection') {
      // Recursively normalise nested sub-section inputs
      const nestedInputs = normaliseSubSectionInputs(input.inputs || {}, existingNames);

      // Generate unique camelCase name for this sub-section
      let subSectionName = input.name;
      if (!subSectionName) {
        subSectionName = generateCamelCaseName(input.label, key);
      }

      // Ensure uniqueness
      let uniqueName = subSectionName;
      let counter = 1;
      while (existingNames.has(uniqueName)) {
        uniqueName = `${subSectionName}${counter}`;
        counter++;
      }
      existingNames.add(uniqueName);

      normalisedInputs[key] = {
        ...input,
        name: uniqueName,
        inputs: nestedInputs,
      };
    } else {
      normalisedInputs[key] = normaliseFieldDependency(input);
    }
  });

  return normalisedInputs;
};

const normaliseSections = (rawSections = []) => {
  if (!Array.isArray(rawSections)) return [];

  // Track all existing names for uniqueness across the form
  const existingNames = new Set();

  return rawSections.map((section) => {
    const inputs = normaliseSubSectionInputs(section?.inputs || {}, existingNames);
    return {
      ...section,
      inputs,
    };
  });
};

export {
  DEPENDENCY_SUPPORTED_TYPES,
  deepCloneInputs,
  getDefaultGridSize,
  normaliseFieldDependency,
  generateCamelCaseName,
  normaliseSubSectionInputs,
  normaliseSections,
};

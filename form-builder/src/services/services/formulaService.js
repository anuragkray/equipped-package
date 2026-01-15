import { getMethodApiCall, postMethodApiCall, getAuthHeaders } from './apiClient.js';

/**
 * Fetch formula configuration by ID
 * @param {string} formulaId - The ID of the formula to fetch
 * @returns {Promise<Object>} - Formula configuration object
 */
export const fetchFormulaById = async (formulaId) => {
  try {
    const response = await getMethodApiCall(
      `/settings/get-formula-by-id/${formulaId}`,
      getAuthHeaders()
    );
    return response?.data || null;
  } catch (error) {
    return null;
  }
};

/**
 * Extract field names from a formula string
 * @param {string} formula - The formula string (e.g., "${module.field} * 2")
 * @returns {Array<string>} - Array of field references (e.g., ["module.field"])
 */
export const extractFormulaFields = (formula) => {
  if (!formula) return [];
  
  // Extract field names using regex pattern ${moduleName.fieldName}
  const dollarBraceMatches = [...formula.matchAll(/\$\{([^}]+)\}/g)];
  const dotNotationMatches = [...formula.matchAll(/\b(\w+\.\w+)\b/g)];

  // Use dollar-brace if found, otherwise use dot notation
  const fieldMatches = dollarBraceMatches.length > 0 ? dollarBraceMatches : dotNotationMatches;
  return fieldMatches.map((match) => match[1]);
};

/**
 * Extract unique module/object names from formula fields
 * @param {Array<string>} fields - Array of field references (e.g., ["module.field"])
 * @returns {Array<string>} - Array of unique module names
 */
export const extractModuleNames = (fields) => {
  const moduleNames = fields
    .map((field) => field.split('.')[0])
    .filter(Boolean);
  return [...new Set(moduleNames)];
};

/**
 * Build formula configuration object
 * @param {string} formulaId - The formula ID
 * @param {Object} formulaInfo - The formula information from API
 * @param {string} fieldName - The field name where result will be stored
 * @returns {Object} - Formula configuration object
 */
export const buildFormulaConfig = (formulaId, formulaInfo, fieldName) => {
  if (!formulaInfo || !formulaInfo.formula) return null;

  const fields = extractFormulaFields(formulaInfo.formula);
  const objects = extractModuleNames(fields);

  return {
    formulaId,
    formulaInfo,
    fields,
    fieldName,
    objects,
  };
};

/**
 * Build payload for formula evaluation
 * @param {Array<string>} formulaFields - Array of formula field references
 * @param {Object} formData - Current form data
 * @param {Object} formDefinition - Form definition to find field types
 * @returns {Object} - Payload for evaluation API
 */
export const buildEvaluationPayload = (formulaFields, formData, formDefinition) => {
  const dataPayload = {};

  formulaFields.forEach((key) => {
    const [objectName, fieldsName] = key.split('.');

    if (!objectName || !fieldsName) return;

    // Find field type and stateKey
    let inputType = null;
    let fieldStateKey = fieldsName;

    if (formDefinition?.sections) {
      formDefinition.sections.forEach((section) => {
        Object.values(section.inputs || {}).forEach((input) => {
          // Check regular fields - match by name (case-insensitive) or stateKey
          const inputName = (input.name || '').toLowerCase();
          const inputStateKey = (input.stateKey || '').toLowerCase();
          const searchName = fieldsName.toLowerCase();
          
          // Match if: exact name match, exact stateKey match, or stateKey ends with _searchName
          const exactNameMatch = inputName === searchName;
          const exactStateKeyMatch = inputStateKey === searchName;
          const stateKeyEndsWithName = inputStateKey.endsWith(`_${searchName}`);
          
          if (exactNameMatch || exactStateKeyMatch || stateKeyEndsWithName) {
            inputType = input.type;
            fieldStateKey = input.stateKey || input.name;
          }
          
          // Check subsection fields
          if (input.type === 'SubSection' && input.inputs) {
            Object.values(input.inputs || {}).forEach((subField) => {
              const subFieldName = (subField.name || '').toLowerCase();
              const subFieldStateKey = (subField.stateKey || '').toLowerCase();
              
              const subExactNameMatch = subFieldName === searchName;
              const subExactStateKeyMatch = subFieldStateKey === searchName;
              const subStateKeyEndsWithName = subFieldStateKey.endsWith(`_${searchName}`);
              
              if (subExactNameMatch || subExactStateKeyMatch || subStateKeyEndsWithName) {
                inputType = subField.type;
                fieldStateKey = subField.stateKey || subField.name;
              }
            });
          }
        });
      });
    }

    // Get value from formData
    let value = formData[fieldStateKey];

    // Convert empty/null/undefined to 0
    if (value === '' || value === undefined || value === null) {
      value = 0;
    }

    // Convert to number if applicable
    if (
      inputType === 'number' ||
      inputType === 'amount' ||
      (!isNaN(value) && value !== '' && typeof value !== 'object')
    ) {
      value = Number(value);
      if (isNaN(value)) {
        value = 0;
      }
    }

    if (!dataPayload[objectName]) {
      dataPayload[objectName] = {};
    }
    dataPayload[objectName][fieldsName] = value;
  });

  return dataPayload;
};

/**
 * Evaluate formula with given data
 * @param {string} formula - The formula string to evaluate
 * @param {Object} data - Data payload for evaluation
 * @returns {Promise<number|null>} - Calculated result or null on error
 */
export const evaluateFormula = async (formula, data) => {
  try {
    const response = await postMethodApiCall('/settings/evaluate', getAuthHeaders(), {
      formula,
      data,
    });
    return response?.data;
  } catch (error) {
    return null;
  }
};

/**
 * Load all formulas from form definition
 * @param {Object} formDefinition - The form definition object
 * @returns {Promise<Array<Object>>} - Array of formula configurations
 */
export const loadFormulasFromDefinition = async (formDefinition) => {
  if (!formDefinition?.sections) return [];

  const formulasToFetch = [];

  // Find ALL fields with formulaId
  formDefinition.sections.forEach((section) => {
    Object.values(section.inputs || {}).forEach((input) => {
      if (input.formulaId && input.name) {
        formulasToFetch.push({
          formulaId: input.formulaId,
          fieldName: input.name,
        });
      }
    });
  });

  if (formulasToFetch.length === 0) return [];

  // Fetch all formulas
  const configs = await Promise.all(
    formulasToFetch.map(async ({ formulaId, fieldName }) => {
      const formulaInfo = await fetchFormulaById(formulaId);
      if (!formulaInfo) return null;
      return buildFormulaConfig(formulaId, formulaInfo, fieldName);
    })
  );

  return configs.filter(Boolean);
};

/**
 * Evaluate a single formula configuration
 * @param {Object} config - Formula configuration object
 * @param {Object} formData - Current form data
 * @param {Object} formDefinition - Form definition
 * @returns {Promise<Object|null>} - Object with fieldName and calculatedValue, or null
 */
export const evaluateFormulaConfig = async (config, formData, formDefinition) => {
  const { formulaInfo, fields, fieldName } = config;

  if (!formulaInfo || fields.length === 0 || !fieldName) return null;

  const dataPayload = buildEvaluationPayload(fields, formData, formDefinition);
  const calculatedValue = await evaluateFormula(formulaInfo.formula, dataPayload);

  if (calculatedValue !== undefined && calculatedValue !== null) {
    return { fieldName, calculatedValue };
  }

  return null;
};

/**
 * Evaluate all formulas in the configuration array
 * @param {Array<Object>} formulaConfigs - Array of formula configurations
 * @param {Object} formData - Current form data
 * @param {Object} formDefinition - Form definition
 * @returns {Promise<Array<Object>>} - Array of results with fieldName and calculatedValue
 */
export const evaluateAllFormulas = async (formulaConfigs, formData, formDefinition) => {
  if (!formulaConfigs || formulaConfigs.length === 0) return [];

  const results = await Promise.all(
    formulaConfigs.map((config) => evaluateFormulaConfig(config, formData, formDefinition))
  );

  return results.filter(Boolean);
};

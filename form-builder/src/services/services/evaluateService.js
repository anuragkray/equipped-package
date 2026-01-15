import { postMethodApiCall, getAuthHeaders } from "./apiClient.js";

/**
 * Evaluate a formula with provided data
 * @param {string} formula - The formula expression to evaluate
 * @param {Object} data - The data object containing values for formula variables
 * @returns {Promise<any>} - The calculated result
 */
export const evaluateFormula = async (formula, data) => {
  try {
    const response = await postMethodApiCall(
      "/settings/evaluate",
      getAuthHeaders(),
      {
        formula,
        data,
      }
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Prepare data payload for formula evaluation
 * @param {Array} fields - Array of field names from the formula (e.g., ["loan.amount", "loan.rate"])
 * @param {Object} formData - The form data object
 * @param {Object} formDefinition - The form definition to get field metadata
 * @param {Object} lookupRecordsMap - Map of full lookup records by module and ID
 * @returns {Object} - Structured data payload for evaluation
 */
export const prepareFormulaDataPayload = (fields, formData, formDefinition, lookupRecordsMap = {}) => {
  const dataPayload = {};

  fields.forEach((key) => {
    const [objectName, fieldsName] = key.split(".");

    if (!objectName || !fieldsName) return;

    // Find field in form definition that matches the objectName (module name)
    // For example, if formula is ${fund.fundAmount}, we need to find a lookup field with moduleName="fund"
    let lookupField = null;
    let lookupFieldStateKey = null;
    if (formDefinition?.sections) {
      formDefinition.sections.forEach((section, sectionIndex) => {
        Object.values(section.inputs || {}).forEach((input) => {
          const inputModuleName = (input.moduleName || input.module || '').trim().toLowerCase();
          const searchObjectName = objectName.toLowerCase();
          const inputTypeLower = (input.type || '').toLowerCase();
          // Check if this is a lookup field that matches the objectName (case-insensitive type check)
          if ((inputTypeLower === 'lookup' || inputTypeLower === 'users') && inputModuleName === searchObjectName) {
            lookupField = input;
            lookupFieldStateKey = input.stateKey || input.name;
          }
          
          // Check subsection fields
          if (input.type === 'SubSection' && input.inputs) {
            Object.values(input.inputs || {}).forEach((subField) => {
              const subFieldModuleName = (subField.moduleName || subField.module || '').trim().toLowerCase();
              const subFieldTypeLower = (subField.type || '').toLowerCase();
              if ((subFieldTypeLower === 'lookup' || subFieldTypeLower === 'users') && subFieldModuleName === searchObjectName) {
                lookupField = subField;
                lookupFieldStateKey = subField.stateKey || subField.name;
              }
            });
          }
        });
      });
    }

    // If we found a lookup field matching the objectName, get the full record
    if (lookupField && lookupFieldStateKey) {
      const lookupValue = formData[lookupFieldStateKey];
      
      if (lookupValue && lookupRecordsMap) {
        const normalizedModuleName = objectName.toLowerCase();
        const moduleRecords = lookupRecordsMap[normalizedModuleName];
        
        if (moduleRecords) {
          const recordId = String(lookupValue);
          const fullRecord = moduleRecords[recordId];
          
          if (fullRecord) {
            // Extract the specific field value from the lookup record
            if (!dataPayload[objectName]) {
              dataPayload[objectName] = {};
            }
            
            // Get the specific field value from the full record
            let fieldValue = fullRecord[fieldsName];
            
            // If the field value is a string with commas (like "2,345,321"), convert to number
            if (typeof fieldValue === 'string' && fieldValue.includes(',')) {
              const numericValue = parseFloat(fieldValue.replace(/,/g, ''));
              if (!isNaN(numericValue)) {
                fieldValue = numericValue;
              }
            }
            
            dataPayload[objectName][fieldsName] = fieldValue !== undefined ? fieldValue : 0;
            return; // Skip the normal value processing below
          }
        }
      }
    }
    // Fallback: try to find field by fieldsName (for non-lookup fields)
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

    // Get value from formData using the resolved fieldStateKey
    let value = formData[fieldStateKey];

    // Convert empty/null/undefined to 0
    if (value === "" || value === undefined || value === null) {
      value = 0;
    }

    // Convert to number if applicable
    if (
      inputType === "number" ||
      inputType === "amount" ||
      (!isNaN(value) && value !== "" && typeof value !== "object")
    ) {
      value = Number(value);
      if (isNaN(value)) {
        value = 0;
      }
    }

    // Initialize object if not exists
    if (!dataPayload[objectName]) {
      dataPayload[objectName] = {};
    }
    
    dataPayload[objectName][fieldsName] = value;
  });
  return dataPayload;
};

/**
 * Evaluate a single formula configuration
 * @param {Object} config - Formula configuration object
 * @param {Object} formData - Current form data
 * @param {Object} formDefinition - Form definition
 * @param {Function} onSuccess - Callback when evaluation succeeds (receives calculatedValue)
 * @param {Function} onError - Callback when evaluation fails (receives error)
 * @param {Object} lookupRecordsMap - Map of full lookup records by module and ID
 */
export const evaluateSingleFormula = async (
  config,
  formData,
  formDefinition,
  onSuccess,
  onError,
  lookupRecordsMap = {}
) => {
  const { formulaInfo, fields, fieldName } = config;

  if (!formulaInfo || fields.length === 0 || !fieldName) {
    return;
  }

  // Prepare data payload with lookup records map
  const dataPayload = prepareFormulaDataPayload(
    fields,
    formData,
    formDefinition,
    lookupRecordsMap
  );

  try {
    // Evaluate formula
    const calculatedValue = await evaluateFormula(
      formulaInfo.formula,
      dataPayload
    );

    if (calculatedValue !== undefined && calculatedValue !== null) {
      onSuccess?.(calculatedValue, fieldName);
    }
  } catch (error) {
    onError?.(error, fieldName);
  }
};

/**
 * Evaluate multiple formulas in batch
 * @param {Array} formulaConfigs - Array of formula configuration objects
 * @param {Object} formData - Current form data
 * @param {Object} formDefinition - Form definition
 * @param {Function} onSuccess - Callback when a formula evaluation succeeds
 * @param {Function} onError - Callback when a formula evaluation fails
 * @param {Object} lookupRecordsMap - Map of full lookup records by module and ID
 */
export const evaluateMultipleFormulas = async (
  formulaConfigs,
  formData,
  formDefinition,
  onSuccess,
  onError,
  lookupRecordsMap = {}
) => {
  const evaluationPromises = formulaConfigs.map((config) =>
    evaluateSingleFormula(config, formData, formDefinition, onSuccess, onError, lookupRecordsMap)
  );

  await Promise.all(evaluationPromises);
};

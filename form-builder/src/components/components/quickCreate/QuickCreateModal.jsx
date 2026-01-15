import { useState, useEffect, useCallback } from 'react';
import Modal from '../custom/modal/Modal.jsx';
import Button from '../ui/button/Button.jsx';
import { InputField } from '../inputs/input/index.jsx';
import SelectField from '../inputs/searchInput/SelectField.jsx';
import ReactCountryFlag from 'react-country-flag';
import { getFormByTitleApi } from '../../services/formApi.js';
import { createModuleRecord } from '../../services/moduleRecordsApi.js';
import { alertError, alertSuccess } from '../../utils/alert.jsx';
import countryDataFallback from '../../assets/data/countryCode.json';
import currencyDataFallback from '../../assets/data/currency.json';
import './QuickCreateModal.css';

const QuickCreateModal = ({ 
  isOpen, 
  onClose, 
  moduleName, 
  moduleLabel,
  onRecordCreated 
}) => {
  const [formDefinition, setFormDefinition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Load form definition when modal opens
  useEffect(() => {
    if (isOpen && moduleName) {
      loadFormDefinition();
    } else if (!isOpen) {
      // Clear form data and errors when modal closes
      setFormData({});
      setFormErrors({});
    }
  }, [isOpen, moduleName]);

  const loadFormDefinition = async () => {
    setLoading(true);
    setError('');
    try {
      const normalizedModuleName = (moduleName || '').toLowerCase().replace(/-/g, '');
      const response = await getFormByTitleApi(normalizedModuleName);
      if (response?.statusCode === 200 && response?.data) {
        setFormDefinition(response.data);
        // Initialize form data
        initializeFormData(response.data);
      } else {
        setError('Unable to load form configuration.');
      }
    } catch (err) {
      setError('Failed to load form configuration.');
    } finally {
      setLoading(false);
    }
  };

  const initializeFormData = (definition) => {
    const initialData = {};
    if (definition?.sections) {
      definition.sections.forEach((section) => {
        Object.values(section?.inputs || {}).forEach((field) => {
          // Only include fields marked as quick create
          if (field?.quick) {
            const key = field?.name || field?.stateKey || field?.id;
            if (key) {
              initialData[key] = field?.defaultValue || '';
            }
          }
        });
      });
    }
    setFormData(initialData);
  };

  const handleInputChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    
    // Clear error for this field when value changes
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    const errorOrder = [];
    
    if (!formDefinition?.sections) return { isValid: true, errors: {}, errorOrder: [] };
    
    formDefinition.sections.forEach((section) => {
      Object.values(section?.inputs || {}).forEach((field) => {
        // Only validate quick create fields
        if (!field?.quick) return;
        
        const fieldName = field?.name || field?.stateKey || field?.id;
        if (!fieldName) return;
        
        const value = formData[fieldName];
        const fieldType = (field?.type || '').toLowerCase();
        
        // Skip file fields
        if (fieldType === 'file') return;
        
        // Required field validation
        if (field?.required) {
          const isEmpty = value === undefined || value === null || value === '' || 
                         (Array.isArray(value) && value.length === 0);
          if (isEmpty) {
            errors[fieldName] = `${field?.label || fieldName} is required`;
            errorOrder.push(fieldName);
          }
        }
        
        // Max length validation
        if (field?.maxLength && typeof value === 'string' && value.length > field.maxLength) {
          errors[fieldName] = `${field?.label || fieldName} must be no more than ${field.maxLength} characters`;
          if (!errorOrder.includes(fieldName)) errorOrder.push(fieldName);
        }
        
        // Min/Max value validation for number/amount fields
        if (fieldType === 'number' || fieldType === 'amount') {
          const numValue = parseFloat(value);
          if (value !== '' && value !== null && value !== undefined && !isNaN(numValue)) {
            if (field?.minValue !== undefined && numValue < field.minValue) {
              errors[fieldName] = `${field?.label || fieldName} must be at least ${field.minValue}`;
              if (!errorOrder.includes(fieldName)) errorOrder.push(fieldName);
            }
            if (field?.maxValue !== undefined && numValue > field.maxValue) {
              errors[fieldName] = `${field?.label || fieldName} must be no more than ${field.maxValue}`;
              if (!errorOrder.includes(fieldName)) errorOrder.push(fieldName);
            }
          }
        }
      });
    });
    
    setFormErrors(errors);
    
    // Scroll to first error if validation fails
    if (errorOrder.length > 0) {
      setTimeout(() => {
        const firstErrorKey = errorOrder[0];
        const errorElement = document.querySelector(`[name="${firstErrorKey}"]`) ||
                            document.querySelector(`#${firstErrorKey}`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          errorElement.focus?.();
        }
      }, 100);
    }
    
    return { isValid: Object.keys(errors).length === 0, errors, errorOrder };
  };

  const handleSubmit = async () => {
    if (!formDefinition?._id) {
      alertError('Form metadata is missing.', 'Configuration Error');
      return;
    }

    // Validate form before submission
    const validation = validateForm();
    if (!validation.isValid) {
      alertError('Please fill all required fields correctly.', 'Validation Error');
      return;
    }

    setSubmitting(true);
    try {
      const normalizedModuleName = (moduleName || '').toLowerCase().replace(/-/g, '');
      const response = await createModuleRecord(normalizedModuleName, {
        formId: formDefinition._id,
        ...formData,
      });

      if (response?.statusCode === 200 || response?.statusCode === 201) {
        // Extract created record ID from response - check multiple possible locations
        // API response structure: { msg, data: { acknowledged, insertedId } }
        const responseData = response?.data;
        const createdId = 
          responseData?.data?.insertedId ||  // Primary: nested insertedId from create API
          responseData?.insertedId ||         // insertedId at top level
          responseData?._id ||
          responseData?.id ||
          responseData?.formId ||
          responseData?.recordId ||
          responseData?.data?._id ||
          responseData?.data?.id ||
          responseData?.data?.formId ||
          formDefinition?._id; // fallback to form definition ID
        
        // Extract created record info
        const createdRecord = {
          _id: createdId,
          id: createdId,
          insertedId: createdId,
          ...responseData,
          ...formData,
        };
        
        alertSuccess('Record created successfully!', 'Success');
        onRecordCreated?.(createdRecord);
        onClose();
        
        // Reset form and errors
        setFormData({});
        setFormErrors({});
      } else {
        alertError(response?.errorMessage || 'Unable to create record.', 'Error');
      }
    } catch (err) {
      alertError(err?.message || 'An error occurred while creating the record.', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  // Get quick create fields from form definition
  const getQuickCreateFields = useCallback(() => {
    if (!formDefinition?.sections) return [];
    
    const fields = [];
    formDefinition.sections.forEach((section) => {
      Object.entries(section?.inputs || {}).forEach(([key, field]) => {
        // Only include fields marked as quick create
        if (field?.quick) {
          fields.push({ ...field, id: key });
        }
      });
    });
    return fields;
  }, [formDefinition]);

  const renderField = (field) => {
    const fieldName = field?.name || field?.stateKey || field?.id;
    const fieldValue = formData[fieldName] || '';
    const fieldType = (field?.type || 'text').toLowerCase();
    const isRequired = field?.required;
    const hasError = !!formErrors[fieldName];
    const errorStyle = hasError ? { border: '1px solid red' } : {};

    switch (fieldType) {
      case 'selectcountry': {
        const countryData = Array.isArray(countryDataFallback) ? countryDataFallback : [];
        const selectedValue = fieldValue && countryData.length > 0
          ? countryData.find(
              (c) => String(c.value) === String(fieldValue) || String(c.label) === String(fieldValue)
            ) || null
          : null;

        return (
          <SelectField
            options={countryData}
            value={selectedValue}
            onChange={(selected) => handleInputChange(fieldName, selected?.value || '')}
            placeholder={field?.placeholder || 'Select Country'}
            isMulti={false}
            isClearable={!isRequired}
            isSearchable={true}
            hasError={hasError}
            formatOptionLabel={(option) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ReactCountryFlag
                  countryCode={option.value}
                  svg
                  style={{ width: '20px', height: '15px' }}
                />
                <span>{option.label}</span>
              </div>
            )}
          />
        );
      }
      case 'selectcurrency': {
        const currencyData = Array.isArray(currencyDataFallback) ? currencyDataFallback : [];
        const selectedValue = fieldValue && currencyData.length > 0
          ? currencyData.find(
              (c) => String(c.value) === String(fieldValue) || String(c.label) === String(fieldValue)
            ) || null
          : null;

        return (
          <SelectField
            options={currencyData}
            value={selectedValue}
            onChange={(selected) => handleInputChange(fieldName, selected?.value || '')}
            placeholder={field?.placeholder || 'Select Currency'}
            isMulti={false}
            isClearable={!isRequired}
            isSearchable={true}
            hasError={hasError}
          />
        );
      }
      case 'select':
      case 'dropdown':
      case 'picklist': {
        const options = (field?.options || []).map((opt) => ({
          value: opt?.value || opt?.id || opt,
          label: opt?.label || opt?.name || opt || String(opt?.value || opt?.id || opt),
        }));
        const selectedValue = options.find((opt) => String(opt.value) === String(fieldValue)) || null;

        return (
          <SelectField
            options={options}
            value={selectedValue}
            onChange={(selected) => handleInputChange(fieldName, selected?.value || '')}
            placeholder={field?.placeholder || `Select ${field?.label || fieldName}`}
            isMulti={false}
            isClearable={!isRequired}
            isSearchable={true}
            hasError={hasError}
          />
        );
      }
      case 'textarea':
        return (
          <textarea
            className="quick-create-textarea"
            name={fieldName}
            value={fieldValue}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={field?.placeholder || `Enter ${field?.label || fieldName}`}
            rows={3}
            style={errorStyle}
          />
        );
      case 'number':
      case 'amount':
        return (
          <InputField
            type="number"
            name={fieldName}
            value={fieldValue}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={field?.placeholder || `Enter ${field?.label || fieldName}`}
            style={errorStyle}
          />
        );
      case 'date':
        return (
          <InputField
            type="date"
            name={fieldName}
            value={fieldValue}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            style={errorStyle}
          />
        );
      default:
        return (
          <InputField
            type="text"
            name={fieldName}
            value={fieldValue}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={field?.placeholder || `Enter ${field?.label || fieldName}`}
            style={errorStyle}
          />
        );
    }
  };

  const quickCreateFields = getQuickCreateFields();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Quick Create ${moduleLabel || moduleName || 'Record'}`}
      className="quick-create-modal"
    >
      <div className="quick-create-container">
        {loading ? (
          <div className="quick-create-loading">Loading form...</div>
        ) : error ? (
          <div className="quick-create-error">{error}</div>
        ) : quickCreateFields.length === 0 ? (
          <div className="quick-create-empty">
            No quick create fields configured for this module.
            <br />
            <small>Enable "Quick Create" on fields in Form Builder.</small>
          </div>
        ) : (
          <>
            <div className="quick-create-fields">
              {quickCreateFields.map((field) => {
                const fieldName = field?.name || field?.stateKey || field?.id;
                const fieldError = formErrors[fieldName];
                const hasError = !!fieldError;
                
                return (
                  <div key={field.id} className="quick-create-field">
                    <label className="quick-create-label">
                      {field?.label || field?.name}
                      {field?.required && <span className="required">*</span>}
                    </label>
                    {renderField(field)}
                    {hasError && (
                      <div className="quick-create-error-message" style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                        {fieldError}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="quick-create-actions">
              <Button 
                className="quick-create-cancel-btn" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                className="quick-create-submit-btn" 
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default QuickCreateModal;


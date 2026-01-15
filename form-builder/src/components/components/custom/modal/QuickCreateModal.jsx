import React, { useState, useEffect, useCallback } from 'react';
import { X } from '@phosphor-icons/react';
import Button from '../../ui/button/Button.jsx';
import CancelButton from '../../ui/button/CancelButton.jsx';
import SelectField from '../../inputs/searchInput/SelectField.jsx';
import { InputField } from '../../inputs/input/index.jsx';
import { getFormByTitleApi } from '../../../services/formApi.js';
import { createModuleRecord } from '../../../services/moduleRecordsApi.js';
import { alertError, alertSuccess } from '../../../utils/alert.jsx';
import './QuickCreateModal.css';

const QuickCreateModal = ({ 
  isOpen, 
  onClose, 
  moduleName, 
  onRecordCreated,
  fieldLabel 
}) => {
  const [formDefinition, setFormDefinition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  // Load form definition for the target module
  const loadFormDefinition = useCallback(async () => {
    if (!moduleName || !isOpen) return;
    
    setLoading(true);
    setError('');
    
    try {
      const normalizedModuleName = (moduleName || '').toLowerCase().replace(/-/g, '');
      const response = await getFormByTitleApi(normalizedModuleName);
      
      if (response?.statusCode === 200 && response?.data) {
        setFormDefinition(response.data);
        // Initialize form data with empty values
        const initialData = {};
        response.data?.sections?.forEach(section => {
          Object.values(section?.inputs || {}).forEach(field => {
            if (field?.type !== 'SubSection') {
              const key = field?.name || field?.stateKey || field?.id;
              if (key) {
                initialData[key] = field?.defaultValue || '';
              }
            }
          });
        });
        setFormData(initialData);
      } else {
        setError('Unable to load form configuration.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to load form configuration.');
    } finally {
      setLoading(false);
    }
  }, [moduleName, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadFormDefinition();
    } else {
      // Reset state when modal closes
      setFormDefinition(null);
      setFormData({});
      setError('');
    }
  }, [isOpen, loadFormDefinition]);

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formDefinition?._id) {
      alertError('Form configuration is missing.', 'Configuration Error');
      return;
    }

    setSubmitting(true);

    try {
      const normalizedModuleName = (moduleName || '').toLowerCase().replace(/-/g, '');
      
      // Prepare payload
      const payload = {
        formId: formDefinition._id,
        ...formData
      };

      const response = await createModuleRecord(normalizedModuleName, payload);

      if (response?.statusCode === 200 || response?.statusCode === 201) {
        // Extract the created record info
        const createdRecord = response?.data;
        const recordId = createdRecord?._id || createdRecord?.id || createdRecord?.formId;
        
        // Find the name field to use as label
        let recordLabel = '';
        const nameFieldKeys = ['name', `${normalizedModuleName}Name`, 'label', 'title'];
        for (const key of nameFieldKeys) {
          if (formData[key]) {
            recordLabel = formData[key];
            break;
          }
        }
        if (!recordLabel) {
          // Use the first non-empty string field
          recordLabel = Object.values(formData).find(v => typeof v === 'string' && v.trim()) || recordId;
        }

        // Notify parent with the created record
        if (onRecordCreated && recordId) {
          onRecordCreated({
            id: recordId,
            value: recordId,
            label: recordLabel
          });
        }

        alertSuccess('Record created successfully!', 'Success');
        onClose();
      } else {
        alertError(response?.errorMessage || 'Unable to create record. Please try again.', 'Error');
      }
    } catch (err) {
      alertError(err?.message || 'An error occurred while creating the record.', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const fieldName = field?.name || field?.stateKey || field?.id;
    const fieldValue = formData[fieldName] || '';
    const fieldType = (field?.type || 'text').toLowerCase();
    const isRequired = field?.required;
    const fieldLabel = field?.label || fieldName;

    const baseInputClass = "quick-create-input";

    switch (fieldType) {
      case 'select':
      case 'dropdown':
      case 'picklist': {
        const options = field?.options || [];
        const selectedValue = options.find(opt => {
          const optValue = opt?.value || opt?.id || opt;
          return String(optValue) === String(fieldValue);
        });

        return (
          <SelectField
            options={options.map(opt => ({
              value: opt?.value || opt?.id || opt,
              label: opt?.label || opt?.name || opt || String(opt?.value || opt?.id || opt)
            }))}
            value={selectedValue ? {
              value: selectedValue?.value || selectedValue?.id || selectedValue,
              label: selectedValue?.label || selectedValue?.name || selectedValue
            } : null}
            onChange={(selected) => handleInputChange(fieldName, selected?.value || '')}
            placeholder={field?.placeholder || `Select ${fieldLabel}`}
            isMulti={false}
            isClearable={!isRequired}
            isSearchable={true}
          />
        );
      }
      case 'textarea':
      case 'richtext':
        return (
          <textarea
            className={`${baseInputClass} quick-create-textarea`}
            value={fieldValue}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={field?.placeholder || `Enter ${fieldLabel}`}
            rows={3}
          />
        );
      case 'number':
      case 'amount':
        return (
          <InputField
            type="number"
            className={baseInputClass}
            value={fieldValue}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={field?.placeholder || `Enter ${fieldLabel}`}
            step="any"
          />
        );
      case 'date':
        return (
          <InputField
            type="date"
            className={baseInputClass}
            value={fieldValue}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
          />
        );
      case 'email':
        return (
          <InputField
            type="email"
            className={baseInputClass}
            value={fieldValue}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={field?.placeholder || `Enter ${fieldLabel}`}
          />
        );
      default:
        return (
          <InputField
            type="text"
            className={baseInputClass}
            value={fieldValue}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={field?.placeholder || `Enter ${fieldLabel}`}
          />
        );
    }
  };

  // Get fields to show (only from first section, excluding complex types)
  const getQuickCreateFields = () => {
    if (!formDefinition?.sections?.length) return [];
    
    const fields = [];
    // Only use first section for quick create
    const firstSection = formDefinition.sections[0];
    
    Object.values(firstSection?.inputs || {}).forEach(field => {
      const fieldType = (field?.type || '').toLowerCase();
      // Skip complex field types
      if (['subsection', 'file', 'lookup'].includes(fieldType)) return;
      fields.push(field);
    });
    
    // Limit to first 6 fields for quick create
    return fields.slice(0, 6);
  };

  if (!isOpen) return null;

  return (
    <div className="quick-create-overlay">
      <div className="quick-create-modal">
        <div className="quick-create-header">
          <h3 className="quick-create-title">
            Quick Create: {fieldLabel || moduleName}
          </h3>
          <button className="quick-create-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="quick-create-body">
          {loading ? (
            <div className="quick-create-loading">Loading form...</div>
          ) : error ? (
            <div className="quick-create-error">{error}</div>
          ) : (
            <div className="quick-create-fields">
              {getQuickCreateFields().map(field => {
                const fieldName = field?.name || field?.stateKey || field?.id;
                const fieldLabel = field?.label || fieldName;
                const isRequired = field?.required;

                return (
                  <div key={fieldName} className="quick-create-field">
                    <label className="quick-create-label">
                      {fieldLabel}
                      {isRequired && <span className="quick-create-required">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                );
              })}
              {getQuickCreateFields().length === 0 && (
                <div className="quick-create-empty">
                  No fields available for quick create.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="quick-create-footer">
          <CancelButton onClick={onClose}>
            Cancel
          </CancelButton>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || loading}
          >
            {submitting ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickCreateModal;


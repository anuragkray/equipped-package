import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/button/Button.jsx';
import { InputField } from '../../../../components/inputs/input/index.jsx';
import Label from '../../../../components/inputs/label/index.jsx';
import SelectIconField from '../../../../components/inputs/selectIcon/SelectIconField.jsx';
import './CreateModuleForm.css';
import { buildFormBuilderPath } from "../../formBuilderBasePath.js";

const CreateModuleForm = ({ formGroups, onClose }) => {
  const navigate = useNavigate();
  const [formTitle, setFormTitle] = useState('');
  const [label, setLabel] = useState('');
  const [moduleIcon, setModuleIcon] = useState(null);
  const [error, setError] = useState({});

  const validateForm = () => {
    let existingModules = [];
    let errors = {};

    formGroups?.formData?.forEach(element => {
      existingModules.push(element?._id);
    });

    if (formTitle === '') {
      errors = { ...errors, formTitle: 'Please enter module name' };
    }

    if (existingModules.includes(formTitle)) {
      errors = { ...errors, formTitle: 'Module name already exists' };
    }

    if (label === '') {
      errors = { ...errors, moduleLabel: 'Please enter Module Label' };
    }

    if (!moduleIcon) {
      errors = { ...errors, moduleIcon: 'Please select module icon' };
    }

    if (Object.keys(errors).length) {
      setError(errors);
      return false;
    }

    return true;
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    navigate(buildFormBuilderPath(`/create?group=${formTitle}`), {
      state: {
        moduleLabel: label,
        moduleIcon: moduleIcon?.value,
        formTitle
      },
    });
    onClose?.();
  };

  const handleOnFormTitleChange = (e) => {
    setError({});
    setFormTitle(
      e.target.value
        .replace(/[^a-zA-Z]/g, '')
        .toLowerCase()
    );
  };

  const handleOnLabelChange = (e) => {
    setLabel(e.target.value);
  };

  const ErrorComponent = ({ error }) => {
    return <span className='form-error'>{error}</span>;
  };

  return (
    <form onSubmit={handleOnSubmit} className='create-module-form'>
      <div className='form-fields'>
        <div className='form-field-group'>
          <Label>Module Name</Label>
          <InputField
            name='formTitle'
            value={formTitle}
            onChange={handleOnFormTitleChange}
            placeholder='Enter Module Name'
            autoComplete="off"
          />
          {error?.formTitle && <ErrorComponent error={error.formTitle} />}
        </div>
        <div className='form-field-group'>
          <Label>Module Label</Label>
          <InputField
            name='label'
            value={label}
            onChange={handleOnLabelChange}
            placeholder='Enter Module Label'
            autoComplete="off"
          />
          {error?.moduleLabel && <ErrorComponent error={error.moduleLabel} />}
        </div>
        <div className='form-field-group'>
          <Label>Module Icon</Label>
          <SelectIconField value={moduleIcon} onChange={setModuleIcon} />
          {error?.moduleIcon && <ErrorComponent error={error.moduleIcon} />}
        </div>
      </div>
      <div className='form-submit'>
        <Button type='submit'>Submit</Button>
      </div>
    </form>
  );
};

export default CreateModuleForm;


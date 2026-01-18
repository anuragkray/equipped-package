import { useEffect, useState } from "react";
import Modal from "../../../../../components/custom/modal/Modal.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../../../../components/ui/button/Button.jsx";
import CancelButton from "../../../../../components/ui/button/CancelButton.jsx";
import { InputField } from "../../../../../components/inputs/input/index.jsx";
import { createFormApi, updateFormApi } from "../../../../../services/formApi.js";
import { alertError, alertSuccess } from "../../../../../utils/alert.jsx";
import './SaveForm.css';
import { buildFormBuilderPath } from "../../../formBuilderBasePath.js";

const SaveForm = ({ fromDetail, setFormDetail, sections, group, formId, setDuplicateField }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDefaultConfirmOpen, setIsDefaultConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formNameInput, setFormNameInput] = useState("");
  const [defaultInput, setDefaultInput] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const onClose = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    const params = new URLSearchParams(location.search);
    const urlFormName = params.get("formName") || "";
    if (formId) {
      setFormNameInput(urlFormName);
      setDefaultInput(null);
    } else {
      setFormNameInput(fromDetail?.formName || "");
      setDefaultInput(Boolean(fromDetail?.default));
    }
  }, [isOpen, formId, fromDetail?.formName, fromDetail?.default, location.search]);

  const handleChange = (name, value) => {
    setFormDetail({ ...fromDetail, [name]: value });
    if (name === "formName") {
      setFormNameInput(value);
    }
  };

  const handleSave = async () => {
    const labelCount = {};
    const updatedSections = [];

    // Helper function to trim string fields
    const trimInputFields = (input) => {
      if (!input) return input;
      
      // Trim label and placeholder
      if (input.label && typeof input.label === 'string') {
        input.label = input.label.trim();
      }
      if (input.placeholder && typeof input.placeholder === 'string') {
        input.placeholder = input.placeholder.trim();
      }
      if (input.name && typeof input.name === 'string') {
        input.name = input.name.trim();
      }
      
      // If it's a SubSection, trim its nested inputs
      if (input.type === 'SubSection' && input.inputs) {
        for (let subKey in input.inputs) {
          trimInputFields(input.inputs[subKey]);
        }
      }
      
      return input;
    };

    for (let i = 0; i < sections?.length; i++) {
      const section = JSON.parse(JSON.stringify(sections[i]));

      for (let key in section.inputs) {
        const input = section.inputs[key];
        
        // Trim label and placeholder before saving
        trimInputFields(input);
        
        const label = input?.label;

        if (label) {
          labelCount[label] = (labelCount[label] || 0) + 1;

          if (labelCount[label] > 1) {
            input.name += labelCount[label];
          }
        }
      }

      if (section.sectionsTitle?.trim() === "") {
        alertError(`Please provide a section title for section ${i + 1}`, 'Validation Error');
        return;
      }

      updatedSections.push(section);
    }

    const finalFormName = formNameInput.trim() || fromDetail?.formName || "";
    const finalDefault =
      defaultInput === null ? Boolean(fromDetail?.default) : defaultInput;
    const payload = {
      ...fromDetail,
      formName: finalFormName,
      default: finalDefault,
      formTitle: group,
      sections: updatedSections,
    };

    try {
      setSaving(true);
      let response;
      if (formId) {
        response = await updateFormApi(formId, payload);
      } else {
        response = await createFormApi(payload);
      }

      if (response?.statusCode === 200 || response?.statusCode === 201) {
        alertSuccess(formId ? "Updated successfully" : "Created successfully", 'Success');
        setDuplicateField && setDuplicateField({});
        setIsDefaultConfirmOpen(false);
        setIsOpen(false);
        navigate(buildFormBuilderPath(`?group=${group}`));
      } else {
        throw new Error(response?.errorMessage || 'Failed to save form');
      }
    } catch (error) {
      alertError(error?.errorMessage || error?.message || 'Something went wrong while saving the form.', 'Save Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDefaultToggle = (e) => {
    const { checked } = e.target;
    const currentDefault =
      defaultInput === null ? Boolean(fromDetail?.default) : defaultInput;
    if (checked && !currentDefault) {
      setIsDefaultConfirmOpen(true);
    } else {
      setFormDetail({ ...fromDetail, default: checked });
      setDefaultInput(checked);
    }
  };

  const confirmSetDefault = () => {
    setFormDetail({ ...fromDetail, default: true });
    setDefaultInput(true);
    setIsDefaultConfirmOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} disabled={saving}>
        {saving ? 'Saving...' : 'Save Form'}
      </Button>

      {/* Save Form Modal */}
      <Modal onClose={onClose} title="Save form" isOpen={isOpen}>
        <div className="save-form-content">
          <div className="save-form-field">
            <label>Form Name</label>
            <InputField
              onChange={(e) => handleChange("formName", e.target.value)}
              name="formName"
              value={formNameInput}
              placeholder="Enter form name"
            />
          </div>

          {/* Default Switch */}
          <div className="save-form-field">
            <label className="save-form-checkbox-label">
              <input
                type="checkbox"
                onChange={handleDefaultToggle}
                name="default"
                checked={defaultInput ?? false}
              />
              <span>Set Default</span>
            </label>
          </div>

          <div className="save-form-actions">
            <Button onClick={handleSave} disabled={saving} className="save-button">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Default Modal */}
      <Modal
        title="Set as Default?"
        onClose={() => setIsDefaultConfirmOpen(false)}
        isOpen={isDefaultConfirmOpen}
        className="confirm-modal"
      >
        <div className="confirm-modal-content">
          <p className="confirm-text">
            If you set this form as default, any previously set default form for this module will be replaced.
          </p>
          <p className="confirm-warning">
            ⚠️ You will also need to create a new <span className="underline">Canvas View</span> for this form and module.
          </p>
          <div className="confirm-actions">
            <CancelButton onClick={() => setIsDefaultConfirmOpen(false)}>
              Cancel
            </CancelButton>
            <Button onClick={confirmSetDefault}>
              Yes, Set as Default
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SaveForm;


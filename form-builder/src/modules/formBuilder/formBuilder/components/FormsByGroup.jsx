import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PencilSimple } from "@phosphor-icons/react";
import Button from "../../../../components/ui/button/Button.jsx";
import Card from "../../../../components/custom/card/index.jsx";
import Modal from "../../../../components/custom/modal/Modal.jsx";
import CancelButton from "../../../../components/ui/button/CancelButton.jsx";
import { getFormApi } from "../../../../services/formApi.js";
import './FormsByGroup.css';
import { buildFormBuilderPath } from "../../formBuilderBasePath.js";

const findFirstArray = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === 'object') {
    for (const value of Object.values(input)) {
      const result = findFirstArray(value);
      if (result.length) return result;
    }
  }
  return [];
};

const normaliseForms = (input) => {
  return findFirstArray(input);
};

const FormsByGroup = ({ group, moduleLabel }) => {
  const [forms, setForms] = useState([]);
  const [formsLoading, setFormsLoading] = useState(true);
  const [formsError, setFormsError] = useState('');
  const navigate = useNavigate();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    setFormsLoading(true);
    getFormApi({ offset: 1, limit: 20, formTitle: group })
      .then(response => {
        const payload = response?.data ?? response;
        const normalised = normaliseForms(payload);
        if (!normalised.length) {
          throw new Error('No forms were returned for this group.');
        }
        setForms(normalised);
        setFormsError('');
      })
      .catch(err => {
        setForms([]);
        if (err?.response?.status === 401 || err?.statusCode === 401) {
          setFormsError('Your session has expired. Please log in again.');
          navigate('/login', { replace: true });
        } else {
          setFormsError(err?.errorMessage || err?.message || 'Unable to load forms for this group.');
        }
      })
      .finally(() => {
        setFormsLoading(false);
      });
  }, [group, navigate]);

  const handleCreateFormClick = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirm = () => {
    setIsConfirmModalOpen(false);
    const anyForm = forms?.[0];
    const moduleIcon = anyForm?.moduleIcon;
    navigate(buildFormBuilderPath(`/create?group=${group}`), {
      state: {
        moduleLabel,
        moduleIcon,
        formTitle: group,
      },
    });
  };

  if (formsLoading) {
    return <div className="forms-loading">Loading forms…</div>;
  }

  if (formsError) {
    return <div className="forms-error">{formsError}</div>;
  }

  return (
    <div className="forms-by-group">
      <div className="forms-header">
        <h6 className="forms-title">
          {moduleLabel} Forms
        </h6>
        <div className="forms-actions">
          <Link to={buildFormBuilderPath()}>
            <Button className="dynamic-module-list-new-btn">
              Form Group
            </Button>
          </Link>
          <Button
            onClick={handleCreateFormClick}
            className="dynamic-module-list-new-btn"
          >
            Create form
          </Button>
        </div>
      </div>

      {!forms?.length ? (
        <div className="forms-empty">
          <p className="forms-empty-text">
            There is no form available for this group
          </p>
          <Button
            onClick={handleCreateFormClick}
            className="dynamic-module-list-new-btn"
          >
            Click to create a form
          </Button>
        </div>
      ) : (
        <ul className="forms-grid">
          {forms.map((form) => {
            const key = form?._id || form?.id || form?.formId;
            return (
              <li key={key} className="form-item" role="button">
                <Card className="form-card">
                  <div className="form-card-content">
                    <p className="form-card-title">{form?.formName || form?.name || form?.title || key}</p>
                    <Link
                      to={buildFormBuilderPath(`/create?group=${group}&formId=${form?._id || form?.id}`)}
                      className="form-edit-link"
                    >
                      <PencilSimple size={20} />
                    </Link>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        className="confirm-modal"
        title="Create New Form"
      >
        <div className="confirm-modal-content">
          <p className="confirm-text">
            If you create a new form, your previous form will be permanently
            discarded.
          </p>
          <p className="confirm-warning">
            ⚠️ You will also need to create a new{" "}
            <span className="underline">Canvas View</span> for this form and
            module.
          </p>
          <div className="confirm-actions">
            <CancelButton onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </CancelButton>
            <Button onClick={handleConfirm} className="confirm-button">
              Yes, Create New
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FormsByGroup;


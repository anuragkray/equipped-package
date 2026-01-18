import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMethodApiCall, getAuthHeaders } from '../../services/apiClient.js';
import { getFormGroupApi, setFormOrganizationId } from '../../services/formApi.js';
import useParamsValue from '../../hooks/useParamsValue.js';
import Card from '../../components/custom/card/index.jsx';
import CreateModuleButton from './formBuilder/components/CreateModuleButton.jsx';
import FormsByGroup from './formBuilder/components/FormsByGroup.jsx';
import * as Icons from '@phosphor-icons/react';
import './FormBuilderScreen.css';
import { buildFormBuilderPath } from './formBuilderBasePath.js';

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

const normaliseGroups = (input) => {
  return findFirstArray(input);
};

export default function FormBuilderScreen() {
  const navigate = useNavigate();
  const { searchParams: { group, orgId, organizationId } } = useParamsValue();
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState('');

  const moduleMeta = useMemo(() => {
    return groups.find(item => item?._id === group || item?.id === group);
  }, [groups, group]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    if (!token) {
      setGroupsLoading(false);
      setGroupsError('You are not authenticated. Please log in again.');
      return;
    }

    setFormOrganizationId(orgId || organizationId);

    if (!orgId && !organizationId) {
      getMethodApiCall('/user/profile', getAuthHeaders()).catch(() => {
        // ignore profile errors; interceptor will handle 401s if they occur
      });
    }

    setGroupsLoading(true);
    const listQuery = orgId || organizationId
      ? { offset: 1, limit: 10 }
      : { offset: 1, limit: 20 };
    getFormGroupApi(listQuery)
      .then(response => {
        const payload = response?.data ?? response;
        const normalised = normaliseGroups(payload);
        if (!normalised.length) {
          throw new Error('No form groups were returned from the API.');
        }
        setGroups(normalised);
        setGroupsError('');
      })
      .catch(err => {
        setGroups([]);
        if (err?.response?.status === 401 || err?.statusCode === 401) {
          setGroupsError('Your session has expired. Please log in again.');
          navigate('/login', { replace: true });
        } else {
          setGroupsError(err?.errorMessage || err?.message || 'Unable to load form groups. Please try again later.');
        }
      })
      .finally(() => {
        setGroupsLoading(false);
      });
  }, [navigate, orgId, organizationId]);

  const selectGroup = (g) => {
    navigate(buildFormBuilderPath(`?group=${g}`));
  };

  const renderHeader = () => (
    <div className="form-builder-header-content">
      <h1 className="form-builder-header-title">All Modules</h1>
      <CreateModuleButton formGroups={{ formData: groups }} />
    </div>
  );

  if (groupsLoading) {
    return (
      <div className="form-builder-screen">
        <div className="form-builder-container">
          {renderHeader()}
          <div className="form-builder-loading">Loading modules…</div>
        </div>
      </div>
    );
  }

  if (groupsError) {
    return (
      <div className="form-builder-screen">
        <div className="form-builder-container">
          {renderHeader()}
          <div className="form-builder-error">{groupsError}</div>
        </div>
      </div>
    );
  }

  if (!groups.length) {
    return (
      <div className="form-builder-screen">
        <div className="form-builder-container">
          {renderHeader()}
          <div className="form-builder-empty">
            <p>No form groups available yet. Once you create a module it will appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-builder-screen">
      <div className="form-builder-container">
        {renderHeader()}
        {!group ? (
          <div className="form-builder-grid-wrapper">
            <ul className="form-builder-grid">
              {groups.map((groupItem) => {
                const key = groupItem?._id || groupItem?.id;
                const moduleName = groupItem?.moduleLabel || groupItem?.moduleName || key;
                // Get icon name - handle both string and object formats
                const iconName = typeof groupItem?.moduleIcon === 'object' 
                  ? groupItem?.moduleIcon?.value 
                  : groupItem?.moduleIcon;
                const IconComponent = Icons[iconName] || Icons.House;
                return (
                  <li
                    key={key}
                    className="form-builder-card-item"
                    role="button"
                    onClick={() => selectGroup(key)}
                  >
                    <Card className="form-builder-card">
                      <div className="form-builder-card-content">
                        <p className="form-builder-card-title">{moduleName}</p>
                        <IconComponent size={42} className="form-builder-icon" />
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <FormsByGroup
            group={group}
            moduleLabel={moduleMeta?.moduleLabel || moduleMeta?.moduleName || moduleMeta?._id || moduleMeta?.id || ''}
          />
        )}
      </div>
    </div>
  );
}


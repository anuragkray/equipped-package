import { useEffect, useState } from 'react';
import { ChartBar } from '@phosphor-icons/react';
import { getTitleByKeyName } from '../../utils/index.js';
import Checkbox from '../inputs/checkbox';
import { InputField } from '../inputs/input';
import Button from '../ui/button/Button.jsx';
import AttachedModal from '../custom/modal/AttachedModal.jsx';
import { createViewApi, updateViewApi, getViewByTitleApi } from '../../services/viewApi.js';

const hideOptions = ['_id', 'kill'];

const ColumnSelection = ({ moduleName, allColumns = [], selectedColumns = [], onColumnsChange }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [savedView, setSavedView] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch saved view on mount
  useEffect(() => {
    const fetchSavedView = async () => {
      if (!moduleName) return;
      try {
        const response = await getViewByTitleApi(moduleName);
        if (response?.statusCode === 200 && response?.data) {
          setSavedView(response.data);
          if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
            setSelected(response.data.data);
            if (onColumnsChange) {
              onColumnsChange(response.data.data);
            }
          }
        }
      } catch (err) {
      }
    };

    fetchSavedView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleName]);

  // Initialize selected columns from props or saved view
  useEffect(() => {
    const columns =
      allColumns
        ?.filter(field => !hideOptions.includes(typeof field === 'object' ? field.name : field))
        ?.map(field => (typeof field === 'object' ? field.name : field)) || [];

    // Only update if we don't have selected columns already set
    if (selected.length === 0) {
      if (selectedColumns?.length > 0) {
        setSelected(selectedColumns);
      } else if (savedView?.data?.length > 0) {
        setSelected(savedView.data);
      } else if (columns.length) {
        const defaultColumns = columns.slice(0, 5);
        setSelected(defaultColumns);
        if (onColumnsChange) {
          onColumnsChange(defaultColumns);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allColumns, savedView]);

  const getDisplayLabel = option => {
    if (typeof option === 'object' && option.label) {
      return option.label;
    }
    return getTitleByKeyName(option);
  };

  const getOptionName = option => (typeof option === 'object' ? option.name : option);

  const filteredOptions = allColumns?.filter(option => {
    const optionName = getOptionName(option);
    const optionLabel = getDisplayLabel(option);
    return (
      optionLabel?.toLowerCase().includes(search.toLowerCase()) ||
      optionName?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const saveSelectedField = async data => {
    setLoading(true);
    try {
      if (savedView?._id) {
        const response = await updateViewApi(savedView._id, { tableView: moduleName, data });
        if (response?.statusCode === 200) {
          setSavedView({ ...savedView, data });
        }
      } else {
        const response = await createViewApi({ tableView: moduleName, data });
        if (response?.statusCode === 200 && response?.data) {
          setSavedView(response.data);
        }
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = option => {
    const optionName = getOptionName(option);
    setSelected(prev =>
      prev.includes(optionName)
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName],
    );
  };

  const isSelected = option => {
    const optionName = getOptionName(option);
    return selected.includes(optionName);
  };

  const handleSave = async () => {
    await saveSelectedField(selected);
    if (onColumnsChange) {
      onColumnsChange(selected);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    // Reset to saved or initial selection
    if (savedView?.data?.length > 0) {
      setSelected(savedView.data);
    } else if (selectedColumns?.length > 0) {
      setSelected(selectedColumns);
    } else {
      const columns =
        allColumns
          ?.filter(field => !hideOptions.includes(typeof field === 'object' ? field.name : field))
          ?.map(field => (typeof field === 'object' ? field.name : field)) || [];
      setSelected(columns.slice(0, 5));
    }
    setIsOpen(false);
  };

  return (
    <AttachedModal
      trigger={(ref, onClick) => (
        <div
          ref={ref}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Button className="dynamic-module-list-new-btn">
            <ChartBar size={16} weight="regular" style={{ marginRight: '4px' }} />
            Columns
          </Button>
        </div>
      )}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      offsetX={0}
      offsetY={8}
    >
      <div style={{ padding: '16px', minWidth: '250px', maxWidth: '400px' }}>
        <div style={{ marginBottom: '12px' }}>
          <InputField
            type="text"
            placeholder="Search columns..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d0d0', borderRadius: '6px' }}
          />
        </div>

        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '12px' }}>
          {filteredOptions && filteredOptions.length > 0 ? (
            filteredOptions
              .filter(option => !hideOptions.includes(getOptionName(option)))
              .map(option => (
                <div key={getOptionName(option)} style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                    <Checkbox
                      type="checkbox"
                      checked={isSelected(option)}
                      onChange={() => toggleSelection(option)}
                    />
                    <span style={{ marginLeft: '8px', fontSize: '14px', color: '#333' }}>
                      {getDisplayLabel(option)}
                    </span>
                  </label>
                </div>
              ))
          ) : (
            <div style={{ padding: '12px', textAlign: 'center', color: '#666' }}>
              No columns available
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={handleCancel} className="dynamic-module-list-new-btn">
            Cancel
          </Button>
          <Button onClick={handleSave} load={loading} className="dynamic-module-list-new-btn">
            Save
          </Button>
        </div>
      </div>
    </AttachedModal>
  );
};

export default ColumnSelection;


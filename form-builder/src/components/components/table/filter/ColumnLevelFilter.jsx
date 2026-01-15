import { useEffect, useState } from 'react';
import Button from '../../ui/button/Button';
import FilterSelection from './FilterSelection';

const ColumnLevelFilter = ({ columnId, onDone, fields, setFields, handleApplyFilters }) => {
  const [localFields, setLocalFields] = useState(fields || {});
  const data = localFields?.[columnId] || {};
  
  const isApplyDisabled =
    data?.filterObj?.filter === 'BETWEEN'
      ? !(
          data.filterObj?.filter &&
          data.filterObj?.data &&
          data.filterObj.data.to &&
          data.filterObj.data.from
        )
      : !(data?.filterObj?.filter && data?.filterObj?.data);

  const handleApplyFilter = () => {
    if (setFields) {
      setFields(localFields);
    }
    if (handleApplyFilters) {
      handleApplyFilters(localFields);
    }
    onDone();
  };

  const handleClearFilter = () => {
    const updatedField = {
      ...localFields[data.name || columnId],
    };
    delete updatedField.filterObj;
    const updatedFields = {
      ...localFields,
      [data.name || columnId]: updatedField,
    };
    setLocalFields(updatedFields);
    if (setFields) {
      setFields(updatedFields);
    }
    if (handleApplyFilters) {
      handleApplyFilters(updatedFields);
    }
    onDone();
  };

  const filterConditions = data?.conditions?.map(condition => ({
    label: condition,
    value: condition,
  }));

  useEffect(() => {
    if (fields) {
      setLocalFields(fields);
    }
  }, [fields]);

  return (
    <div className="p-2">
      <div className="max-h-60 min-w-[210px] scroll-container-thin">
        <FilterSelection filterConditions={filterConditions} data={data} setFields={setLocalFields} />
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <Button onClick={handleClearFilter} className="dynamic-module-list-new-btn">
          Clear
        </Button>
        <Button disabled={isApplyDisabled} onClick={handleApplyFilter} className="dynamic-module-list-new-btn">
          Apply
        </Button>
      </div>
    </div>
  );
};

export default ColumnLevelFilter;


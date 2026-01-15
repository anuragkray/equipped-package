import { memo } from 'react';
import TrimmedText from '../../trimmed-text/TrimmedText';
import FilterSelection from './FilterSelection';

// Simple Checkbox component
const Checkbox = ({ type, checked, onChange }) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="cursor-pointer w-4 h-4"
    />
  );
};

const FieldRadioOption = ({ data = {}, setFields }) => {
  const handleSelectField = () => {
    setFields(prev => {
      const updated = { ...(prev ?? {}) };
      const fieldObj = { ...(updated[data.name] ?? {}) };
      if (fieldObj.filterObj) {
        delete fieldObj.filterObj;
      } else {
        fieldObj.filterObj = {
          field: data.name,
          data: null,
          filter: null,
          type: data.type,
        };
      }
      updated[data.name] = fieldObj;
      return { ...updated };
    });
  };

  const filterConditions = data?.conditions && data.conditions.length > 0
    ? data.conditions.map(condition => ({
        label: condition.replace(/_/g, ' '),
        value: condition,
      }))
    : [
        { label: 'EQUALS', value: 'EQUALS' },
        { label: 'NOT EQUALS', value: 'NOT_EQUALS' },
        { label: 'CONTAINS', value: 'CONTAINS' },
        { label: 'NOT CONTAINS', value: 'NOT_CONTAINS' },
        { label: 'GREATER THAN', value: 'GREATER_THAN' },
        { label: 'LESS THAN', value: 'LESS_THAN' },
        { label: 'BETWEEN', value: 'BETWEEN' },
      ];

  return (
    <>
      <div className="flex gap-2">
        <Checkbox type="checkbox" checked={Boolean(data?.filterObj)} onChange={handleSelectField} />
        <div className="text-sm text-gray-900">
          <TrimmedText numOfChar={24} text={data?.label} />
        </div>
      </div>
      {data?.filterObj && (
        <FilterSelection filterConditions={filterConditions} data={data} setFields={setFields} />
      )}
    </>
  );
};

export default memo(FieldRadioOption);

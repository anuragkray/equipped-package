import { InputField } from '../../inputs/input';

const ValueField = ({ data = {}, label, onChange, type }) => {
  const handleValueFieldChange = (e) => {
    const value = e.target.value;
    onChange(value, type);
  };

  const customValue =
    data?.filterObj?.filter === 'BETWEEN'
      ? data?.filterObj?.data?.[type] ?? ''
      : data?.filterObj?.data || '';

  // Determine input type based on field type
  const getInputType = () => {
    if (data?.type === 'date') return 'date';
    if (data?.type === 'number' || data?.type === 'amount') return 'number';
    return 'text';
  };

  return (
    <div className="flex flex-col">
      {label && (
        <label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <InputField
        type={getInputType()}
        value={customValue}
        onChange={handleValueFieldChange}
        placeholder={data?.placeholder || `Enter ${label || 'value'}`}
        className="w-full text-sm"
      />
    </div>
  );
};

export default ValueField;

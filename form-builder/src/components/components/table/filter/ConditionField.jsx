import SelectField from '../../inputs/searchInput/SelectField';

const ConditionField = ({ filterConditions, onSelect, data }) => {
  const handleChange = (selectedOption) => {
    onSelect(selectedOption);
  };

  return (
    <SelectField
      options={filterConditions || []}
      value={filterConditions?.find(opt => opt.value === data?.filterObj?.filter) || null}
      onChange={handleChange}
      placeholder="Select a condition..."
      isClearable={false}
      className="text-sm"
    />
  );
};

export default ConditionField;

import { rangeFields } from '../../../utils/constant';
import ConditionField from './ConditionField';
import ValueField from './ValueField';

const numberFields = ['number', 'amount'];

const FilterSelection = ({ filterConditions, data, setFields }) => {
  const handleChange = (value, type) => {
    let newValue = value;
    let rangeObj = null;
    
    if (numberFields.includes(data.type)) {
      newValue = parseFloat(value);
      if (Number.isNaN(newValue)) {
        newValue = null;
      }
    }

    const getValidatedValue = (rangeFieldType) => {
      if (data.type === 'date') {
        const currentDateObj = {
          [rangeFields.TO]: data?.filterObj?.data?.[rangeFields.TO]
            ? new Date(data.filterObj.data[rangeFields.TO])
            : null,
          [rangeFields.FROM]: data?.filterObj?.data?.[rangeFields.FROM]
            ? new Date(data.filterObj.data[rangeFields.FROM])
            : null,
        };
        const newDate = new Date(newValue);
        if (
          rangeFieldType === rangeFields.FROM &&
          currentDateObj[rangeFields.TO] &&
          currentDateObj[rangeFields.TO] <= newDate
        ) {
          return data.filterObj?.data?.[rangeFieldType]
            ? { [rangeFieldType]: data.filterObj.data[rangeFieldType] }
            : {};
        }
        if (
          rangeFieldType === rangeFields.TO &&
          currentDateObj[rangeFields.FROM] &&
          currentDateObj[rangeFields.FROM] >= newDate
        ) {
          return data.filterObj?.data?.[rangeFieldType]
            ? { [rangeFieldType]: data.filterObj.data[rangeFieldType] }
            : {};
        }
      }

      return { [rangeFieldType]: newValue };
    };

    if (data?.filterObj?.filter === 'BETWEEN') {
      rangeObj = data?.filterObj?.data ?? {};
      if (type === rangeFields.FROM) {
        rangeObj = { ...rangeObj, ...getValidatedValue(rangeFields.FROM) };
      }
      if (type === rangeFields.TO) {
        rangeObj = { ...rangeObj, ...getValidatedValue(rangeFields.TO) };
      }
    }

    setFields((prev) => {
      const state = prev ?? {};
      const existingField = state[data.name] ?? {};
      const updatedField = {
        ...existingField,
        filterObj: {
          ...(existingField?.filterObj ?? {
            field: data.name,
            data: null,
            filter: null,
            type: data.type,
          }),
          data: rangeObj ?? newValue,
        },
      };
      return {
        ...state,
        [data.name]: updatedField,
      };
    });
  };

  const handleSelectCondition = (selectedCondition) => {
    setFields((prev) => {
      const state = prev ?? {};
      const existingField = state[data.name] ?? {};
      let filterData = null;
      if (existingField?.filterObj?.data && existingField?.filterObj?.filter) {
        if (
          (existingField.filterObj.filter === 'BETWEEN' && selectedCondition?.value === 'BETWEEN') ||
          (existingField.filterObj.filter !== 'BETWEEN' && selectedCondition?.value !== 'BETWEEN')
        ) {
          filterData = existingField.filterObj.data;
        }
      }
      const updatedField = {
        ...existingField,
        filterObj: {
          ...(existingField?.filterObj ?? {
            field: data.name,
            data: null,
            filter: null,
            type: data.type,
          }),
          data: filterData,
          filter: selectedCondition?.value,
        },
      };
      return {
        ...state,
        [data.name]: updatedField,
      };
    });
  };

  return (
    <div className="grid grid-rows-[1fr_auto]">
      <div className="p-1">
        <ConditionField filterConditions={filterConditions} data={data} onSelect={handleSelectCondition} />
      </div>
      {data?.filterObj?.filter && data?.filterObj?.filter !== 'BETWEEN' && (
        <div className="p-1">
          <ValueField onChange={handleChange} setFields={setFields} data={data} />
        </div>
      )}
      {data?.filterObj?.filter === 'BETWEEN' && (
        <div className="flex flex-col">
          <div className="p-1">
            <ValueField onChange={handleChange} data={data} label="From" type={rangeFields.FROM} />
          </div>
          <div className="p-1">
            <ValueField onChange={handleChange} data={data} label="To" type={rangeFields.TO} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSelection;

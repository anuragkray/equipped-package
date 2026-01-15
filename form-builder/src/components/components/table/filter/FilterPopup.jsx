import { useMemo, useState } from 'react';
import { X } from '@phosphor-icons/react';
import Button from '../../ui/button/Button';
import { InputField } from '../../inputs/input';
import FieldRadioOption from './FieldRadioOption';
import { FilterCloseType } from './index';

const FilterPopup = ({ fields = {}, setFields, handleClose }) => {
  const [fieldSearchValue, setFieldSearchValue] = useState('');

  const handleFilterSearch = event => {
    setFieldSearchValue(event.target.value);
  };

  const handleApplyFilters = () => {
    // Use fields prop directly (same as MinervaLMS)
    handleClose(FilterCloseType.ON_APPLY_CLOSE);
  };

  const handleClearFilters = () => {
    const allFilters = { ...fields };
    Object.keys(allFilters)?.forEach(key => {
      if (allFilters[key]) {
        delete allFilters[key].filterObj;
      }
    });
    setFields(allFilters);
    handleClose(FilterCloseType.ON_APPLY_CLOSE);
  };

  const handleClearSearch = () => {
    setFieldSearchValue('');
  };

  const searchedFields = useMemo(() => {
    if (!fieldSearchValue) {
      return fields;
    }
    const newFields = {};
    Object.keys(fields || {}).forEach(key => {
      const field = fields[key];
      if (field?.label?.toLowerCase().trim().includes(fieldSearchValue.toLowerCase().trim())) {
        newFields[key] = field;
      }
    });
    return newFields;
  }, [fieldSearchValue, fields]);

  const handleCloseModal = () => {
    handleClose(FilterCloseType.ON_NORMAL_CLOSE);
  };

  return (
    <div className="grid h-screen grid-rows-[auto_1fr_auto] p-3 gap-3 w-[275px] bg-white dark:bg-black dark:text-gray-300" style={{ height: '100vh', display: 'grid', gridTemplateRows: 'auto 1fr auto', backgroundColor: 'white' }}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold">Filter</span>
          <button
            type="button"
            onClick={handleCloseModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close filter"
          >
            <X size={20} weight="bold" />
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <InputField
            placeholder="Search"
            className="!my-0 !p-1 !px-2"
            value={fieldSearchValue}
            onChange={handleFilterSearch}
          />
          <button
            type="button"
            onClick={handleClearSearch}
            className="border border-slate-200 p-[7px] rounded-md text-slate-400 hover:text-slate-800 cursor-pointer dark:border-slate-700 dark:hover:text-slate-100"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="flex flex-col min-h-min mb-10 gap-2" style={{ minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <span className="text-sm font-bold">Filter by fields</span>
        <div className="overflow-y-scroll h-full flex flex-col gap-2" style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}>
          {searchedFields &&
            Object.keys(searchedFields)?.map(key => (
              <FieldRadioOption key={key} data={searchedFields[key]} setFields={setFields} />
            ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={handleClearFilters} className="dynamic-module-list-new-btn">
          Clear
        </Button>
        <Button onClick={handleApplyFilters} className="dynamic-module-list-new-btn">
          Apply
        </Button>
      </div>
    </div>
  );
};

export default FilterPopup;

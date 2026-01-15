import { genrateUID } from '../../../../../utils/index.js';
import { getCountryListApi, getCurrencyListApi } from '../../../../../services/commonApi.js';
import countryDataFallback from '../../../../../assets/data/countryCode.json';
import currencyCodeFallback from '../../../../../assets/data/currency.json';

// Base input field list without country/currency (will be added dynamically)
const getBaseInputFieldList = () => ({
  [`item-${genrateUID()}`]: {
    name: "Single Line",
    type: "text",
    placeholder: "SingleLine",
    value: "",
    label: "Single Line",
    maxLength: "255",
    required: false,
    removeAble: true,
    gridSize: 6,
  },
  [`item-${genrateUID()}`]: {
    name: "NumberValue",
    type: "number",
    placeholder: "Number",
    value: "",
    label: "Number Value",
    maxLength: "255",
    required: false,
    removeAble: true,
    gridSize: 6,
  },
  [`item-${genrateUID()}`]: {
    name: "Textarea",
    type: "textarea",
    placeholder: "MultiLine",
    value: "",
    label: "Multi Line",
    required: false,
    removeAble: true,
    gridSize: 12,
  },
  [`item-${genrateUID()}`]: {
    name: "Email",
    type: "email",
    placeholder: "Email",
    value: "",
    label: "Email",
    maxLength: "255",
    required: false,
    removeAble: true,
    gridSize: 6,
  },
  [`item-${genrateUID()}`]: {
    name: "Pick List",
    type: "Select",
    placeholder: "Pick List",
    value: "",
    label: "Pick List",
    isDependent: false,
    dependentFieldId: "",
    dependentFieldName: "",
    dependentFieldLabel: "",
    options: [
      { id: genrateUID(), label: "Option 1", value: 1 },
    ],
    required: false,
    removeAble: true,
    maxLength: "255",
    gridSize: 6,
  },
  [`item-${genrateUID()}`]: {
    name: "Multiselect",
    type: "Multiselect",
    placeholder: "Multiselect",
    value: "",
    label: "Multiselect",
    maxLength: "255",
    required: false,
    removeAble: true,
    isDependent: false,
    dependentFieldId: "",
    dependentFieldName: "",
    dependentFieldLabel: "",
    options: [
      { id: genrateUID(), label: "Option 1", value: "1" },
    ],
    gridSize: 6,
  },
  [`item-${genrateUID()}`]: {
    name: "File",
    type: "file",
    placeholder: "File",
    value: "",
    label: "File",
    required: false,
    removeAble: true,
    isDraggable: true,
    gridSize: 12,
  },
  [`item-${genrateUID()}`]: {
    name: "Checkbox",
    type: "checkbox",
    placeholder: "Checkbox",
    value: "",
    label: "Checkbox",
    maxLength: "255",
    required: false,
    removeAble: true,
    gridSize: 12,
  },
  [`item-${genrateUID()}`]: {
    name: "Radio",
    type: "radio",
    placeholder: "Radio",
    value: "",
    label: "Radio",
    required: false,
    removeAble: true,
    options: [
      { id: genrateUID(), label: "Option 1", value: "1" },
      { id: genrateUID(), label: "Option 2", value: "2" },
    ],
    gridSize: 6,
  },
  [`item-${genrateUID()}`]: {
    name: "Date",
    type: "date",
    placeholder: "Date",
    value: "",
    label: "Date",
    maxLength: "255",
    required: false,
    removeAble: true,
    gridSize: 6,
  },
  [`item-${genrateUID()}`]: {
    name: "Date/Time",
    type: "datetime-local",
    placeholder: "Date/Time",
    value: "",
    label: "Date/Time",
    maxLength: "255",
    required: false,
    removeAble: true,
    gridSize: 6,
  },
  [`item-${genrateUID()}`]: {
    name: "amount",
    type: "amount",
    placeholder: "Amount",
    value: "",
    label: "Amount",
    maxLength: "255",
    required: false,
    removeAble: true,
    gridSize: 6,
  },
  [`item-${genrateUID()}`]: {
    name: "Lookup",
    type: "Lookup",
    placeholder: "Lookup",
    label: "Lookup",
    maxLength: "255",
    moduleName: "",
    relatedListTitle: "Related List Name 1",
    required: false,
    multi: false,
    addExistingUI: false,
    removeAble: true,
    options: [],
    gridSize: 6,
  },
  [`item-${genrateUID()}`]: {
    name: "UserLookup",
    type: "Users",
    placeholder: "userLookup",
    value: "",
    moduleName: 'Users',
    maxLength: "255",
    duplicated: false,
    required: false,
    multi: false,
    removeAble: true,
    label: "userLookup",
    gridSize: 6,
  },
});

// Fetch country and currency data from API with fallback
const fetchCountryData = async (useFallback = false) => {
  if (useFallback) {
    return countryDataFallback;
  }
  
  try {
    const response = await getCountryListApi();
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    return countryDataFallback;
  } catch (error) {
    return countryDataFallback;
  }
};

const fetchCurrencyData = async (useFallback = false) => {
  if (useFallback) {
    return currencyCodeFallback;
  }
  
  try {
    const response = await getCurrencyListApi();
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    return currencyCodeFallback;
  } catch (error) {
    return currencyCodeFallback;
  }
};

// Main function to get input field list with country and currency data
export const getInputFieldList = async (useFallback = false) => {
  const baseFields = getBaseInputFieldList();
  
  // Fetch country and currency data
  const [countryData, currencyData] = await Promise.all([
    fetchCountryData(useFallback),
    fetchCurrencyData(useFallback),
  ]);
  
  // Add country field
  const countryField = {
    [`item-${genrateUID()}`]: {
      name: "Country",
      type: "SelectCountry",
      placeholder: "Select Country",
      value: "",
      label: "Select Country",
      options: countryData?.map(c => {
        return {
          ...c,
          id: genrateUID()
        }
      }) || [],
      required: false,
      removeAble: true,
      maxLength: "255",
      gridSize: 6,
    },
  };
  
  // Add currency field
  const currencyField = {
    [`item-${genrateUID()}`]: {
      name: "currencyType",
      type: "selectCurrency",
      placeholder: "Select Currency",
      value: "",
      label: "Currency Type",
      options: currencyData?.map(c => {
        return {
          ...c,
          id: genrateUID()
        }
      }) || [],
      required: false,
      removeAble: true,
      maxLength: "255",
      gridSize: 6,
    },
  };
  
  // Combine all fields
  return {
    ...baseFields,
    ...countryField,
    ...currencyField,
  };
};

export const FormJson = (moduleName) => {
  const inputs = {
    [`item-${genrateUID()}`]: {
      name: `${moduleName}Name`,
      type: "text",
      placeholder: `${moduleName} name`,
      value: "",
      label: `${moduleName} name`,
      maxLength: "155",
      removeAble: false,
      required: false,
      gridSize: 6,
    },
  };
  
  return {
    formTitle: "Untitled",
    sections: [
      {
        canRemove: false,
        sectionsTitle: "New Section",
        id: genrateUID(),
        inputs
      },
    ]
  };
};

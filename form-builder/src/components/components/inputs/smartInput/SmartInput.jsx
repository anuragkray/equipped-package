import React, { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SelectField from "../searchInput/SelectField.jsx";
import { InputField } from "../input/index.jsx";
import CancelButton from "../../ui/button/CancelButton.jsx";
import Button from "../../ui/button/Button.jsx";
import './smartInput.css';

const SmartInput = ({
  name,
  type,
  label,
  containerClass = "mb-4",
  labeltextHide = false,
  control,
  rules,
  options = [],
  placeholder = "",
  defaultValue = "",
  maxLength,
  minLength,
  multi = false,
  showDetailing = true,
  isControlled = false,
  ...rest
}) => {
  const formContext = useFormContext();
  const setValue = formContext?.setValue || (() => { });

  const [selectedValue, setSelectedValue] = useState(
    Array.isArray(defaultValue) ? defaultValue : defaultValue
  );

  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base, state) => ({
      ...base,
      zIndex: 9999,
      backgroundColor: state.selectProps.menuIsOpen
        ? "var(--surface-top-nav-color)"
        : "",
      "@media (prefers-color-scheme: dark)": {
        backgroundColor: "#222426",
      },
    }),
    control: (base, state) => ({
      ...base,
      width: "100%",
      backgroundColor: "transparent",
      padding: "",
      fontWeight: 500,
      fontSize: "0.875rem",
      "&:hover": {
        borderColor: showDetailing
          ? base.borderColor
          : "transparent !important",
      },
      borderColor: showDetailing ? base.borderColor : "transparent !important",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--surface-nav-selected2-color)"
        : state.isFocused
          ? "var(--hover-option-color)"
          : "transparent",
      color: state.isSelected ? "white" : "inherit",
      "&:hover": {
        backgroundColor: "var(--surface-nav-selected2-color)",
        color: "white",
      },
    }),
  };

  const findOption = (value, optionsList) => {
    if (!value && value !== 0) return null;
    let option = optionsList?.find(opt => opt.value === value || String(opt.value) === String(value));
    if (option) return option;
    option = optionsList?.find(opt => opt.label === value || String(opt.label) === String(value));
    return option || null;
  };

  useEffect(() => {
    if (type === "Select" || type === "Multiselect") {
      if (Array.isArray(defaultValue)) {
        const matchedOptions = defaultValue.map((val) => {
          const found = findOption(val, options);
          return found ? found.value : val;
        });
        setSelectedValue(matchedOptions);
      } else {
        const found = findOption(defaultValue, options);
        if (found) {
          setSelectedValue(found.value);
        } else {
          setSelectedValue(defaultValue);
        }
      }
    } else {
      setSelectedValue(defaultValue);
    }
  }, [defaultValue, options, type]);

  const renderInput = ({ field }) => {
    const inputClassName = `w-full bg-white dark:bg-[#2a2f36] p-2 font-[500] text-gray-800 dark:text-gray-200 text-sm placeholder:text-sm focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-[300] border rounded-md border-gray-300 dark:border-gray-600 ${showDetailing
      ? "hover:border-gray-400 focus:border-gray-400 dark:hover:border-gray-500 dark:focus:border-gray-500"
      : "!border-0"
      }`;

    switch (type) {
      case "Multiselect":
        const defaultOptions =
          selectedValue?.map((val) => {
            const found = options.find(
              (option) => option.value === val || option.label === val
            );
            return found || { label: val, value: val };
          }) || [];
        return (
          <SelectField
            styles={customStyles}
            menuPortalTarget={document.body}
            options={options}
            isMulti
            value={defaultOptions}
            placeholder={placeholder}
            onChange={(selected) => {
              const values = selected.map((item) => item.value);
              setSelectedValue(values);
              field.onChange(values);
              isControlled && rest?.customOnChange?.(values);
            }}
            {...rest}
            className="!text-sm"
            classNamePrefix="react-select scroll-container-thin"
          />
        );
      case "Select":
        const selectedOption =
          findOption(selectedValue, options) ||
          (selectedValue
            ? { label: selectedValue, value: selectedValue }
            : null);
        return (
          <SelectField
            styles={customStyles}
            menuPortalTarget={document.body}
            options={options}
            value={selectedOption}
            placeholder={placeholder}
            onChange={(selected) => {
              setSelectedValue(selected?.value);
              field.onChange(selected?.value);
              isControlled && rest?.customOnChange?.(selected?.value);
            }}
            {...rest}
            className="!text-sm"
            classNamePrefix="react-select scroll-container-thin"
          />
        );
      case "amount":
        return (
          <InputField
            type={"number"}
            placeholder={placeholder}
            value={
              isControlled
                ? rest?.customValue ?? ""
                : field.value ?? selectedValue ?? defaultValue ?? ""
            }
            onChange={(e) => {
              const regex = /^[0-9]*$/;
              if (regex.test(e.target.value) || e.target.value === "") {
                setSelectedValue(e.target.value);
                field.onChange(e);
                isControlled && rest?.customOnChange?.(e.target.value);
              }
            }}
            {...rest}
            className={inputClassName}
          />
        );
      case "text":
      case "number":
      case "password":
      case "email":
      case "month":
      case "tel":
        const inputValue = isControlled
          ? rest?.customValue ?? ""
          : field.value ?? selectedValue ?? defaultValue ?? "";
        return (
          <InputField
            type={type}
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => {
              setSelectedValue(e.target.value);
              field.onChange(e);
              isControlled && rest?.customOnChange?.(e.target.value);
            }}
            {...rest}
            className={inputClassName}
          />
        );
      case "date":
        return (
          <DatePicker
            selected={
              isControlled
                ? rest?.customValue
                  ? new Date(rest?.customValue)
                  : null
                : field.value
                  ? new Date(field.value)
                  : null
            }
            onChange={(date) => {
              field.onChange(date);
              rest?.customOnChange?.(date);
            }}
            placeholderText={placeholder}
            className={inputClassName}
            popperClassName="z-10"
            dayClassName={(date) =>
              "hover:bg-purple-200 focus:bg-purple-600 focus:text-white"
            }
            calendarClassName="text-xs border border-gray-200 rounded-md shadow-lg bg-white"
            wrapperClassName="w-full"
            {...rest}
          />
        );
      case "datetime-local":
        return (
          <DatePicker
            selected={
              isControlled
                ? rest?.customValue
                  ? new Date(rest?.customValue)
                  : null
                : field.value
                  ? new Date(field.value)
                  : new Date()
            }
            onChange={(date) => {
              field.onChange(date ? date.toISOString() : null);
              rest?.customOnChange?.(date ? date.toISOString() : null);
            }}
            placeholderText={placeholder}
            className={inputClassName}
            popperClassName="z-10"
            dayClassName={(date) =>
              "hover:bg-purple-200 focus:bg-purple-600 focus:text-white"
            }
            calendarClassName="border border-gray-200 rounded-md shadow-lg bg-white"
            wrapperClassName="w-full"
            showTimeSelect
            timeIntervals={15}
            dateFormat="yyyy/MM/dd h:mm aa"
            {...rest}
          />
        );
      case "radio":
        return (
          <div className="flex gap-4 flex-wrap">
            {options.map((option, idx) => (
              <label
                key={option.value || idx}
                className="inline-flex items-center gap-2 text-sm"
              >
                <InputField
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={
                    isControlled
                      ? rest?.customValue === option.value ||
                      rest?.customValue === option.label
                      : field.value === option.value ||
                      field.value === option.label
                  }
                  onChange={(e) => {
                    setSelectedValue(option.value);
                    field.onChange(option.value);
                    isControlled && rest?.customOnChange?.(option.value);
                  }}
                  {...rest}
                  className="accent-primary"
                />
                {option.label}
              </label>
            ))}
          </div>
        );
      default:
        return (
          <InputField
            type={type}
            placeholder={placeholder}
            value={field.value ?? selectedValue ?? defaultValue ?? ""}
            onChange={(e) => {
              setSelectedValue(e.target.value);
              field.onChange(e);
              rest?.customOnChange?.(e.target.value);
            }}
            {...rest}
            className={inputClassName}
          />
        );
    }
  };

  return (
    <div className={containerClass}>
      {label && !labeltextHide && (
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-textdarkPrimary">
          {label}{" "}
          {rules?.required && (
            <span className="text-sm text-red-400">*</span>
          )}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <>
            {renderInput({ field })}
            {fieldState?.error && (
              <p className="text-xs text-red-400">
                {fieldState?.error.message}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
};

export default SmartInput;

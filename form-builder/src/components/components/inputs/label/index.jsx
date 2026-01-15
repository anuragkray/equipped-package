import React from "react";
import './Label.css';

const Label = ({ required = false, children }) => {
  return (
    <label className="form-label">
      {children}
      {required && <span className="required-asterisk">*</span>}
    </label>
  );
};

export default Label;


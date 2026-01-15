import React from 'react';
import { Warning, X, Info, CheckCircle, WarningDiamond } from "@phosphor-icons/react";
import { toast } from "react-toastify";
import './alert.css';

// Custom Toast Component
const CustomToast = ({ title = "", message = "", type = "info" }) => {
  const typeConfig = {
    error: {
      icon: <Warning size={24} weight="fill" />,
    },
    success: {
      icon: <CheckCircle size={24} weight="fill" />,
    },
    warning: {
      icon: <WarningDiamond size={24} weight="fill" />
    },
    info: {
      icon: <Info size={24} weight="fill" />,
    },
  };

  const { icon } = typeConfig[type];

  return (
    <div className={`custom-alert-toast ${type}`}>
      <div className="custom-alert-icon">
        {icon}
      </div>
      <div className="custom-alert-content">
        <p className="custom-alert-title">{title}</p>
        <p className="custom-alert-message">{message || "Something went wrong. Please try again."}</p>
      </div>
      <button 
        className="custom-alert-close" 
        onClick={() => toast.dismiss()}
        aria-label="Close notification"
      >
        <X size={20} weight="bold" />
      </button>
    </div>
  );
};

// Toast Wrapper Functions
export const alertError = (msg, title = "Error") => {
  toast(<CustomToast title={title} message={msg} type="error" />, {
    position: "bottom-center",
    autoClose: 4000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: "custom-toast-container",
    bodyClassName: "custom-toast-body",
    closeButton: false,
  });
};

export const alertSuccess = (msg, title = "Success") => {
  toast(<CustomToast title={title} message={msg} type="success" />, {
    position: "bottom-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: "custom-toast-container",
    bodyClassName: "custom-toast-body",
    closeButton: false,
  });
};

export const alertWarning = (msg, title = "Warning") => {
  toast(<CustomToast title={title} message={msg} type="warning" />, {
    position: "bottom-center",
    autoClose: 3500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: "custom-toast-container",
    bodyClassName: "custom-toast-body",
    closeButton: false,
  });
};

export const alertInfo = (msg, title = "Information") => {
  toast(<CustomToast title={title} message={msg} type="info" />, {
    position: "bottom-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: "custom-toast-container",
    bodyClassName: "custom-toast-body",
    closeButton: false,
  });
};


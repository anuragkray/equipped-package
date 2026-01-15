import React, { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import { createPortal } from "react-dom";
import './Modal.css';

const Modal = ({
  isOpen,
  onClose,
  children,
  title = "",
  className = "",
  isBlank = false,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setVisible(true);
      
      // Cleanup: reset overflow when modal closes or component unmounts
      return () => {
        document.body.style.overflow = "auto";
      };
    } else {
      // Reset overflow immediately when closing
      document.body.style.overflow = "auto";
      const timer = setTimeout(() => {
        setVisible(false);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        // Ensure overflow is reset on cleanup (backup)
        document.body.style.overflow = "auto";
      };
    }
  }, [isOpen]);

  if (!visible) return null;

  return createPortal(
    <div
      className={`modal-overlay ${isOpen ? "modal-open" : "modal-closed"}`}
      onClick={onClose}
    >
      <div
        className={`modal-content ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-grid">
          <div>
            {!isBlank && (
              <div className="modal-header">
                {title && <h2 className="modal-title">{title}</h2>}
                <button
                  onClick={onClose}
                  className="modal-close-button"
                  aria-label="Close"
                >
                  <X size={22} weight="bold" className="modal-close-icon" />
                </button>
              </div>
            )}
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;

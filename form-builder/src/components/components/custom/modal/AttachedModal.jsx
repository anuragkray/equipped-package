import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Card from "../card";

const AttachedModal = ({ children, trigger, isOpen, setIsOpen, className = "", cardClassName = "", offsetX = 0, offsetY = 5, left = 0 }) => {
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, visibility: 'hidden' });
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const updatePosition = () => {
        const triggerRect = triggerRef.current.getBoundingClientRect();

        const top = triggerRect.bottom + offsetY;
        let calculatedLeft = left || (triggerRect.left + offsetX);

        // Set initial position (visible immediately)
        setDropdownPos({ top, left: calculatedLeft, visibility: 'visible' });
        setShouldRender(true);

        // Then adjust if needed
        setTimeout(() => {
          if (dropdownRef.current) {
            const popupRect = dropdownRef.current.getBoundingClientRect();

            // Adjust if overflowing right
            if (calculatedLeft + popupRect.width > window.innerWidth) {
              calculatedLeft = window.innerWidth - popupRect.width - 10;
            }

            // Adjust if overflowing bottom
            let newTop = top;
            if (top + popupRect.height > window.innerHeight) {
              newTop = triggerRect.top - popupRect.height - offsetY;
            }

            // Clamp to viewport
            calculatedLeft = Math.max(10, calculatedLeft);
            newTop = Math.max(10, newTop);

            setDropdownPos({ top: newTop, left: calculatedLeft, visibility: 'visible' });
          }
        }, 0);
      };

      const animationFrame = requestAnimationFrame(updatePosition);
      return () => cancelAnimationFrame(animationFrame);
    } else if (shouldRender) {
      setShouldRender(false);
      setDropdownPos({ top: 0, left: 0, visibility: 'hidden' });
    }
    // eslint-disable-next-line
  }, [isOpen, offsetX, offsetY, left]);

  const closeModal = () => {
    setDropdownPos({ top: 0, left: 0, visibility: 'hidden' })
    setIsOpen(false);
  }

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line
  }, [setIsOpen]);

  const handleActionOtherThanModal = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target) && 
        triggerRef.current && !triggerRef.current.contains(e.target)) {
      closeModal();
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Use setTimeout to avoid immediate close on open
      const timeoutId = setTimeout(() => {
        // Add event listeners for clicks and scrolls
        document.addEventListener("mousedown", handleActionOtherThanModal);
        document.addEventListener("scroll", handleActionOtherThanModal, true); // Use capture phase for scroll
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        // Cleanup event listeners
        document.removeEventListener("mousedown", handleActionOtherThanModal);
        document.removeEventListener("scroll", handleActionOtherThanModal, true);
      };
    }
    // eslint-disable-next-line
  }, [isOpen]);

  return (
    <>
      {trigger && trigger(triggerRef, () => {
        setIsOpen(prev => !prev);
      })}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className={`fixed z-[9999] transition-opacity ${className}`}
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            visibility: dropdownPos.visibility,
            position: 'fixed',
            pointerEvents: 'auto',
          }}
        >
          <Card className={`bg-white dark:bg-[#222426] text-textPrimary dark:text-textdarkPrimary dark:shadow-darkCardShadow shadow-lightCardShadow rounded-md border ${cardClassName}`} style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', backgroundColor: 'white' }}>
            {children}
          </Card>
        </div>,
        document.body
      )}
    </>
  );
};

export default AttachedModal;


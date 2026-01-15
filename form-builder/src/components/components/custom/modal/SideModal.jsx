import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const SideModal = ({ isOpen, onClose, children, width = '275px' }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
      setTimeout(() => setAnimateIn(true), 10);
    } else if (shouldRender) {
      setAnimateIn(false);
      document.body.style.overflow = 'auto';
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
    
    return () => {
      if (!isOpen) {
        document.body.style.overflow = 'auto';
      }
    };
  }, [isOpen, shouldRender]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target.id === 'side-modal-backdrop') {
      onClose();
    }
  };

  if (!shouldRender) return null;

  return createPortal(
    <div
      id="side-modal-backdrop"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        margin: 0,
      }}
    >
      <div
        className="bg-white dark:bg-black"
        style={{
          height: '100vh',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          borderTopLeftRadius: '12px',
          borderBottomLeftRadius: '12px',
          maxWidth: '100%',
          transform: animateIn ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column',
          width: width,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default SideModal;

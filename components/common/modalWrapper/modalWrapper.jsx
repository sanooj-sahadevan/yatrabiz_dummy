"use client";
import { useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function ModalWrapper({ 
  isOpen, 
  children, 
  onClose, 
  title, 
  maxWidth = "max-w-md",
  showCloseButton = true,
  closeOnOutsideClick = true,
  className = ""
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const sortedElements = Array.from(focusableElements).sort((a, b) => {
        const tabIndexA = parseInt(a.getAttribute('tabindex')) || 0;
        const tabIndexB = parseInt(b.getAttribute('tabindex')) || 0;
        return tabIndexA - tabIndexB;
      });

      const firstInput = sortedElements.find(el => 
        el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA'
      );
      
      const elementToFocus = firstInput || sortedElements[0];
      
      if (elementToFocus) {
        elementToFocus.focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal || !isOpen) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const sortedElements = Array.from(focusableElements).sort((a, b) => {
      const tabIndexA = parseInt(a.getAttribute('tabindex')) || 0;
      const tabIndexB = parseInt(b.getAttribute('tabindex')) || 0;
      return tabIndexA - tabIndexB;
    });

    const firstFocusable = sortedElements[0];
    const lastFocusable = sortedElements[sortedElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      modal.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!closeOnOutsideClick) return;

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, closeOnOutsideClick]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center"
      style={{
        backdropFilter: "blur(8px)",
        background: "rgba(0,0,0,0.35)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={modalRef}
        className={`bg-white w-full ${maxWidth} rounded-xl shadow-lg p-8 relative animate-fadeIn ${className}`}
        onClick={(e) => e.stopPropagation()} // Prevents modal close on content click
      >
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center mb-6">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-label="Close modal"
                tabIndex={1}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        )}

        <div>
          {children}
        </div>
      </div>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

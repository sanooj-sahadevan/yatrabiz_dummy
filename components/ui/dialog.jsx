import React, { useState, useEffect } from 'react';
import { CloseIcon } from '@/constants/icons';

const Dialog = ({ open, onOpenChange, children, ...props }) => {
  return (
    <div {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { open, onOpenChange });
        }
        return child;
      })}
    </div>
  );
};

const DialogTrigger = React.forwardRef(({ asChild, children, ...props }, ref) => {
  if (asChild) {
    return React.cloneElement(children, { ref, ...props });
  }
  
  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  );
});
DialogTrigger.displayName = "DialogTrigger";

const DialogContent = React.forwardRef(({ className = '', children, open, onOpenChange, ...props }, ref) => {
  const [isOpen, setIsOpen] = useState(open);
  
  useEffect(() => {
    setIsOpen(open);
  }, [open]);
  
  if (!isOpen) return null;
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onOpenChange?.(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={handleBackdropClick}
      />
      <div
        ref={ref}
        className={`relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 ${className}`}
        {...props}
      >
        <button
          onClick={() => onOpenChange?.(false)}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <CloseIcon />
        </button>
        {children}
      </div>
    </div>
  );
});
DialogContent.displayName = "DialogContent";

export { Dialog, DialogTrigger, DialogContent }; 
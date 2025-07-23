import React, { useState, useRef, useEffect } from 'react';
import { DropdownArrowIcon, CheckmarkIcon } from '@/constants/icons';

const Select = ({ children, value, onValueChange, ...props }) => {
  return (
    <div {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange });
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = React.forwardRef(({ className = '', children, value, onValueChange, ...props }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const triggerRef = useRef(null);

  useEffect(() => {
    // Find the selected option label
    const selectedOption = React.Children.toArray(children).find(
      child => React.isValidElement(child) && child.props.value === value
    );
    if (selectedOption) {
      setSelectedLabel(selectedOption.props.children);
    }
  }, [value, children]);

  return (
    <div className="relative">
      <button
        ref={ref}
        type="button"
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        <span>{selectedLabel || 'Select option'}</span>
        <DropdownArrowIcon isOpen={isOpen} />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {React.Children.map(children, child => {
            if (React.isValidElement(child) && child.type === SelectContent) {
              return React.cloneElement(child, { 
                onSelect: (val) => {
                  onValueChange(val);
                  setIsOpen(false);
                }
              });
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef(({ className = '', children, onSelect, ...props }, ref) => {
  return (
    <div ref={ref} className={`py-1 ${className}`} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          return React.cloneElement(child, { onSelect });
        }
        return child;
      })}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ className = '', children, value, onSelect, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
      onClick={() => onSelect(value)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <CheckmarkIcon />
      </span>
      {children}
    </button>
  );
});
SelectItem.displayName = "SelectItem";

const SelectValue = React.forwardRef(({ className = '', placeholder, ...props }, ref) => {
  return (
    <span ref={ref} className={`block truncate ${className}`} {...props}>
      {placeholder}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }; 
import React from "react";

export const FormSection = ({ title, children }) => (
  <div className="mb-2">
    <h3 className="text-base font-bold text-gray-800 bg-gray-200 p-1 rounded-t-md">
      {title}
    </h3>
    <div className="p-2 bg-white border border-gray-200 rounded-b-md">
      {children}
    </div>
  </div>
);

export const FormRow = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-x-1 gap-y-1 items-start mb-1 mt-1">
    {children}
  </div>
);

export const FormField = ({ label, children, colSpan = "1" }) => (
  <div className={`flex flex-col col-span-${colSpan}`}>
    <label className="text-xs font-semibold text-gray-700 mb-1">{label}</label>
    {children}
  </div>
); 
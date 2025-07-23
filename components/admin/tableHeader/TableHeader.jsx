import React, { useEffect } from "react";
import { SEARCH_CONFIG, BUTTON_CLASSES } from "@/constants/tableConstants";
import { ClearSearch } from "@/constants/icons";

export default function TableHeader({
  title,
  searchText,
  onSearchChange,
  onAddClick,
  isSuperAdmin,
  tableContext,
  isTitleDropdown,
  titledropdwondata,
  selectedDropdownValue,
  onDropdownChange,
  adminRole,
  searchInputRef, 
}) {
  useEffect(() => {
    if (searchInputRef && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchInputRef]);

  const handleClearSearch = () => {
    onSearchChange({ target: { value: "" } });
  };

  const handleDropdownChange = (event) => {
    const value = event.target.value;
    if (onDropdownChange) {
      onDropdownChange(value);
    }
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold">{title}</h2>
        {isTitleDropdown && titledropdwondata && (
          <div className="flex items-center gap-x-1">
            <select
              className="text-xl font-semibold bg-gray-700 border-none outline-none cursor-pointer p-0  w-auto h-auto shadow-none ring-0"
              value={selectedDropdownValue}
              onChange={handleDropdownChange}
            >
              {Object.entries(titledropdwondata).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      {/* Search bar and Add button container */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder={SEARCH_CONFIG.PLACEHOLDER}
            value={searchText}
            onChange={onSearchChange}
            className={`${SEARCH_CONFIG.INPUT_CLASSES} pr-10`}
          />
          {searchText && (
            <button
              onClick={handleClearSearch}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-lg rounded-full p-2 w-8 h-8 flex items-center justify-center z-50"
              type="button"
              aria-label="Clear search"
            >
              <ClearSearch />
            </button>
          )}
        </div>

        {(isSuperAdmin ||
          (adminRole?.role === "supplier" && tableContext === "tickets")) &&
          onAddClick && (
            <button onClick={onAddClick} className={BUTTON_CLASSES.ADD}>
              Add {title}
            </button>
          )}
      </div>
    </div>
  );
}

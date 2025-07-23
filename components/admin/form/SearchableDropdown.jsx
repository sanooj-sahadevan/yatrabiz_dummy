"use client";

import { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaTimes } from "react-icons/fa";

export default function SearchableDropdown({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  type = "location", // "location" or "airline"
  inputSize = "default", // "small", "default", "large"
  error,
  disabled = false,
}) {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // API endpoint based on type
  const apiEndpoint =
    type === "airline" ? "/api/v1/airlines" : "/api/v1/locations";

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, [type]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update search term when value changes (for initial load)
  useEffect(() => {
    if (value && !isEditing) {
      const selectedItem = items.find((item) => item._id === value);
      if (selectedItem) {
        setSearchTerm(`${selectedItem.name} (${selectedItem.code})`);
      }
    }
  }, [value, items, isEditing]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiEndpoint);
      if (response.ok) {
        const data = await response.json();
        setItems(data.data || []);
        setFilteredItems(data.data || []);
      }
    } catch (error) {
      console.error(`Error fetching ${type}s:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setIsEditing(true);

    if (!term.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter((item) => {
        if (type === "airline") {
          return (
            item.name.toLowerCase().includes(term.toLowerCase()) ||
            item.code.toLowerCase().includes(term.toLowerCase())
          );
        } else {
          return (
            item.name.toLowerCase().includes(term.toLowerCase()) ||
            item.code.toLowerCase().includes(term.toLowerCase())
          );
        }
      });
      setFilteredItems(filtered);
    }
  };

  const handleSelect = (item) => {
    onChange(item._id);
    setSearchTerm(`${item.name} (${item.code})`);
    setIsOpen(false);
    setIsEditing(false);
  };

  const handleClear = () => {
    onChange("");
    setSearchTerm("");
    setIsEditing(false);
    setFilteredItems(items);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputClick = () => {
    setIsOpen(true);
    setIsEditing(true);
    setSearchTerm("");
    setFilteredItems(items);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace" && searchTerm === "") {
      // If backspace is pressed on empty search, clear the selection
      handleClear();
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setIsEditing(false);
      // Restore the selected value display
      const selectedItem = items.find((item) => item._id === value);
      if (selectedItem) {
        setSearchTerm(`${selectedItem.name} (${selectedItem.code})`);
      }
    }
  };

  const selectedItem = items.find((item) => item._id === value);

  // Input size classes
  const getInputSizeClass = () => {
    switch (inputSize) {
      case "small":
        return "px-2 py-1.5 text-xs";
      case "large":
        return "px-4 py-3 text-lg";
      default:
        return "px-3 py-2 text-sm";
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={disabled ? undefined : (e) => handleSearch(e.target.value)}
          onClick={disabled ? undefined : handleInputClick}
          onKeyDown={disabled ? undefined : handleKeyDown}
          placeholder={isEditing ? `Search ${type}s...` : placeholder}
          className={`form-input pr-20 ${error ? "border-red-500" : "border-gray-300"} ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          disabled={disabled}
          readOnly={!isOpen || disabled}
        />

        {/* Clear button */}
        {value && isEditing && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-7 inset-y-0 flex items-center text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Clear selection"
          >
            <FaTimes size={12} />
          </button>
        )}

        {/* Dropdown arrow */}
        <span className="absolute right-1 inset-y-0 flex items-center pointer-events-none">
          <FaChevronDown
            className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""} ${disabled ? "opacity-50" : ""}`}
            size={14}
          />
        </span>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto dropdown-scrollbar">
          {loading ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              Loading {type}s...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              {searchTerm
                ? `No ${type}s found for "${searchTerm}"`
                : `No ${type}s available`}
            </div>
          ) : (
            <>
              {/* Show selected item at top if it exists and is not in filtered results */}
              {selectedItem &&
                !filteredItems.find(
                  (item) => item._id === selectedItem._id
                ) && (
                  <div className="p-2 bg-blue-50 border-b border-blue-100">
                    <div className="text-xs text-blue-600 font-medium mb-1">
                      Currently selected:
                    </div>
                    <div
                      onClick={() => handleSelect(selectedItem)}
                      className="p-2 hover:bg-blue-100 cursor-pointer rounded transition-colors"
                    >
                      <div className="font-medium text-black text-sm">
                        {selectedItem.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {type === "airline"
                          ? `${selectedItem.code}`
                          : selectedItem.code}
                      </div>
                    </div>
                  </div>
                )}

              {/* Filtered results */}
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleSelect(item)}
                  className={`p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                    item._id === value ? "bg-blue-50 hover:bg-blue-100" : ""
                  }`}
                >
                  <div className="font-medium text-black text-sm">
                    {item.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {type === "airline"
                      ? `${item.code}`
                      : item.code}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

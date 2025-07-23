import { useState, useEffect, useMemo, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TICKET_MESSAGES } from "@/constants/ticketConstants";
import { motion } from "framer-motion";

export default function FilterPanel({
  filterAirline,
  setFilterAirline,
  airlines,
  filterDeparture,
  setFilterDeparture,
  departureLocations,
  filterArrival,
  setFilterArrival,
  arrivalLocations,
  filterDate,
  setFilterDate,
  availableDates,
  filteredTickets,
  tickets,
  resetAllFilters,
}) {
  const [departureInput, setDepartureInput] = useState(
    filterDeparture
      ? departureLocations.find((loc) => loc.code === filterDeparture)?.name ||
          ""
      : ""
  );
  const [arrivalInput, setArrivalInput] = useState(
    filterArrival
      ? arrivalLocations.find((loc) => loc.code === filterArrival)?.name || ""
      : ""
  );

  const departureInputRef = useRef(null);
  const arrivalInputRef = useRef(null);
  const departureSuggestionsRef = useRef(null);
  const arrivalSuggestionsRef = useRef(null);

  const [activeDropdown, setActiveDropdown] = useState(null);

  const [isUpdating, setIsUpdating] = useState(false);

  const availableDateObjs = availableDates.map((d) => new Date(d));

  const memoizedDepartureSuggestions = useMemo(() => {
    if (departureInput.length === 0 && !filterDeparture) {
      return departureLocations;
    }
    return departureLocations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(departureInput.toLowerCase()) ||
        loc.code.toLowerCase().includes(departureInput.toLowerCase())
    );
  }, [departureInput, departureLocations, filterDeparture]);

  const memoizedArrivalSuggestions = useMemo(() => {
    if (arrivalInput.length === 0 && !filterArrival) {
      return arrivalLocations;
    }
    return arrivalLocations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(arrivalInput.toLowerCase()) ||
        loc.code.toLowerCase().includes(arrivalInput.toLowerCase())
    );
  }, [arrivalInput, arrivalLocations, filterArrival]);

  const getAirlineTicketCount = (airline) => {
    if (!airline) return filteredTickets.length || 0;

    // Count tickets that would match if this airline is selected
    // Consider current filters except airline
    return (
      tickets?.filter((t) => {
        // Check if ticket matches current filters (excluding airline)
        if (filterDeparture && t.departureLocation?.code !== filterDeparture)
          return false;
        if (filterArrival && t.arrivalLocation?.code !== filterArrival)
          return false;
        if (filterDate) {
          const ticketDate =
            t.dateOfJourney instanceof Date
              ? t.dateOfJourney.toISOString().slice(0, 10)
              : t.dateOfJourney?.slice(0, 10);
          if (ticketDate !== filterDate) return false;
        }

        // Check if ticket matches the specific airline
        const ticketAirline =
          typeof t.airline === "string" ? t.airline : t.airline?.name;
        return ticketAirline === airline;
      }).length || 0
    );
  };

  const getLocationTicketCount = (locationCode, type) => {
    if (!locationCode) return filteredTickets.length || 0;

   
    return (
      tickets?.filter((t) => {
        if (type === "departure") {
          if (filterAirline) {
            const ticketAirline =
              typeof t.airline === "string" ? t.airline : t.airline?.name;
            if (ticketAirline !== filterAirline) return false;
          }
          if (filterArrival && t.arrivalLocation?.code !== filterArrival)
            return false;
          if (filterDate && t.dateOfJourney?.slice(0, 10) !== filterDate)
            return false;
        } else {
          // arrival
          if (filterAirline) {
            const ticketAirline =
              typeof t.airline === "string" ? t.airline : t.airline?.name;
            if (ticketAirline !== filterAirline) return false;
          }
          if (filterDeparture && t.departureLocation?.code !== filterDeparture)
            return false;
          if (filterDate && t.dateOfJourney?.slice(0, 10) !== filterDate)
            return false;
        }

        // Check if ticket matches the specific location
        const location =
          type === "departure" ? t.departureLocation : t.arrivalLocation;
        return location?.code === locationCode;
      }).length || 0
    );
  };

  const getDateTicketCount = (date) => {
    if (!date) return filteredTickets.length || 0;

    // Count tickets that would match if this date is selected
    // Consider current filters except date
    return (
      tickets?.filter((t) => {
        // Check if ticket matches current filters (excluding date)
        if (filterAirline) {
          const ticketAirline =
            typeof t.airline === "string" ? t.airline : t.airline?.name;
          if (ticketAirline !== filterAirline) return false;
        }
        if (filterDeparture && t.departureLocation?.code !== filterDeparture)
          return false;
        if (filterArrival && t.arrivalLocation?.code !== filterArrival)
          return false;

        // Check if ticket matches the specific date
        // Handle both Date objects and string dates
        const ticketDate =
          t.dateOfJourney instanceof Date
            ? t.dateOfJourney.toISOString().slice(0, 10)
            : t.dateOfJourney?.slice(0, 10);
        return ticketDate === date;
      }).length || 0
    );
  };

  const handleAirlineChange = (airline) => {
    setIsUpdating(true);
    setFilterAirline(airline);
    setFilterDate("");
    setDepartureInput("");
    setArrivalInput("");
    setTimeout(() => setIsUpdating(false), 500);
  };

  const handleDepartureChange = (departure) => {
    setFilterDeparture(departure);
    setFilterDate("");
  };

  const handleArrivalChange = (arrival) => {
    setFilterArrival(arrival);
    setFilterDate("");
  };

  const handleClearAllFilters = () => {
    setIsUpdating(true);
    resetAllFilters();
    setDepartureInput("");
    setArrivalInput("");
    setTimeout(() => setIsUpdating(false), 500);
  };

  const handleInputFocus = (inputType) => {
    if (!isUpdating) {
      setActiveDropdown(inputType);
    }
  };

  useEffect(() => {
    if (departureInputRef.current && departureLocations.length > 0) {
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        departureInputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeDropdown === "departure" &&
        departureInputRef.current &&
        !departureInputRef.current.contains(event.target) &&
        departureSuggestionsRef.current &&
        !departureSuggestionsRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
      if (
        activeDropdown === "arrival" &&
        arrivalInputRef.current &&
        !arrivalInputRef.current.contains(event.target) &&
        arrivalSuggestionsRef.current &&
        !arrivalSuggestionsRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  useEffect(() => {
    if (filterDeparture) {
      const foundLoc = departureLocations.find(
        (loc) => loc.code === filterDeparture
      );
      if (foundLoc) setDepartureInput(foundLoc.name);
    } else {
      setDepartureInput("");
    }
  }, [filterDeparture, departureLocations]);

  useEffect(() => {
    if (filterArrival) {
      const foundLoc = arrivalLocations.find(
        (loc) => loc.code === filterArrival
      );
      if (foundLoc) setArrivalInput(foundLoc.name);
    } else {
      setArrivalInput("");
    }
  }, [filterArrival, arrivalLocations]);

  return (
    <motion.div
      className={`p-6 flex flex-col gap-6 transition-opacity duration-300 border-2 border-gray-600 rounded-lg ${
        isUpdating ? "opacity-75" : "opacity-100"
      }`}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold text-center text-gray-800 border-b pb-4">
        Filters
      </h3>
      {/* Ticket Count & Active Filters */}
      <div className="text-sm text-gray-600  rounded-lg">
        <div className="font-medium">
          Showing {filteredTickets.length} of {tickets?.length || 0} tickets
        </div>
        {(filterAirline || filterDeparture || filterArrival || filterDate) && (
          <div className="text-xs mt-1 flex flex-wrap gap-1">
            {filterAirline && (
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Airline: {filterAirline}
              </span>
            )}
            {filterDeparture && (
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded">
                From: {departureInput}
              </span>
            )}
            {filterArrival && (
              <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded">
                To: {arrivalInput}
              </span>
            )}
            {filterDate && (
              <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded">
                Date: {filterDate}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 1. Date Section */}
      <div className="border border-gray-500 rounded-lg p-4 space-y-2">
        <label className="block font-medium">Date</label>
        <div className="relative">
          <DatePicker
            selected={filterDate ? new Date(filterDate) : null}
            onChange={(date) =>
              setFilterDate(date ? date.toLocaleDateString("en-CA") : "")
            }
            includeDates={availableDateObjs}
            placeholderText="Select date"
            className="w-full px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            dateFormat="yyyy-MM-dd"
            isClearable
            disabled={isUpdating}
            dayClassName={(date) =>
              availableDateObjs.some(
                (d) => d.toDateString() === date.toDateString()
              )
                ? "react-datepicker__day--highlighted-blue"
                : undefined
            }
          />
          {/* Date clear handled by DatePicker's isClearable */}
        </div>
        {availableDates.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            Available dates: {availableDates.length} date
            {availableDates.length !== 1 ? "s" : ""}
          </div>
        )}
        {availableDates.length === 0 &&
          (filterAirline || filterDeparture || filterArrival) && (
            <p className="text-sm text-orange-600">
              No dates available with current filters
            </p>
          )}
      </div>

      {/* 2. Departure & Arrival Section */}
      <div className="border border-gray-500 rounded-lg p-4 grid gap-4 md:grid-cols-2">
        {/* Departure */}
        <div className="space-y-2 relative">
          <label className="block font-medium">Departure</label>
          <div className="relative">
            <input
              type="text"
              value={departureInput}
              onChange={(e) => {
                setDepartureInput(e.target.value);
                setFilterDeparture("");
              }}
              onFocus={() => handleInputFocus("departure")}
              onBlur={() => setActiveDropdown(null)}
              placeholder={
                filterAirline
                  ? `Type city or code (${filterAirline} routes only)`
                  : "Type city or code"
              }
              className="w-full px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              disabled={isUpdating}
              ref={departureInputRef}
            />
            {filterDeparture && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                onClick={() => {
                  setFilterDeparture("");
                  setDepartureInput("");
                }}
                tabIndex={-1}
                aria-label="Clear departure filter"
                disabled={isUpdating}
              >
                ×
              </button>
            )}
          </div>
          {activeDropdown === "departure" &&
            memoizedDepartureSuggestions.length > 0 && (
              <div
                ref={departureSuggestionsRef}
                className="bg-white border border-gray-200 rounded shadow-md mt-1 max-h-40 overflow-y-auto absolute z-10 w-full dropdown-scrollbar"
              >
                {memoizedDepartureSuggestions.map((loc) => (
                  <div
                    key={loc.code}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer flex justify-between items-center"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveDropdown(null);
                      setDepartureInput(loc.name);
                      handleDepartureChange(loc.code);
                    }}
                  >
                    <span>
                      {loc.name} ({loc.code})
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {getLocationTicketCount(loc.code, "departure")} tickets
                    </span>
                  </div>
                ))}
              </div>
            )}
          {activeDropdown === "departure" &&
            memoizedDepartureSuggestions.length === 0 &&
            departureInput.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                No matching departure locations found for{" "}
                {filterAirline || "selected filters"}
              </div>
            )}
          {departureLocations.length === 0 &&
            (filterAirline || filterArrival || filterDate) && (
              <p className="text-sm text-orange-600">
                No departure locations available with current filters
              </p>
            )}
        </div>

        {/* Arrival */}
        <div className="space-y-2 relative">
          <label className="block font-medium">Arrival</label>
          <div className="relative">
            <input
              type="text"
              value={arrivalInput}
              onChange={(e) => {
                setArrivalInput(e.target.value);
                setFilterArrival("");
              }}
              onFocus={() => handleInputFocus("arrival")}
              onBlur={() => setActiveDropdown(null)}
              placeholder={
                filterAirline
                  ? `Type city or code (${filterAirline} routes only)`
                  : "Type city or code"
              }
              className="w-full px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              disabled={isUpdating}
              ref={arrivalInputRef}
            />
            {filterArrival && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                onClick={() => {
                  setFilterArrival("");
                  setArrivalInput("");
                }}
                tabIndex={-1}
                aria-label="Clear arrival filter"
                disabled={isUpdating}
              >
                ×
              </button>
            )}
          </div>
          {activeDropdown === "arrival" &&
            memoizedArrivalSuggestions.length > 0 && (
              <div
                ref={arrivalSuggestionsRef}
                className="bg-white border border-gray-200 rounded shadow-md mt-1 max-h-40 overflow-y-auto absolute z-10 w-full dropdown-scrollbar"
              >
                {memoizedArrivalSuggestions.map((loc) => (
                  <div
                    key={loc.code}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer flex justify-between items-center"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveDropdown(null);
                      setArrivalInput(loc.name);
                      handleArrivalChange(loc.code);
                    }}
                  >
                    <span>
                      {loc.name} ({loc.code})
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {getLocationTicketCount(loc.code, "arrival")} tickets
                    </span>
                  </div>
                ))}
              </div>
            )}
          {memoizedArrivalSuggestions.length === 0 &&
            arrivalInput.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                No matching arrival locations found for{" "}
                {filterAirline || "selected filters"}
              </div>
            )}
          {arrivalLocations.length === 0 &&
            (filterAirline || filterDeparture || filterDate) && (
              <p className="text-sm text-orange-600">
                No arrival locations available with current filters
              </p>
            )}
        </div>
      </div>

      {/* 3. Airline Section */}
      <div className="border border-gray-500 rounded-lg p-4 space-y-2">
        <label className="block font-medium flex items-center gap-2">
          Airline
          {isUpdating && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </label>
        <div className="relative">
          <select
            value={filterAirline}
            onChange={(e) => handleAirlineChange(e.target.value)}
            className={`w-full px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              filterAirline ? "pr-12" : "pr-8"
            }`}
            disabled={isUpdating}
          >
            <option value="">
              {TICKET_MESSAGES.UI.ALL_AIRLINES} ({airlines.length})
            </option>
            {airlines.map((airline) => (
              <option key={airline} value={airline}>
                {airline} ({getAirlineTicketCount(airline)})
              </option>
            ))}
          </select>
          {filterAirline && (
            <button
              type="button"
              className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none  px-1"
              onClick={() => handleAirlineChange("")}
              tabIndex={-1}
              aria-label="Clear airline filter"
              disabled={isUpdating}
              style={{ pointerEvents: isUpdating ? "none" : "auto" }}
            >
              ×
            </button>
          )}
        </div>
        {airlines.length === 0 && filterAirline && (
          <p className="text-sm text-orange-600">
            No airlines available with current filters
          </p>
        )}
      </div>

      {/* Clear All Filters Button */}
      {(filterAirline || filterDeparture || filterArrival || filterDate) && (
        <button
          onClick={handleClearAllFilters}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          disabled={isUpdating}
        >
          Clear All Filters
        </button>
      )}

      {/* Datepicker highlight style */}
      <style>{`
        .react-datepicker__day--highlighted-blue {
          background-color: #2563eb !important;
          color: #fff !important;
          border-radius: 50%;
        }
      `}</style>
    </motion.div>
  );
}

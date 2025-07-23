import { HERO_SECTION } from "@/constants/homePageContent";
import { useTickets } from "@/hooks/useTickets";
import { useTicketFilters } from "@/hooks/useTicketFilters";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/hooks/useAuth";

export default function HeroSection() {
  const router = useRouter();
  const { user, isInitializing } = useAuth();
  const { data: tickets, loading } = useTickets("/api/v1/tickets", "Tickets");
  const {
    filterAirline,
    setFilterAirline,
    filterDeparture,
    setFilterDeparture,
    filterArrival,
    setFilterArrival,
    filterDate,
    setFilterDate,
    airlines,
    departureLocations,
    arrivalLocations,
    availableDates,
    resetAllFilters,
    filteredTickets,
  } = useTicketFilters(tickets);

  const [departureInput, setDepartureInput] = useState("");
  const [arrivalInput, setArrivalInput] = useState("");
  const [date, setDate] = useState("");
  const [airline, setAirline] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  const departureInputRef = useRef(null);
  const arrivalInputRef = useRef(null);
  const departureSuggestionsRef = useRef(null);
  const arrivalSuggestionsRef = useRef(null);

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

  const getAirlineTicketCount = (airlineName) => {
    return (
      filteredTickets?.filter((t) => {
        const ticketAirline =
          typeof t.airline === "string" ? t.airline : t.airline?.name;
        return ticketAirline === airlineName;
      }).length || 0
    );
  };

  const getLocationTicketCount = (locationCode, type) => {
    if (!locationCode) return filteredTickets.length || 0;
    return (
      tickets?.filter((t) => {
        if (type === "departure") {
          if (airline) {
            const ticketAirline =
              typeof t.airline === "string" ? t.airline : t.airline?.name;
            if (ticketAirline !== airline) return false;
          }
          if (filterArrival && t.arrivalLocation?.code !== filterArrival)
            return false;
          if (date && t.dateOfJourney?.slice(0, 10) !== date) return false;
        } else {
          if (airline) {
            const ticketAirline =
              typeof t.airline === "string" ? t.airline : t.airline?.name;
            if (ticketAirline !== airline) return false;
          }
          if (filterDeparture && t.departureLocation?.code !== filterDeparture)
            return false;
          if (date && t.dateOfJourney?.slice(0, 10) !== date) return false;
        }
        const location =
          type === "departure" ? t.departureLocation : t.arrivalLocation;
        return location?.code === locationCode;
      }).length || 0
    );
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Save search history
    try {
      const searchData = {
        airline: airline || null,
        departureLocation: filterDeparture || null,
        arrivalLocation: filterArrival || null,
        journeyDate: date || null,
      };

      await fetch("/api/v1/search-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchData),
      });
    } catch (error) {
      console.error("Error saving search history:", error);
    }

    // Navigate to tickets page
    const params = [];
    if (filterDeparture)
      params.push(`departure=${encodeURIComponent(filterDeparture)}`);
    if (filterArrival)
      params.push(`arrival=${encodeURIComponent(filterArrival)}`);
    if (date) params.push(`date=${encodeURIComponent(date)}`);
    if (airline) params.push(`airline=${encodeURIComponent(airline)}`);
    const query = params.length ? `?${params.join("&")}` : "";
    router.push(`/tickets${query}`);
  };

  return (
    <div className="py-6 px-4 md:px-0 flex flex-col gap-8 ">
      <h1 className="text-3xl md:text-4xl font-bold text-white  text-center">
        {HERO_SECTION.heading}
      </h1>
      <p className="text-white text-lg -mt-2  mb-2 text-center w-full">
        {HERO_SECTION.description}
      </p>
      {!isInitializing && user && (
        <form
          className="flex flex-wrap md:flex-nowrap gap-6 p-4 -mt-6 w-full max-w-full mx-auto justify-center items-center"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col flex-1 min-w-[190px] relative">
            <input
              type="text"
              value={departureInput}
              onChange={(e) => {
                setDepartureInput(e.target.value);
                setFilterDeparture("");
              }}
              onFocus={() => setActiveDropdown("departure")}
              placeholder="Departure"
              className="bg-white border border-gray-300 text-gray-900 rounded-lg px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition w-full pr-10"
              disabled={loading || departureLocations.length === 0}
              ref={departureInputRef}
            />
            {departureInput && (
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                style={{ padding: 0 }}
                onClick={() => {
                  setDepartureInput("");
                  setFilterDeparture("");
                }}
                tabIndex={-1}
                aria-label="Clear departure input"
              >
                &#10005;
              </button>
            )}
            {activeDropdown === "departure" &&
              memoizedDepartureSuggestions.filter(
                (loc) => getLocationTicketCount(loc.code, "departure") > 0
              ).length > 0 && (
                <div
                  ref={departureSuggestionsRef}
                  className="bg-white border border-gray-200 rounded shadow-md mt-1 max-h-40 overflow-y-auto absolute z-10 w-full dropdown-scrollbar"
                >
                  {memoizedDepartureSuggestions
                    .filter(
                      (loc) => getLocationTicketCount(loc.code, "departure") > 0
                    )
                    .map((loc) => (
                      <div
                        key={loc.code}
                        className="px-4 py-2 hover:bg-blue-100 cursor-pointer flex justify-between items-center"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveDropdown(null);
                          setDepartureInput(loc.name);
                          setFilterDeparture(loc.code);
                        }}
                      >
                        <span>
                          {loc.name} ({loc.code})
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {getLocationTicketCount(loc.code, "departure")}{" "}
                          tickets
                        </span>
                      </div>
                    ))}
                </div>
              )}
          </div>

          <div className="flex flex-col flex-1 min-w-[190px] relative">
            <input
              type="text"
              value={arrivalInput}
              onChange={(e) => {
                setArrivalInput(e.target.value);
                setFilterArrival("");
              }}
              onFocus={() => setActiveDropdown("arrival")}
              placeholder="Arrival"
              className="bg-white border border-gray-300 text-gray-900 rounded-lg px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition w-full pr-10"
              disabled={loading || arrivalLocations.length === 0}
              ref={arrivalInputRef}
            />
            {arrivalInput && (
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                style={{ padding: 0 }}
                onClick={() => {
                  setArrivalInput("");
                  setFilterArrival("");
                }}
                tabIndex={-1}
                aria-label="Clear arrival input"
              >
                &#10005;
              </button>
            )}
            {activeDropdown === "arrival" &&
              memoizedArrivalSuggestions.filter(
                (loc) => getLocationTicketCount(loc.code, "arrival") > 0
              ).length > 0 && (
                <div
                  ref={arrivalSuggestionsRef}
                  className="bg-white border border-gray-200 rounded shadow-md mt-1 max-h-40 overflow-y-auto absolute z-10 w-full dropdown-scrollbar"
                >
                  {memoizedArrivalSuggestions
                    .filter(
                      (loc) => getLocationTicketCount(loc.code, "arrival") > 0
                    )
                    .map((loc) => (
                      <div
                        key={loc.code}
                        className="px-4 py-2 hover:bg-blue-100 cursor-pointer flex justify-between items-center"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveDropdown(null);
                          setArrivalInput(loc.name);
                          setFilterArrival(loc.code);
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
          </div>

          <div className="flex flex-col flex-1 min-w-[190px]">
            <DatePicker
              selected={date ? new Date(date) : null}
              onChange={(d) => {
                const localDate = d ? d.toLocaleDateString("en-CA") : "";
                setDate(localDate);
                setFilterDate(localDate);
              }}
              includeDates={availableDates.map((d) => new Date(d))}
              placeholderText="Date of Journey"
              className="bg-white border border-gray-300 text-gray-900 rounded-lg px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition w-full"
              dateFormat="yyyy-MM-dd"
              isClearable
              disabled={loading || availableDates.length === 0}
            />
          </div>
          <div className="flex flex-col flex-1 min-w-[190px] relative">
            <select
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              className={`bg-white border border-gray-300 rounded-lg px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition w-full pr-10 ${
                airline ? "text-gray-900 hide-arrow" : "text-gray-500"
              }`}
              disabled={loading || airlines.length === 0}
              style={
                airline
                  ? {
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                    }
                  : {}
              }
            >
              <option value="">Airline</option>
              {airlines.map((a) => (
                <option key={a} value={a}>
                  {a} ({getAirlineTicketCount(a)})
                </option>
              ))}
            </select>
            {!airline && (
              <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {/* ▼ */}
              </span>
            )}
            {airline && (
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                style={{ padding: 0 }}
                onClick={() => setAirline("")}
                tabIndex={-1}
                aria-label="Clear airline selection"
              >
                &#10005;
              </button>
            )}
          </div>
          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className=" hover:bg-background bg-[#17375e] text-white font-semibold px-8 py-4 rounded-lg transition text-base shadow-md mt-2"
              disabled={loading}
            >
              {HERO_SECTION.button}
            </button>
          </div>
        </form>
      )}

      {/* Datepicker highlight style for consistency */}
      <style>{`
        .react-datepicker__day--highlighted-blue {
          background-color: #2563eb !important;
          color: #fff !important;
          border-radius: 50%;
        }
        /* Hide default select arrow when .hide-arrow is present */
        select.hide-arrow {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: none !important;
        }
      `}</style>
    </div>
  );
}

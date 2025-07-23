import { useState, useMemo, useCallback } from "react";

export function useTicketFilters(tickets) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAirline, setFilterAirline] = useState("");
  const [filterDeparture, setFilterDeparture] = useState("");
  const [filterArrival, setFilterArrival] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Memoized base tickets to avoid unnecessary recalculations
  const baseTickets = useMemo(() => tickets || [], [tickets]);

  // Helper function to get tickets that match current filters (excluding the filter being calculated)
  const getFilteredTickets = useCallback((excludeFilter = null) => {
    return baseTickets.filter(ticket => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();

      const matchesSearchTerm = (
        ticket.flightNumber?.toLowerCase().includes(lowerCaseSearchTerm) ||
        ticket.PNR?.toLowerCase().includes(lowerCaseSearchTerm) ||
        (typeof ticket.airline === 'string' ? ticket.airline?.toLowerCase().includes(lowerCaseSearchTerm) : ticket.airline?.name?.toLowerCase().includes(lowerCaseSearchTerm)) ||
        ticket.departureLocation?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        ticket.departureLocation?.code?.toLowerCase().includes(lowerCaseSearchTerm) ||
        ticket.arrivalLocation?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        ticket.arrivalLocation?.code?.toLowerCase().includes(lowerCaseSearchTerm)
      );

      if (searchTerm && !matchesSearchTerm) return false;
      
      // Apply filters except the one being excluded
      if (excludeFilter !== 'airline' && filterAirline) {
        const airlineValue = typeof ticket.airline === 'string' ? ticket.airline : ticket.airline?.name;
        if (airlineValue !== filterAirline) return false;
      }
      if (excludeFilter !== 'departure' && filterDeparture && ticket.departureLocation?.code !== filterDeparture) return false;
      if (excludeFilter !== 'arrival' && filterArrival && ticket.arrivalLocation?.code !== filterArrival) return false;
      if (excludeFilter !== 'date' && filterDate) {
        const ticketDate = ticket.dateOfJourney instanceof Date 
          ? ticket.dateOfJourney.toLocaleDateString('en-CA')
          : ticket.dateOfJourney?.slice(0, 10);
        if (ticketDate !== filterDate) return false;
      }
      
      return true;
    });
  }, [baseTickets, searchTerm, filterAirline, filterDeparture, filterArrival, filterDate]);

  // Dynamic airlines based on other filters
  const airlines = useMemo(() => {
    const relevantTickets = getFilteredTickets('airline');
    const airlineValues = relevantTickets.map(t => {
      return typeof t.airline === 'string' ? t.airline : t.airline?.name;
    }).filter(Boolean);
    return [...new Set(airlineValues)].sort();
  }, [getFilteredTickets]);

  // Dynamic departure locations based on other filters
  const departureLocations = useMemo(() => {
    const relevantTickets = getFilteredTickets('departure');
    const locs = relevantTickets.map(t => t.departureLocation).filter(Boolean);
    const unique = {};
    locs.forEach(loc => {
      if (loc && loc.code) unique[loc.code] = loc;
    });
    return Object.values(unique).sort((a, b) => a.name.localeCompare(b.name));
  }, [getFilteredTickets]);

  // Dynamic arrival locations based on other filters
  const arrivalLocations = useMemo(() => {
    const relevantTickets = getFilteredTickets('arrival');
    const locs = relevantTickets.map(t => t.arrivalLocation).filter(Boolean);
    const unique = {};
    locs.forEach(loc => {
      if (loc && loc.code) unique[loc.code] = loc;
    });
    return Object.values(unique).sort((a, b) => a.name.localeCompare(b.name));
  }, [getFilteredTickets]);

  // Dynamic available dates based on other filters
  const availableDates = useMemo(() => {
    const relevantTickets = getFilteredTickets('date');
    const dates = relevantTickets.map(t => {
      return t.dateOfJourney instanceof Date 
        ? t.dateOfJourney.toLocaleDateString('en-CA')
        : t.dateOfJourney?.slice(0, 10);
    }).filter(Boolean);
    return [...new Set(dates)].sort();
  }, [getFilteredTickets]);

  // Final filtered tickets with all filters applied
  const filteredTickets = useMemo(() => {
    return getFilteredTickets();
  }, [getFilteredTickets]);

  // Clear dependent filters when a filter changes
  const setFilterAirlineWithReset = useCallback((airline) => {
    setFilterAirline(airline);
    // Clear date filter when airline changes
    setFilterDate("");
  }, []);

  const setFilterDepartureWithReset = useCallback((departure) => {
    setFilterDeparture(departure);
    // Clear date filter when departure changes
    setFilterDate("");
  }, []);

  const setFilterArrivalWithReset = useCallback((arrival) => {
    setFilterArrival(arrival);
    // Clear date filter when arrival changes
    setFilterDate("");
  }, []);

  // Reset all filters
  const resetAllFilters = useCallback(() => {
    setSearchTerm("");
    setFilterAirline("");
    setFilterDeparture("");
    setFilterArrival("");
    setFilterDate("");
  }, []);

  return {
    searchTerm, setSearchTerm,
    filterAirline, setFilterAirline: setFilterAirlineWithReset,
    filterDeparture, setFilterDeparture: setFilterDepartureWithReset,
    filterArrival, setFilterArrival: setFilterArrivalWithReset,
    filterDate, setFilterDate,
    filteredTickets,
    airlines,
    departureLocations,
    arrivalLocations,
    availableDates,
    hasAvailableTickets: baseTickets.length > 0,
    resetAllFilters,
  };
}

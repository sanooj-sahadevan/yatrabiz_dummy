"use client";
import Image from "next/image";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useTickets } from "@/hooks/useTickets";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useTicketFilters } from "@/hooks/useTicketFilters";
import TicketCard from "@/components/user/ticket/TicketCard";
import SearchBar from "@/components/user/ticket/SearchAndFilter";
import FilterPanel from "@/components/user/ticket/FilterPanel";
import { TICKET_MESSAGES, TICKET_INFO_NOTE } from "@/constants/ticketConstants";
import { API_ENDPOINTS } from "@/constants/api";
import ToastNotifications from "@/components/common/toastNotifications/toastNotifications";

export default function TicketsClient() {
  const {
    data: tickets,
    loading,
    error,
    refetch,
  } = useTickets(API_ENDPOINTS.TICKET.LIST, "Tickets");

  const {
    searchTerm,
    setSearchTerm,
    filterAirline,
    setFilterAirline,
    filterDeparture,
    setFilterDeparture,
    filterArrival,
    setFilterArrival,
    filterDate,
    setFilterDate,
    filteredTickets,
    airlines,
    departureLocations,
    arrivalLocations,
    availableDates,
    hasAvailableTickets,
    resetAllFilters,
  } = useTicketFilters(tickets);

  // Read query params on mount and set initial filter state
  const searchParams = useSearchParams();
  useEffect(() => {
    const dep = searchParams.get("departure") || "";
    const arr = searchParams.get("arrival") || "";
    const date = searchParams.get("date") || "";
    const airline = searchParams.get("airline") || "";
    if (dep) setFilterDeparture(dep);
    if (arr) setFilterArrival(arr);
    if (date) setFilterDate(date);
    if (airline) setFilterAirline(airline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error, { toastId: "tickets-fetch-error" });
    }
  }, [error]);

  return (
    <div className="min-h-screen py-1 bg-background">
      <div className="w-full max-w-7xl mx-auto rounded-t-3xl bg-background-alt shadow-lg p-2 md:p-6">
        <div className="flex items-center justify-between mb-4 relative">
          <div className="min-w-[180px] ml-4">
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: TICKET_MESSAGES.UI.TICKETS }]}
            />
          </div>
          <h1 className="heading text-3xl font-bold text-center flex-1">
            {TICKET_MESSAGES.UI.TICKETS}
          </h1>
          <div className="min-w-[180px]"></div>
        </div>

        {/* Informational text above search bar */}
        <div className="mb-2 text-sm text-gray-600 text-start ml-4">
          {TICKET_MESSAGES.UI.EASILY_SEARCH_FILTER_TICKETS}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>

        {/* Main content: tickets + filter panel */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Tickets List */}
          <div className="flex-1">
            {filteredTickets.length === 0 ? (
              <div className="flex justify-center items-center h-72">
                <span className="text-gray-500 text-lg">
                  {hasAvailableTickets
                    ? TICKET_MESSAGES.UI.NO_TICKETS_MATCH
                    : TICKET_MESSAGES.UI.NO_TICKETS_AVAILABLE}
                </span>
              </div>
            ) : (
              <div className="grid gap-2 grid-cols-1">
                <div className="relative bg-blue-50 rounded-t-xl shadow p-3 py-4 max-w-4xl w-full overflow-hidden">
                  {/* Background image using next/image */}
                  <Image
                    src="/topview.jpg"
                    alt="Background globe"
                    fill
                    className="z-0 rounded-t-xl object-cover object-center"
                    priority
                  />
                  {/* Blue overlay for opacity */}
                  <div className="absolute inset-0 bg-blue-900 opacity-60 pointer-events-none rounded-t-xl z-10"></div>
                  <p className="relative text-gray-100 text-sm z-20">
                    {TICKET_MESSAGES.UI.DISCOVER_BOOK_AIRLINE_TICKETS}
                  </p>
                </div>
                {filteredTickets.map((ticket) => (
                  <TicketCard key={ticket._id} ticket={ticket} />
                ))}
              </div>
            )}
          </div>

          {/* Filter Panel */}
          <aside className="w-full lg:w-96 lg:sticky lg:top-10 self-start">
            <FilterPanel
              filterAirline={filterAirline}
              setFilterAirline={setFilterAirline}
              airlines={airlines}
              filterDeparture={filterDeparture}
              setFilterDeparture={setFilterDeparture}
              departureLocations={departureLocations}
              filterArrival={filterArrival}
              setFilterArrival={setFilterArrival}
              arrivalLocations={arrivalLocations}
              filterDate={filterDate}
              setFilterDate={setFilterDate}
              availableDates={availableDates}
              filteredTickets={filteredTickets}
              tickets={tickets}
              resetAllFilters={resetAllFilters}
            />
          </aside>
        </div>
        <p className="mt-8 text-xs text-gray-500 w-full mx-auto">
          {TICKET_INFO_NOTE}
        </p>
        <div className="relative w-full h-52 shadow overflow-hidden mt-6 mb-8">
          {/* Background image using next/image */}
          <Image
            src="/ticketPage.jpg"
            alt="Background globe"
            fill
            className="object-cover object-center z-0"
            priority
          />

          {/* Semi-transparent black overlay */}
          <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none"></div>

          {/* Text Content */}
          <p className="absolute inset-0 z-20 flex items-center justify-center text-3xl font-bold text-gray-100 text-center px-4">
            {TICKET_MESSAGES.UI.FIND_BEST_RESALE_AIRLINE_TICKETS}
          </p>
        </div>
      </div>

      <ToastNotifications />
    </div>
  );
} 
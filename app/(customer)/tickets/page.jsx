"use client";
import Image from "next/image";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useEffect, Suspense } from "react";
import { useTickets } from "@/hooks/useTickets";
import { API_ENDPOINTS } from "@/constants/api";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useTicketFilters } from "@/hooks/useTicketFilters";
import TicketCard from "@/components/user/ticket/TicketCard";
import FilterPanel from "@/components/user/ticket/FilterPanel";
import SearchBar from "@/components/user/ticket/SearchAndFilter";
import ToastNotifications from "@/components/common/toastNotifications/toastNotifications";
import {
  TICKET_MESSAGES,
  TICKET_INFO_NOTE,
  CUSTOMER_TICKETS_PAGE_DESCRIPTION,
  CUSTOMER_TICKETS_PAGE_INFO,
  CUSTOMER_TICKETS_PAGE_HERO,
} from "@/constants/ticketConstants";

function TicketsPageContent() {
  const {
    data: tickets,
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
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
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop <
          document.documentElement.offsetHeight - 100 ||
        loading ||
        !hasMore
      ) {
        return;
      }
      loadMore();
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, loadMore]);

  useEffect(() => {
    if (error) {
      toast.error(error, { toastId: "tickets-fetch-error" });
    }
  }, [error]);

  // Remove duplicates by _id before rendering
  const uniqueTickets = [];
  const seenIds = new Set();
  for (const ticket of filteredTickets) {
    if (!seenIds.has(ticket._id)) {
      uniqueTickets.push(ticket);
      seenIds.add(ticket._id);
    }
  }

  return (
    <motion.div
      className="min-h-screen py-1 bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-7xl mx-auto rounded-t-3xl bg-background-alt shadow-lg p-2 md:p-6"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <div className="flex items-center justify-between mb-4 relative">
          <div className="min-w-[180px] ml-4">
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Tickets" }]}
            />
          </div>
          <h1 className="heading text-3xl font-bold text-center flex-1">
            Tickets
          </h1>
          <div className="min-w-[180px]"></div>
        </div>
        <motion.div
          className="mb-2 text-sm text-gray-600 text-start ml-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {CUSTOMER_TICKETS_PAGE_INFO}
        </motion.div>
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </motion.div>
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
          >
            {loading ? (
              <div className="grid gap-2 grid-cols-1">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="bg-gray-200 animate-pulse rounded-xl shadow p-6 max-w-4xl w-full h-32 mb-2 flex items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <div className="w-16 h-16 bg-gray-300 rounded-full mr-6"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : filteredTickets.length === 0 ? (
              <motion.div
                className="flex justify-center items-center h-72"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-gray-500 text-lg">
                  {hasAvailableTickets
                    ? TICKET_MESSAGES.UI.NO_TICKETS_MATCH
                    : TICKET_MESSAGES.UI.NO_TICKETS_AVAILABLE}
                </span>
              </motion.div>
            ) : (
              <motion.div
                className="grid gap-2 grid-cols-1"
                variants={{
                  visible: { transition: { staggerChildren: 0.12 } },
                }}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  className="relative bg-blue-50 rounded-t-xl shadow p-3 py-4 max-w-4xl w-full overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Image
                    src="/topview.jpg"
                    alt="Background globe"
                    fill
                    className="z-0 rounded-t-xl object-cover object-center"
                    priority
                  />
                  <div className="absolute inset-0 bg-blue-900 opacity-60 pointer-events-none rounded-t-xl z-10"></div>
                  <p className="relative text-gray-100 text-sm z-20">
                    {CUSTOMER_TICKETS_PAGE_DESCRIPTION}
                  </p>
                </motion.div>
                {uniqueTickets.map((ticket, idx) => (
                  <motion.div
                    key={ticket._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + idx * 0.08 }}
                  >
                    <TicketCard ticket={ticket} />
                  </motion.div>
                ))}
              </motion.div>
            )}
            {loading && hasMore && (
              <motion.div
                className="bg-gray-200 animate-pulse rounded-xl shadow p-6 max-w-4xl w-full h-32 my-2 flex items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-16 h-16 bg-gray-300 rounded-full mr-6"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                </div>
              </motion.div>
            )}
          </motion.div>
          {/* Filter Panel */}
          <motion.aside
            className="w-full lg:w-96 lg:sticky lg:top-10 self-start"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
          >
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
          </motion.aside>
        </div>
        <motion.p
          className="mt-8 text-xs text-gray-500 w-full mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {TICKET_INFO_NOTE}
        </motion.p>
        <motion.div
          className="relative w-full h-52 shadow overflow-hidden mt-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
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
          <p className="absolute inset-0 z-20 flex items-center justify-center text-2xl font-bold text-gray-100 text-center px-4">
            {CUSTOMER_TICKETS_PAGE_HERO}
          </p>
        </motion.div>
      </motion.div>
      <ToastNotifications />
    </motion.div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading tickets..." />}>
      <TicketsPageContent />
    </Suspense>
  );
}

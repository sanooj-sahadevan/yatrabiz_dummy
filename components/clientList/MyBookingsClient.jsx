"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { bookingMatchesSearch } from "@/utils/bookingSearch";
import { calculateTravelDuration } from "@/utils/formatters";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBookings";
import { BOOKING_MESSAGES } from "@/constants/bookingConstants";
import AuthenticationRequired from "@/components/user/booking/AuthenticationRequired";
import NoBookings from "@/components/user/booking/NoBookings";
import BookingCard from "@/components/user/booking/BookingCard";

import ToastNotifications from "@/components/common/toastNotifications/toastNotifications";

export default function MyBookingsClient({ initialBookings }) {
  const searchParams = useSearchParams();
  const { user, isInitializing } = useAuth("user");
  const { bookings: fetchedBookings, loading, error } = useBookings(user);
  const [filter, setFilter] = useState("All");
  const [bookings, setBookings] = useState(
    Array.isArray(initialBookings) ? initialBookings : []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAirline, setFilterAirline] = useState("");
  const [filterDeparture, setFilterDeparture] = useState("");
  const [filterArrival, setFilterArrival] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const ticketSessions = useMemo(() => {
    return Array.isArray(bookings)
      ? bookings.map((booking) => {
          const ticket = booking.ticket || {};
          return {
            _bookingId: booking._id,
            airline: ticket.airlineName || "",
            departureLocation: ticket.departure
              ? { code: ticket.departure, name: ticket.departure }
              : { code: "", name: "" },
            arrivalLocation: ticket.arrival
              ? { code: ticket.arrival, name: ticket.arrival }
              : { code: "", name: "" },
            dateOfJourney: ticket.dateOfJourney || "",
            bookingStatus: booking.bookingStatus,
            passengers: booking.passengers,
            travelDuration: calculateTravelDuration(
              ticket.dateOfJourney,
              ticket.departureTime,
              ticket.arrivalTime
            ),
          };
        })
      : [];
  }, [bookings]);

  useEffect(() => {
    if (Array.isArray(fetchedBookings) && fetchedBookings.length > 0) {
      setBookings(fetchedBookings);
    }
  }, [fetchedBookings]);

  useEffect(() => {
    const success = searchParams.get("success");
    const bookingId = searchParams.get("bookingId");
    if (success === "true" && bookingId) {
      toast.success(BOOKING_MESSAGES.SUCCESS.BOOKING_CREATED(bookingId), {
        toastId: `booking-success-${bookingId}`,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (error) {
      toast.error(error, { toastId: "booking-error" });
    }
  }, [error]);

  if (isInitializing || !user) {
    return <LoadingSpinner message={BOOKING_MESSAGES.LOADING.USER_SESSION} />;
  }
  if (!user.id) {
    return <AuthenticationRequired />;
  }
  if (loading) {
    return <LoadingSpinner message={BOOKING_MESSAGES.LOADING.BOOKINGS} />;
  }

  const now = new Date();
  let filteredBookings = Array.isArray(bookings)
    ? bookings.filter((booking) => {
        if (filter === "All") return true;
        if (filter === "Awaiting Payment") {
          return (
            Array.isArray(booking.passengers) &&
            booking.passengers.some((p) => p.paymentStatus === "Pending")
          );
        }
        if (filter === "Upcoming") {
          if (!booking.ticket?.dateOfJourney) return false;
          const journeyDate = new Date(booking.ticket.dateOfJourney);
          return (
            journeyDate >= now &&
            ["Confirmed", "Partially Confirmed"].includes(booking.bookingStatus)
          );
        }
        if (filter === "Finished") {
          if (!booking.ticket?.dateOfJourney) return false;
          const journeyDate = new Date(booking.ticket.dateOfJourney);
          return (
            journeyDate < now &&
            ["Confirmed", "Partially Confirmed", "Completed"].includes(
              booking.bookingStatus
            )
          );
        }
        return true;
      })
    : [];

  if (searchQuery.trim() && Array.isArray(filteredBookings)) {
    filteredBookings = filteredBookings.filter((booking) =>
      bookingMatchesSearch(booking, searchQuery)
    );
  }

  let filteredTicketSessions = ticketSessions.filter((session) => {
    if (!filteredBookings.some((b) => b._id === session._bookingId))
      return false;
    const airlineMatch = !filterAirline || session.airline === filterAirline;
    const departureMatch =
      !filterDeparture || session.departureLocation.name === filterDeparture;
    const arrivalMatch =
      !filterArrival || session.arrivalLocation.name === filterArrival;
    const dateMatch = !filterDate || session.dateOfJourney === filterDate;
    return airlineMatch && departureMatch && arrivalMatch && dateMatch;
  });

  const filteredBookingList = filteredTicketSessions
    .map((session) => bookings.find((b) => b._id === session._bookingId))
    .filter(Boolean);

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
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 relative gap-2 md:gap-0">
          <div className="min-w-0 md:min-w-[180px] w-full md:w-auto ml-0 md:ml-4 flex justify-start">
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "My Bookings" }]}
            />
          </div>
          <h1 className="heading text-2xl md:text-3xl font-bold text-center flex-1 w-full">
            {BOOKING_MESSAGES.UI.MY_BOOKINGS}
          </h1>
          <div className="min-w-0 md:min-w-[180px] w-full md:w-auto" />
        </div>
        {/* Filter Tabs + Search Bar */}
        <div className="flex flex-col md:flex-row rounded-t-2xl items-stretch md:items-center gap-2 md:gap-4 mb-2  w-full overflow-hidden">
          <motion.div
            className="relative flex-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Background image with top rounded corners only */}
            <Image
              src="/booking.jpg"
              alt="Background"
              fill
              className="object-cover object-center z-0 rounded-t-2xl"
              priority
            />

            {/* Blue overlay with top rounded corners only */}
            <div className="absolute inset-0 bg-blue-200 opacity-60 z-10 pointer-events-none rounded-t-2xl" />

            {/* Filter button bar – scrollable on small screens */}
            <div className="flex flex-nowrap overflow-x-auto sm:overflow-visible gap-3 sm:gap-0 h-[56px] relative z-20 hide-scrollbar bg-transparent">
              {["All", "Awaiting Payment", "Upcoming", "Finished"].map(
                (option, idx, arr) => (
                  <motion.button
                    key={option}
                    onClick={() => setFilter(option)}
                    className={`flex-1 min-w-[140px] sm:min-w-[160px] border-none px-6 py-2 text-[1.05rem] sm:text-[1.1rem] font-semibold transition-colors duration-150 focus:outline-none text-center h-auto
              ${
                filter === option
                  ? "bg-background text-white"
                  : "text-background hover:bg-blue-100"
              }
              ${idx === 0 ? "rounded-t-2xl" : ""}
              ${idx === arr.length - 1 ? "rounded-t-2xl" : ""}
            `}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.07, duration: 0.3 }}
                  >
                    {option}
                  </motion.button>
                )
              )}
            </div>
          </motion.div>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}
        {/* Bookings List or No Bookings */}
        {filteredBookingList.length === 0 ? (
          <NoBookings />
        ) : (
          <div className="flex flex-col md:flex-row gap-4">
            <motion.div
              className="flex-1 space-y-2"
              variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
              initial="hidden"
              animate="visible"
            >
              {filteredBookingList.map((booking, idx) => (
                <motion.div
                  key={booking._id + "-" + (booking.passengers?.length || 0)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.08 }}
                >
                  <BookingCard booking={booking} />
                </motion.div>
              ))}
            </motion.div>
            {/* <motion.div
              className="hidden md:block w-full  max-w-[300px]"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
            >
              <h1>make some thing</h1>
            </motion.div> */}
          </div>
        )}
      </motion.div>
      <ToastNotifications />
    </motion.div>
  );
}

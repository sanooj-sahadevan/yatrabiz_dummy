"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTicketBooking } from "@/hooks/useTicketBooking";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { TICKET_MESSAGES } from "@/constants/ticketConstants";
import { API_ENDPOINTS } from "@/constants/api";
import Breadcrumb from "@/components/common/Breadcrumb";
import BookingForm from "@/components/user/ticket/BookingForm";
import { toast } from "react-toastify";
import TicketInfo from "@/components/user/ticket/TicketInfo";
import { formatDate } from "@/utils/formatters";
import { TICKET_DETAILS_TEXT } from "@/constants/ticketDetailsConstant";
import { motion } from "framer-motion";

function TicketDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(API_ENDPOINTS.TICKET.GET_BY_ID(params.id));
        const result = await response.json();
        if (!response.ok) {
          throw new Error(
            result.error || result.message || "Failed to fetch ticket"
          );
        }
        setTicket(result);
      } catch (err) {
        setError(err.message);
        toast.error(err.message, { toastId: "ticket-fetch-error" });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTicket();
    }
  }, [params.id]);

  const {
    isBooking,
    bookingError,
    calculateTotalPrice,
    handleSubmit,
    register,
    errors,
    fields,
    passengerCount,
    isValid,
    watch,
    setValue,
    formHandleSubmit,
  } = useTicketBooking(ticket);

  // Infants state for BookingForm
  const [infants, setInfants] = useState([]);

  useEffect(() => {
    if (bookingError) {
      toast.error(bookingError, { toastId: "booking-error" });
    }
  }, [bookingError]);

  if (loading) {
    return <LoadingSpinner message={TICKET_MESSAGES.LOADING.TICKET_DETAILS} />;
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push("/tickets")}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors mt-4"
          >
            {TICKET_DETAILS_TEXT.BUTTON_BACK_TO_TICKETS}
          </button>
        </div>
      </div>
    );
  }

  if (!ticket.availableSeats || ticket.availableSeats <= 0) {
    toast.error(TICKET_DETAILS_TEXT.NO_SEATS_ERROR, {
      toastId: `no-seats-${ticket._id}`,
    });
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push("/tickets")}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors mt-4"
          >
            {TICKET_DETAILS_TEXT.BUTTON_BACK_TO_TICKETS}
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen py-4 bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-7xl mx-auto rounded-t-3xl bg-background-alt shadow-lg p-2 sm:p-4 md:p-8"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 relative gap-2 md:gap-0">
          <div className="min-w-0 md:min-w-[180px] w-full md:w-auto ml-0 md:ml-4 flex justify-start md:justify-start">
            <Breadcrumb items={TICKET_DETAILS_TEXT.BREADCRUMB} />
          </div>
          <h1 className="heading text-xl sm:text-2xl md:text-3xl font-bold text-center flex-1 w-full">
            {TICKET_MESSAGES.UI.TICKET_DETAILS}
          </h1>
          <div className="min-w-0 md:min-w-[180px] w-full md:w-auto"></div>
        </div>

        <motion.div
          className="relative z-10"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="pb-4 mb-[-48px] bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full">
            <div className="flex-1 flex flex-col gap-2 w-full">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1">
                <span className="inline-block text-blue-600 text-xl sm:text-2xl">
                  ✈️
                </span>
                {TICKET_DETAILS_TEXT.TRIP_TO_PREFIX}{" "}
                {ticket?.arrivalLocation?.name ||
                  TICKET_DETAILS_TEXT.TRIP_DESTINATION_FALLBACK}
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    ticket?.journeyType === "International"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {ticket?.journeyType || "Domestic"}
                </span>
              </h2>

              {/* From → To + Optional Connecting Info */}
              <div className="flex flex-col text-gray-700 text-xs sm:text-sm mb-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="inline-block text-blue-500">📍</span>
                  <span className="truncate max-w-full">
                    {ticket?.departureLocation?.name ||
                      TICKET_DETAILS_TEXT.TRIP_FROM_FALLBACK}{" "}
                    (
                    {ticket?.departureLocation?.code ||
                      TICKET_DETAILS_TEXT.TRIP_DEPARTURE_CODE_FALLBACK}
                    )
                  </span>
                  <span className="mx-2 text-lg text-gray-400">→</span>
                  <span className="inline-block text-blue-500">📍</span>
                  <span className="truncate max-w-full">
                    {ticket?.arrivalLocation?.name ||
                      TICKET_DETAILS_TEXT.TRIP_TO_FALLBACK}{" "}
                    (
                    {ticket?.arrivalLocation?.code ||
                      TICKET_DETAILS_TEXT.TRIP_ARRIVAL_CODE_FALLBACK}
                    )
                  </span>
                </div>

                {ticket?.connectingLocation && (
                  <div className="ml-20 sm:ml-22 text-xs text-gray-700">
                    Via {ticket.connectingLocation.name} (
                    {ticket?.connectingLocation?.code})
                  </div>
                )}
              </div>

              {/* Date & Time */}
              <div className="flex flex-wrap items-center text-xs text-gray-500 mb-1 gap-2">
                <span className="inline-block text-blue-400">🗓️</span>
                {formatDate(ticket?.dateOfJourney, "ticket-details")}
                <span className="inline-block text-gray-400 mx-1">|</span>
                <span className="inline-block text-blue-400">⏰</span>
                {ticket?.departureTime} – {ticket?.arrivalTime}
              </div>

              {/* Additional Flight Details */}
              <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-700">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">
                    {TICKET_DETAILS_TEXT.AIRLINE_LABEL}
                  </span>
                  <span>
                    {ticket?.airline?.name || ticket?.airline || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">
                    {TICKET_DETAILS_TEXT.FLIGHT_NUMBER_LABEL}
                  </span>
                  <span>{ticket?.flightNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">
                    {TICKET_DETAILS_TEXT.CLASS_LABEL}
                  </span>
                  <span>{ticket?.cabinClass || "Economy"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Hand Baggage:</span>
                  <span>{ticket?.handBaggage || "-"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Checked Baggage:</span>
                  <span>{ticket?.checkedBaggage || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="relative flex flex-col md:flex-row gap-8 z-20 w-full">
          <motion.div
            className="flex-1 mt-8 md:mt-12 w-full"
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
          >
            <div className="space-y-6 w-full ">
              {/* Top Alert */}

              <div className="mt-6 max-w-4xl w-full">
                <BookingForm
                  ticket={ticket}
                  isBooking={isBooking}
                  calculateTotalPrice={calculateTotalPrice}
                  handleSubmit={handleSubmit}
                  formHandleSubmit={formHandleSubmit}
                  register={register}
                  errors={errors}
                  fields={fields}
                  passengerCount={passengerCount}
                  isValid={isValid}
                  watch={watch}
                  setValue={setValue}
                  infants={infants}
                  setInfants={setInfants}
                />
              </div>
              <motion.div
                className="flex items-center gap-2 py-4 px-2 sm:px-4 text-gray-800"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span>✔️</span>
                <span>{TICKET_DETAILS_TEXT.TOP_ALERT}</span>
              </motion.div>
              {/* Info Boxes */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full"
                variants={{
                  visible: { transition: { staggerChildren: 0.15 } },
                }}
                initial="hidden"
                animate="visible"
              >
                {TICKET_DETAILS_TEXT.INFO_BOXES.map((box, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                  >
                    <div className="mb-2 text-xl sm:text-2xl">{box.icon}</div>
                    <div className="font-semibold text-base sm:text-lg mb-1">
                      {box.title}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {box.description}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <div className="my-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded text-xs sm:text-sm text-gray-800 max-w-4xl w-full">
                <strong>
                  {TICKET_DETAILS_TEXT.BOOKING_INSTRUCTIONS_TITLE}
                </strong>{" "}
                {TICKET_DETAILS_TEXT.BOOKING_INSTRUCTIONS} <br />
                <span className="block mt-1">
                  {TICKET_DETAILS_TEXT.BOOKING_INSTRUCTIONS_DETAILS}
                </span>
              </div>

              {/* Who's Travelling Heading */}
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 mt-8">
                {TICKET_DETAILS_TEXT.WHO_TRAVELLING_HEADING}
              </h2>

              {/* Passenger Info Box */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200 max-w-4xl w-full">
                <div className="font-semibold text-base sm:text-lg mb-2">
                  {TICKET_DETAILS_TEXT.PASSENGER_INFO_TITLE}
                </div>
                <ul className="text-gray-700 text-xs sm:text-sm list-disc pl-4 sm:pl-5 space-y-1">
                  {TICKET_DETAILS_TEXT.PASSENGER_INFO_LIST.map((item, idx) => (
                    <li key={idx}>
                      <span className="font-bold">{item.title}</span>{" "}
                      {item.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
          {/* TicketInfo Overlay Sticky on Right */}
          <motion.div
            className="hidden md:block md:w-[350px] lg:w-[400px] relative z-30 -mt-24"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5, type: "spring" }}
          >
            <div className="sticky top-8 z-30 pointer-events-auto">
              <div className="absolute inset-0 bg-white/90 shadow-2xl rounded-xl z-20 pointer-events-none"></div>
              <div className="relative z-30 pointer-events-auto">
                <TicketInfo ticket={ticket} />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default TicketDetailsContent;

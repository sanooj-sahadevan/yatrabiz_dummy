import {
  formatDate,
  formatPrice,
  formatTime,
  calculateTravelDuration,
} from "@/utils/formatters";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@/constants/icons";
import { motion } from "framer-motion";

export default function TicketCard({ ticket }) {
  const router = useRouter();

  const formatLocation = (location) => {
    if (!location) return "N/A";
    if (typeof location === "string") return location;
    if (typeof location === "object" && location.name && location.code) {
      return `${location.name} (${location.code})`;
    }
    return "N/A";
  };

  const formatAirline = (airline) => {
    if (!airline) return "N/A";
    if (typeof airline === "string") return airline;
    if (typeof airline === "object" && airline.name) {
      return airline.name;
    }
    return "N/A";
  };

  const travelDuration = calculateTravelDuration(
    ticket.dateOfJourney,
    ticket.departureTime,
    ticket.arrivalTime
  );

  const handleViewDetails = () => {
    router.push(`/tickets/${ticket._id}`);
  };

  return (
    <motion.div
      className="bg-white shadow-md p-4 sm:p-6 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 max-w-4xl w-full rounded-lg"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-row md:flex-col items-center md:items-start min-w-0 md:min-w-[140px] gap-2 md:gap-1 flex-shrink-0">
        <div className="w-10 h-10 md:w-12 md:h-12 mb-0 md:mb-2 flex items-center justify-center bg-gray-100 rounded">
          <span className="text-xl md:text-2xl font-bold text-blue-700">
            {formatAirline(ticket.airline)[0]}
          </span>
        </div>
        <span className="text-base md:text-lg font-bold text-gray-800 leading-tight truncate max-w-[100px] md:max-w-none">
          {formatAirline(ticket.airline)}
        </span>
        <span className="text-xs text-gray-500"></span>
        <span className="text-xs text-gray-700 mt-1">
          Flight:{" "}
          <span className="font-semibold">{ticket.flightNumber || "N/A"}</span>
        </span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-2 min-w-0">
        <div className="flex flex-col sm:flex-row items-center w-full justify-between gap-2 sm:gap-0">
          {/* Departure */}
          <div className="flex flex-col items-center min-w-0">
            <span className="text-xl md:text-2xl font-bold text-gray-900">
              {formatTime(ticket.departureTime) || "--:--"}
            </span>
            <span className="text-xs text-gray-500 mt-1 truncate max-w-[80px] md:max-w-none">
              {formatLocation(ticket.departureLocation)}
            </span>
          </div>
          <div className="flex flex-col items-center mx-0 sm:mx-4 flex-1 w-full sm:w-auto">
            <div className="w-full flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="mx-2 text-xs text-gray-500 whitespace-nowrap">
                {travelDuration} <span className="ml-1"></span>
              </span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
            {ticket.connectingLocation && (
              <div className="flex flex-row items-center justify-between w-full mt-3">
                <div className="flex-1 flex justify-start">
                  <span className="invisible text-xs max-w-[80px]">
                    {formatLocation(ticket.departureLocation)}
                  </span>
                </div>
                <div className="flex-1 mt-2 flex justify-center">
                  <span className="text-xs text-gray-500 truncate max-w-[120px] text-center">
                    via: {formatLocation(ticket.connectingLocation)}
                  </span>
                </div>
                <div className="flex-1 flex justify-end">
                  <span className="invisible text-xs max-w-[80px]">
                    {formatLocation(ticket.arrivalLocation)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center min-w-0">
            <span className="text-xl md:text-2xl font-bold text-gray-900">
              {formatTime(ticket.arrivalTime) || "--:--"}
            </span>
            <span className="text-xs text-gray-500 mt-1 truncate max-w-[80px] md:max-w-none">
              {formatLocation(ticket.arrivalLocation)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 mt-2">
          <span className="text-xs text-gray-600">
            Date:{" "}
            <span className="font-mono">
              {formatDate(ticket.dateOfJourney, "ticket-list")}
            </span>
          </span>
          <span className="text-xs text-gray-600 mt-1">
            Class: {ticket.classType || "N/A"} | Journey:{" "}
            {ticket.journeyType || "N/A"}
          </span>
        </div>
      </div>

      <div className="flex flex-row md:flex-col items-end md:items-end min-w-0 md:min-w-[120px] gap-2 md:gap-2 mt-2 md:mt-0">
        {ticket.Discount > 0 ? (
          <span className="flex items-center gap-2">
            <span className="text-sm md:text-base text-gray-400 line-through">
              {formatPrice(ticket.salePrice)}
            </span>
            <span className="text-lg md:text-2xl font-bold text-green-700">
              {formatPrice(ticket.Discount)}
            </span>
          </span>
        ) : (
          <span className="text-lg md:text-xl font-bold text-gray-900">
            {formatPrice(ticket.salePrice)}
          </span>
        )}
        <span className="text-xs text-gray-700">
          Available Seats: {ticket.availableSeats || ticket.totalSeats}
        </span>
        <motion.button
          onClick={handleViewDetails}
          className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-all duration-300 hover:scale-105 mt-2 bg-transparent border-none outline-none text-xs md:text-sm"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="focus:none">Book Now</span>
          <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
        </motion.button>
      </div>
    </motion.div>
  );
}

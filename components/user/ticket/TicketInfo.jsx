import { motion } from "framer-motion";
import { formatDate, formatPrice } from "@/utils/formatters";
import { TICKET_MESSAGES } from "@/constants/ticketConstants";

const TicketInfo = ({ ticket, numTickets = 1, totalPrice }) => {
  const formatAirline = (airline) => {
    if (!airline) return "N/A";
    if (typeof airline === "string") return airline;
    if (typeof airline === "object" && airline.name) {
      return airline.name;
    }
    return "N/A";
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-5 w-full min-w-[320px] border border-gray-100 flex flex-col gap-3"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Heading */}
      <motion.div
        className="flex flex-col items-center mb-3"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-bold text-deep-blue tracking-wide mb-2">
          Ticket Details
        </h2>
        <div className="h-1 w-12 bg-deep-blue rounded-full" />
      </motion.div>
      {/* Divider */}
      <motion.div
        className="border-t border-gray-200 my-3"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        style={{ originX: 0 }}
      />
      {/* Flight Info */}
      <motion.div
        className="flex flex-col gap-3 text-sm"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <span className="font-semibold text-gray-700">Flight:</span>
          <span className="text-gray-900">{ticket.flightNumber}</span>
        </motion.div>
        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.38 }}
        >
          <span className="font-semibold text-gray-700">Airline:</span>
          <span className="text-gray-900">{formatAirline(ticket.airline)}</span>
        </motion.div>
        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.41 }}
        >
          <span className="font-semibold text-gray-700">Date:</span>
          <span className="text-gray-900">
            {formatDate(ticket.dateOfJourney, "ticket-list")}
          </span>
        </motion.div>

        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.47 }}
        >
          <span className="font-semibold text-gray-700">Departure:</span>
          <span className="text-gray-900">
            {ticket.departureLocation?.code}{" "}
            <span className="text-xs text-gray-500">
              ({ticket.departureTime})
            </span>
          </span>
        </motion.div>
        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="font-semibold text-gray-700">Arrival:</span>
          <span className="text-gray-900">
            {ticket.arrivalLocation?.code}{" "}
            <span className="text-xs text-gray-500">
              ({ticket.arrivalTime})
            </span>
          </span>
        </motion.div>
        {/* Connecting Location (only if present) */}
        {ticket.connectingLocation && (
          <motion.div
            className="flex justify-between items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.52 }}
          >
            <span className="font-semibold text-gray-700">
              Connecting Location:
            </span>
            <span className="text-gray-900">
              {ticket.connectingLocation.code}
            </span>
          </motion.div>
        )}
        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.53 }}
        >
          <span className="font-semibold text-gray-700">Seats Left:</span>
          <span className="text-gray-900">
            {ticket.availableSeats || ticket.totalSeats}
          </span>
        </motion.div>
        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.56 }}
        >
          <span className="font-semibold text-gray-700">Checked Baggage:</span>
          <span className="text-gray-900">
            {ticket.baggageAllowance?.checkedBaggage ||
              (ticket.journeyType === "International" ? 20 : 15)}
            kg
          </span>
        </motion.div>
        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.59 }}
        >
          <span className="font-semibold text-gray-700">Hand Baggage:</span>
          <span className="text-gray-900">
            {ticket.baggageAllowance?.handBaggage || 7}kg
          </span>
        </motion.div>
        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.62 }}
        >
          <span className="font-semibold text-gray-700">Infant Fee:</span>
          <span className="text-gray-900">
            {ticket.infantFees !== undefined && ticket.infantFees !== null
              ? `${ticket.infantFees}`
              : "N/A"}
          </span>
        </motion.div>
      </motion.div>
      {/* Divider */}
      <motion.div
        className="border-t border-gray-200 my-3"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        style={{ originX: 0 }}
      />
      {/* Price Row */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <span className="text-sm text-gray-600">Ticket Price/ticket</span>
        {Number(ticket.Discount) > 0 ? (
          <span className="flex flex-col items-end">
            <span className="text-base text-gray-400 line-through tracking-wide">
              {formatPrice(ticket.salePrice)}
            </span>
            <motion.span
              className="flex items-center gap-2 mt-1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 18,
                delay: 0.1,
              }}
            >
              <motion.span
                className="text-xs mt-2 font-bold text-black relative"
                style={{
                  fontSize: "0.8rem",
                  textShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Discount Price:
              </motion.span>
              <motion.span
                className="text-lg font-semibold text-green-600"
                initial={{ scale: 1, opacity: 1 }}
                animate={{
                  scale: [1, 1.05, 1],
                  color: ["#16a34a", "#22c55e", "#16a34a"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                }}
              >
                {formatPrice(ticket.Discount)}
              </motion.span>
            </motion.span>
          </span>
        ) : (
          <span className="font-semibold text-gray-900 text-lg">
            {formatPrice(ticket.salePrice)}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TicketInfo;

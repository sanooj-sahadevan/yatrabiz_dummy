import Link from "next/link";
import { motion } from "framer-motion";
import { BOOKING_MESSAGES } from "@/constants/bookingConstants";
import { WarningIcon } from "@/constants/icons";

const NoBookings = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center mt-12 max-w-3xl bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 p-10 rounded-3xl shadow-lg border border-yellow-500"
    >
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, 10, -10, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="mb-6"
      >
        <WarningIcon className="w-16 h-16 text-yellow-800" />
      </motion.div>
      <motion.h3
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-2xl font-bold text-yellow-900 mb-3 text-center"
      >
        {BOOKING_MESSAGES.UI.NO_BOOKINGS_FOUND}
      </motion.h3>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="text-yellow-800 mb-6 text-center"
      >
        {BOOKING_MESSAGES.UI.NO_BOOKINGS_MESSAGE}
      </motion.p>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          href="/tickets"
          className="bg-yellow-700 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-yellow-800 transition-colors"
        >
          {BOOKING_MESSAGES.UI.BROWSE_TICKETS}
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default NoBookings;

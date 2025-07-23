"use client";
import { useState } from "react";
import { formatDate, formatPrice, getStatusColor } from "@/utils/formatters";
import { BOOKING_MESSAGES, BOOKING_STATUS } from "@/constants/bookingConstants";
import { AirlineLogoIcon, StatusCircleIcon } from "@/constants/icons";
import BookingDetailsPDF from "@/components/pdf/BookingDetailsPDF";
import PDFDownloadButton from "@/components/ui/PDFDownloadButton";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/common/Modal";
import { saveAs } from "file-saver";
import { pdf } from "@react-pdf/renderer";
import { toast } from "react-toastify";

const BookingCard = ({ booking }) => {
  const [showPassengers, setShowPassengers] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [editValues, setEditValues] = useState({
    honorific: "",
    firstName: "",
    lastName: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passengers, setPassengers] = useState(booking.passengers || []);

  // Price update modal state
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [updatedPrice, setUpdatedPrice] = useState("");
  const [priceError, setPriceError] = useState("");

  const handleEditClick = (idx) => {
    const p = passengers[idx];
    setEditValues({
      honorific: p.honorific || "",
      firstName: p.firstName || "",
      lastName: p.lastName || "",
      remarks: p.remarks || "",
    });
    setEditIdx(idx);
    setError("");
  };

  const handleEditSave = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking._id,
          passengerIndex: editIdx,
          ...editValues,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success)
        throw new Error(
          data.error || data.message || "Failed to update passenger"
        );
      const updated = [...passengers];
      updated[editIdx] = data.passenger;
      setPassengers(updated);
      setEditIdx(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle price update and download
  const handleUpdateAndDownload = () => {
    setShowPriceModal(true);
    setUpdatedPrice("");
    setPriceError("");
  };

  const handlePriceSubmit = async () => {
    // Validate price
    const price = parseFloat(updatedPrice.replace(/[^\d]/g, ""));
    if (!price || price <= 0) {
      setPriceError("Please enter a valid price");
      return;
    }

    setPriceError("");
    setShowPriceModal(false);

    try {
      const updatedBooking = {
        ...booking,
        updatedPrice: price,
      };

      // Trigger download programmatically
      const blob = await pdf(
        <BookingDetailsPDF booking={updatedBooking} />
      ).toBlob();
      saveAs(blob, `ticket-updated-${booking.bookingReference}.pdf`);
      toast.success(`Updated ticket downloaded successfully!`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate updated PDF. Please try again.");
    }
  };

  const formatAirline = (airline) => {
    if (!airline) return "Unknown Airline";
    if (typeof airline === "string") return airline;
    if (typeof airline === "object" && airline.name) {
      return airline.name;
    }
    return "Unknown Airline";
  };

  return (
    <motion.div
      className="relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow text-[15px]"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="p-2 md:p-3">
        {/* Airline and Status Row */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2 gap-2">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <AirlineLogoIcon />
              {formatAirline(booking.ticket?.airline)}
            </h3>

            <div className="flex flex-row gap-4 mt-1 text-xs text-gray-600 font-medium">
              <span>
                PNR:{" "}
                <span className="font-semibold">
                  {booking.bookingStatus === BOOKING_STATUS.CONFIRMED
                    ? booking.ticket?.PNR || "N/A"
                    : "N/A"}
                </span>
              </span>
              <span>
                Journey:{" "}
                <span className="font-semibold">
                  {formatDate(booking.ticket?.dateOfJourney)}
                </span>
              </span>
            </div>
            {/* Second row: Class and Journey Type */}
            <div className="flex flex-row gap-2 mt-1 text-xs text-gray-600 font-medium">
              <span>
                Class:{" "}
                <span className="font-semibold">
                  {booking.ticket?.classType || "N/A"}
                </span>
              </span>
              <span className="mx-1">|</span>
              <span>
                Journey Type:{" "}
                <span className="font-semibold">
                  {booking.ticket?.journeyType || "N/A"}
                </span>
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span
              className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusColor(
                booking.bookingStatus
              )}`}
              aria-label={`Booking status: ${booking.bookingStatus}`}
            >
              <StatusCircleIcon />
              {booking.bookingStatus === "Cancelled"
                ? "Failed"
                : booking.bookingStatus}
            </span>

            <span className="text-[11px] text-gray-400 mt-0.5">
              Ref: {booking.bookingReference}
            </span>
            {booking.bookingStatus === "Cancelled" && booking.remarks && (
              <div className="text-xs italic text-red-500 mt-1">
                {booking.remarks}
              </div>
            )}
          </div>
        </div>

        {/* Grid of Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-1">
          <div>
            <div className="text-gray-400 text-[11px] mb-0.5">Seats</div>
            <div className="text-base font-bold">{booking.numberOfSeats}</div>
          </div>
          <div>
            <div className="text-gray-400 text-[11px] mb-0.5">Total Amount</div>
            <div className="text-base font-bold text-green-600">
              {formatPrice(booking.totalAmount)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-[11px] mb-0.5">
              Payment Status
            </div>
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold">
              {booking.paymentStatus === "Failed"
                ? "Fail"
                : booking.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPassengers && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden text-xs"
          >
            <div className="border-t border-gray-200 p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Array.isArray(passengers) &&
                  passengers.map((passenger, index) => (
                    <span key={index} style={{ marginRight: 8 }}>
                      {[
                        passenger.honorific,
                        passenger.firstName,
                        passenger.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      {passenger.dob && (
                        <span className="ml-1 text-gray-500">
                          (
                          {(() => {
                            const d = new Date(passenger.dob);
                            if (isNaN(d)) return "Invalid DOB";
                            const day = d.getDate();
                            const month = d.toLocaleString("en-US", {
                              month: "short",
                            });
                            const year = d.getFullYear();
                            return `${day} ${month} -${year}`;
                          })()}
                          )
                        </span>
                      )}
                      {passenger.type && (
                        <span className="ml-2 font-semibold text-gray-800">
                          [{passenger.type}]
                        </span>
                      )}
                    </span>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 bg-gray-50/50 p-2 flex justify-end items-center gap-2 rounded-b-lg text-xs">
        <button
          className="px-3 py-1 rounded-md text-xs font-semibold border border-black text-black bg-white hover:bg-gray-100 transition focus:outline-none"
          onClick={() => setShowPassengers((v) => !v)}
          type="button"
        >
          {showPassengers ? "Hide Passengers" : "Show Passengers"}
        </button>
        {(booking.bookingStatus === BOOKING_STATUS.CONFIRMED ||
          booking.bookingStatus === BOOKING_STATUS.PARTIALLY_CONFIRMED) &&
          !booking.ticket?.isDummyPNR && (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <PDFDownloadButton
                  pdfComponent={BookingDetailsPDF}
                  data={{ booking }}
                  filename={`ticket-${booking.bookingReference}.pdf`}
                  className="px-3 py-1 rounded-md text-xs font-semibold border border-black text-black bg-white hover:bg-gray-100 transition focus:outline-none"
                >
                  <div className="flex items-center gap-2">
                    <span>{BOOKING_MESSAGES.UI.DOWNLOAD_TICKET}</span>
                  </div>
                </PDFDownloadButton>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <button
                  onClick={handleUpdateAndDownload}
                  className="px-3 py-1 rounded-md text-xs font-semibold border border-black text-black bg-white hover:bg-gray-100 transition focus:outline-none"
                >
                  <div className="flex items-center gap-2">
                    <span>{BOOKING_MESSAGES.UI.UPDATE_AND_DOWNLOAD}</span>
                  </div>
                </button>
              </motion.div>
            </>
          )}
      </div>

      {/* Edit Modal */}
      {editIdx !== null && (
        <Modal
          isOpen={true}
          onClose={() => setEditIdx(null)}
          title="Edit Passenger"
        >
          <div className="space-y-3 p-4">
            <div>
              <label className="block text-sm font-medium">Honorific</label>
              <input
                className="w-full rounded p-2 border"
                value={editValues.honorific}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, honorific: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium">First Name</label>
              <input
                className="w-full rounded p-2 border"
                value={editValues.firstName}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, firstName: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Last Name</label>
              <input
                className="w-full rounded p-2 border"
                value={editValues.lastName}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, lastName: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Remarks</label>
              <textarea
                className="w-full rounded p-2 border"
                value={editValues.remarks}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, remarks: e.target.value }))
                }
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex justify-end gap-2 mt-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setEditIdx(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleEditSave}
                type="button"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Price Update Modal */}
      {showPriceModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowPriceModal(false)}
          title="Update Price"
        >
          <div className="space-y-3 p-4">
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-1">
                Current Total Price
              </label>
              <div className="text-lg font-semibold text-gray-100 mb-3">
                {formatPrice(booking.totalAmount)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-1">
                New Total Price (₹)
              </label>
              <input
                className="w-full rounded p-2 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                type="text"
                value={updatedPrice}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, "");
                  setUpdatedPrice(value);
                }}
                placeholder="Enter new total price in rupees"
              />
              {priceError && (
                <div className="text-red-600 text-sm mt-1">{priceError}</div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-500 rounded hover:bg-gray-300 transition"
                onClick={() => setShowPriceModal(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={handlePriceSubmit}
                type="button"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update & Download"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
};

export default BookingCard;

"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AGGrid from "@/components/admin/table/AGGrid";
import PaymentSelectionModal from "@/components/admin/modals/PaymentSelectionModal";
import { BOOKING_REQUEST_COLUMNS } from "@/constants/tableColumns";
import { API_ENDPOINTS } from "@/constants/api";
import { sendBookingStatusEmail } from "@/utils/sendBookingStatusEmail";
import { Modal } from "@/components/common/Modal";

export default function BookingRequestClientTable({ data, adminRole }) {
  const [bookings, setBookings] = useState(data);
  const [loading, setLoading] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [isPaymentUpdate, setIsPaymentUpdate] = useState(false);

  useEffect(() => {
    setBookings(data);
  }, [data]);

  const refreshBookingData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.BOOKING.LIST, {
        cache: "no-store",
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setBookings(result.data || []);
        setError(null);
      } else {
        throw new Error(result.message || "Failed to fetch booking data.");
      }
    } catch (error) {
      console.error("Error refreshing booking data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveClick = (bookingId) => {
    setSelectedBookingId(bookingId);
    setIsPaymentUpdate(false);
    setShowPaymentModal(true);
  };

  const handlePendingPaymentClick = (row) => {
    setSelectedBookingId(row._id);
    setIsPaymentUpdate(true);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async (
    bookingId,
    paymentStatus,
    paymentMethod,
    transactionId
  ) => {
    if (loading[bookingId]) return;
    setLoading((prev) => ({ ...prev, [bookingId]: true }));

    try {
      const endpoint = isPaymentUpdate
        ? API_ENDPOINTS.BOOKING.UPDATE_PAYMENT(bookingId)
        : API_ENDPOINTS.BOOKING.APPROVE(bookingId);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: adminRole?.id,
          paymentStatus,
          paymentMethod,
          ...(transactionId ? { transactionId } : {}),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update booking");
      }

      toast.success(
        isPaymentUpdate
          ? `Booking payment status updated to ${paymentStatus}!`
          : `Booking approved and marked as ${paymentStatus}!`
      );

      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, ...result.data } : b))
      );

      try {
        const { user, ticket } = result.data;
        await sendBookingStatusEmail({
          user,
          ticket,
          statusType: isPaymentUpdate ? "payment-updated" : "approved",
        });
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error(error.message || "Failed to update booking");
    } finally {
      setLoading((prev) => ({ ...prev, [bookingId]: false }));
      setShowPaymentModal(false);
      setSelectedBookingId(null);
      setIsPaymentUpdate(false);
    }
  };

  const handleReject = (bookingId) => {
    setRejectTarget({ bookingId });
    setRejectRemarks("");
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    const { bookingId } = rejectTarget;
    if (loading[bookingId]) return;

    setLoading((prev) => ({ ...prev, [bookingId]: true }));

    try {
      const response = await fetch(API_ENDPOINTS.BOOKING.REJECT(bookingId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: adminRole?.id,
          remarks: rejectRemarks,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to reject booking");
      }

      toast.success("Booking rejected successfully!");
      await refreshBookingData();

      try {
        const { user, ticket } = result.data;
        await sendBookingStatusEmail({
          user,
          ticket,
          statusType: "rejected",
        });
      } catch (emailErr) {
        console.error("Failed to send rejection email:", emailErr);
      }
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast.error(error.message || "Failed to reject booking");
    } finally {
      setLoading((prev) => ({ ...prev, [bookingId]: false }));
      setShowRejectModal(false);
      setRejectTarget(null);
      setRejectRemarks("");
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : (
        <div>
          <AGGrid
            data={bookings}
            columns={BOOKING_REQUEST_COLUMNS}
            title="Booking Requests"
            adminRole={adminRole}
            onEditClick={(formData) => {
              const bookingId = formData.get("id");
              handleApproveClick(bookingId);
            }}
            onDeleteClick={(formData) => {
              const bookingId = formData.get("id");
              handleReject(bookingId);
            }}
            onPendingPaymentClick={handlePendingPaymentClick}
            tableContext="bookingRequest"
            actionLabels={{ edit: "Approve", delete: "Reject" }}
            loading={loading}
          />

          <PaymentSelectionModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedBookingId(null);
              setIsPaymentUpdate(false);
            }}
            onConfirm={handlePaymentConfirm}
            bookingId={selectedBookingId}
            initialStep={isPaymentUpdate ? 2 : 1}
          />

          {showRejectModal && (
            <Modal
              isOpen={showRejectModal}
              onClose={() => setShowRejectModal(false)}
              title="Reject Booking Request"
            >
              <div className="space-y-4">
                <p className="text-base text-white">
                  Optionally provide remarks for this rejection:
                </p>
                <textarea
                  className="w-full border border-white text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-200 placeholder-white min-h-[80px] resize-none bg-transparent"
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  placeholder="Enter remarks (optional)"
                  style={{ fontSize: "1rem" }}
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    className="px-5 py-2 rounded-md border border-white bg-transparent text-white hover:bg-white hover:text-red-700 transition"
                    onClick={() => setShowRejectModal(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="px-5 py-2 rounded-md border border-white bg-red-700 text-white font-semibold shadow-sm hover:bg-red-800 hover:text-white transition"
                    onClick={handleRejectConfirm}
                    type="button"
                    disabled={loading[rejectTarget?.bookingId]}
                    style={{ minWidth: 100 }}
                  >
                    {loading[rejectTarget?.bookingId]
                      ? "Rejecting..."
                      : "Reject"}
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}
    </>
  );
}

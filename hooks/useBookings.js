import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { BOOKING_MESSAGES, SUCCESS_MESSAGE_TIMEOUT } from "@/constants/bookingConstants";
import { fetchBookings } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api";

export const useBookings = (user) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchBookingsData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user || !user.id) throw new Error(BOOKING_MESSAGES.ERROR.USER_NOT_AUTHENTICATED);
      const result = await fetchBookings(`${API_ENDPOINTS.BOOKING.LIST}?user=${user.id}`);
      setBookings(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setSuccessMessageWithTimeout = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), SUCCESS_MESSAGE_TIMEOUT);
  };

  useEffect(() => {
    if (user && user.id) {
      fetchBookingsData();
    }
  }, [user]);

  return {
    bookings,
    loading,
    error,
    successMessage,
    fetchBookings: fetchBookingsData,
    setSuccessMessageWithTimeout,
  };
}; 
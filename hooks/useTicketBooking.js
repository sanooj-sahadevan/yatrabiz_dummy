import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { TICKET_MESSAGES } from "@/constants/ticketConstants";
import { API_ENDPOINTS } from "@/constants/api";

export const useTicketBooking = (ticket) => {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      passengers: [
        {
          honorific: "Mr.",
          firstName: "",
          lastName: "",
          dob: "",
        },
      ],
    },
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: true,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "passengers",
  });

  const numberOfSeats = watch("numberOfSeats", 1);
  const passengers = watch("passengers");

  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    const currentPassengers = fields.length;
    const desiredPassengers = parseInt(numberOfSeats, 10) || 0;
    if (currentPassengers < desiredPassengers) {
      for (let i = currentPassengers; i < desiredPassengers; i++) {
        append({
          honorific: "Mr.",
          firstName: "",
          lastName: "",
          dob: "",
        });
      }
    } else if (currentPassengers > desiredPassengers) {
      for (let i = currentPassengers; i > desiredPassengers; i--) {
        remove(i - 1);
      }
    }
  }, [numberOfSeats, fields.length, append, remove]);

  const calculateTotalPrice = useCallback(() => {
    if (!ticket) return 0;
    const pricePerSeat = ticket.salePrice || 0;
    return pricePerSeat * (passengers?.length || 0);
  }, [ticket, passengers]);

  const handleBookingSubmit = async (data) => {
    setIsBooking(true);
    setBookingError("");
    if (!ticket || (data.passengers?.length || 0) > ticket.availableSeats) {
      setBookingError(
        TICKET_MESSAGES.BOOKING.VALIDATION.SEATS_EXCEED_AVAILABLE(
          ticket.availableSeats || 0
        )
      );
      setIsBooking(false);
      return;
    }
    try {
      const response = await fetch(API_ENDPOINTS.BOOKING.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: ticket._id,
          passengers: data.passengers,
          numberOfSeats: data.passengers.length,
          infants: data.infants || [],
          totalAmount: data.totalAmount,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            TICKET_MESSAGES.BOOKING.ERROR.FAILED_TO_CREATE
        );
      }
      if (result.success) {
        router.push(`/my-bookings?success=true&bookingId=${result.data._id}`);
      } else {
        throw new Error(
          result.message || TICKET_MESSAGES.BOOKING.ERROR.FAILED_TO_CREATE
        );
      }
    } catch (error) {
      setBookingError(
        error.message || TICKET_MESSAGES.BOOKING.ERROR.FAILED_TO_CREATE_RETRY
      );
    } finally {
      setIsBooking(false);
    }
  };

  return {
    isBooking,
    bookingError,
    calculateTotalPrice,
    control,
    register,
    formHandleSubmit: handleSubmit, // react-hook-form's handleSubmit
    handleSubmit: handleBookingSubmit, // custom booking handler
    errors,
    fields,
    passengerCount: passengers?.length || 0,
    isValid,
    watch,
    setValue,
  };
};

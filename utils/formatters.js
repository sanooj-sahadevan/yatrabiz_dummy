// Utility functions for formatting data across the application
import { DATE_FORMATS, CURRENCY_FORMAT } from "@/constants/ticketConstants";

export const formatDate = (dateString, format = "default") => {
  if (!dateString) return "N/A";

  let options;
  switch (format) {
    case "ticket-list":
      options = DATE_FORMATS.TICKET_LIST;
      break;
    case "ticket-details":
      options = DATE_FORMATS.TICKET_DETAILS;
      break;
    default:
      options = { year: "numeric", month: "short", day: "numeric" };
  }

  try {
    return new Date(dateString).toLocaleDateString("en-IN", options);
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid Date";
  }
};

export const formatTime = (timeString) => {
  if (!timeString) return "N/A";
  // Format as 24-hour time if possible
  try {
    const [hour, minute] = timeString.split(":");
    if (hour !== undefined && minute !== undefined) {
      const date = new Date();
      date.setHours(Number(hour), Number(minute), 0, 0);
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        hour12: false,
      });
    }
    return timeString;
  } catch {
    return timeString;
  }
};

export const formatDateTime = (dateTimeString, format = "default") => {
  if (!dateTimeString) return "N/A";

  let options;
  switch (format) {
    case "short":
      options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        hour12: false,
      };
      break;
    case "long":
      options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        weekday: "long",
        hourCycle: "h23",
        hour12: false,
      };
      break;
    default:
      options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        hour12: false,
      };
  }

  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleString("en-IN", options);
  } catch (error) {
    console.error("Error formatting datetime:", dateTimeString, error);
    return "Invalid Date";
  }
};

export const calculateTravelDuration = (
  dateOfJourney,
  departureTime,
  arrivalTime
) => {
  if (!dateOfJourney || !departureTime || !arrivalTime) return "N/A";

  try {
    const departureDateTime = new Date(
      `${dateOfJourney.slice(0, 10)}T${departureTime}:00`
    );
    const arrivalDateTime = new Date(
      `${dateOfJourney.slice(0, 10)}T${arrivalTime}:00`
    );

    if (arrivalDateTime < departureDateTime) {
      arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
    }

    const durationMs = arrivalDateTime.getTime() - departureDateTime.getTime();
    const totalMinutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0 && minutes === 0) return "N/A";

    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error(
      "Error calculating travel duration:",
      { dateOfJourney, departureTime, arrivalTime },
      error
    );
    return "N/A";
  }
};

export const formatPrice = (price) =>
  new Intl.NumberFormat(CURRENCY_FORMAT.locale, {
    style: CURRENCY_FORMAT.style,
    currency: CURRENCY_FORMAT.currency,
    maximumFractionDigits: CURRENCY_FORMAT.maximumFractionDigits,
  }).format(price || 0);

export const getStatusColor = (status) => {
  switch (status) {
    case "Confirmed":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    case "Completed":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Formats a Date object as a local 'YYYY-MM-DDTHH:MM' string.
 * @param {Date} date
 * @returns {string}
 */
export function formatLocalDateTime(date) {
  const pad = (n) => n.toString().padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

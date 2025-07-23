// Constants for booking-related functionality

export const BOOKING_MESSAGES = {
  SUCCESS: {
    BOOKING_CREATED: (bookingId) =>
      `Booking created successfully! Booking ID: ${bookingId}`,
    BOOKING_DELETED: "Booking deleted successfully!",
  },
  ERROR: {
    USER_NOT_AUTHENTICATED: "User not authenticated",
    FETCH_FAILED: "Failed to fetch bookings",
    DELETE_FAILED: "Failed to delete booking",
    CONFIRM_DELETE: "Are you sure you want to delete this booking?",
  },
  LOADING: {
    USER_SESSION: "Loading user session...",
    BOOKINGS: "Loading bookings...",
  },
  UI: {
    AUTHENTICATION_REQUIRED: "Authentication Required",
    PLEASE_LOGIN: "Please log in to view your bookings.",
    GO_TO_HOME: "Go to Home",
    ERROR_LOADING: "Error Loading Bookings",
    TRY_AGAIN: "Try Again",
    NO_BOOKINGS_FOUND: "No Bookings Found",
    NO_BOOKINGS_MESSAGE: "You haven't made any bookings yet.",
    BROWSE_TICKETS: "Browse Available Tickets",
    MY_BOOKINGS: "My Bookings",
    PASSENGERS: "Passengers",
    DOWNLOAD_TICKET: "Download Ticket",
    UPDATE_AND_DOWNLOAD: "Update & Download",
    DELETE_BOOKING: "Delete Booking",
    BOOKED_ON: "Booked on:",
    TRAVEL_TIPS: "Travel Tips",
    TRAVEL_TIPS_DESC:
      "Planning ahead and staying informed can make your journey smoother and more enjoyable. Always double-check your travel documents, stay hydrated, and keep your valuables secure. Safe travels!",
    TRAVEL_QUOTE:
      '"The world is a book, and those who do not travel read only one page."\n– Saint Augustine',
  },
};

export const BOOKING_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Failed",
  COMPLETED: "Completed",
};

export const PAYMENT_STATUS = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
};

export const SUCCESS_MESSAGE_TIMEOUT = 5000;

export const TRAVEL_TIPS = [
  "Arrive at the airport 2 hours early.",
  "Keep your ID and ticket handy.",
  "Check baggage rules in advance.",
  "Stay hydrated during your journey.",
  "Double-check your flight time and gate.",
  "Label your luggage clearly.",
  "Carry essential items in your hand baggage.",
  "Be aware of security procedures.",
  "Download your airline's app for updates.",
];

export const BOOKING_FORM_TEXT = {
  ERROR_NO_SEATS:
    "This ticket is not available for booking. No seats are available.",
  HEADING: "🎫 Book Tickets",
  LABEL_NUMBER_OF_PASSENGERS: "Number of Passengers",
  LABEL_PASSENGER_DETAILS: "Passenger Details",
  PASSENGER_DETAILS_NOTE:
    "Enter details for all travelers. Check the box and provide a Date of Birth for kids.",
  TABLE: {
    NAME: "First Name",
    LAST_NAME: "Last Name",
    IS_KID: "Is this a kid?",
    DOB: "Date of Birth",
    HONORIFIC_KID: ["Master", "Miss"],
    HONORIFIC_ADULT: ["Mr.", "Mrs.", "Miss", "Ms."],
    PLACEHOLDER_FIRST_NAME: "First Name",
    PLACEHOLDER_LAST_NAME: "Last Name",
  },
  ERROR_FIRST_NAME_REQUIRED: "First name is required",
  ERROR_LAST_NAME_REQUIRED: "Last name is required",
  ERROR_DOB_REQUIRED: "DOB is required for kids",
  ERROR_DOB_FUTURE: "DOB cannot be in the future",
  ERROR_DOB_MIN: "DOB must be within the past 18 years",
  LABEL_INFANT: "Do you have infant babies?",
  INFANT_NOTE: "(under 1 years, +{fee})",
  INFANT_EXTRA:
    "Infant babies do not require a separate seat, but an extra charge applies.",
  LABEL_TOTAL_AMOUNT: "Total Amount:",
  BUTTON_BOOK: (count, ticket, tickets) =>
    `Book ${count} ${count === 1 ? ticket : tickets}`,
  SUCCESS_BOOKING: "Booking completed successfully!",
};

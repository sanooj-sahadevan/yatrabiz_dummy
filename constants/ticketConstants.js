// Constants for ticket-related functionality

export const TICKET_MESSAGES = {
  LOADING: {
    TICKETS: "Loading tickets...",
    TICKET_DETAILS: "Loading ticket details...",
  },
  ERROR: {
    LOADING_TICKETS: "Error Loading Tickets",
    TICKET_NOT_FOUND: "Ticket Not Found",
    TICKET_NOT_FOUND_DESC: "The requested ticket could not be found.",
    TRY_AGAIN: "Try Again",
    BACK_TO_TICKETS: "Back to Tickets",
  },
  UI: {
    AVAILABLE_TICKETS: "Available Tickets",
    NO_TICKETS_FOUND: "No Tickets Found",
    NO_TICKETS_AVAILABLE: "No tickets with available seats at the moment. Please check back later!",
    NO_TICKETS_MATCH: "No tickets match your search criteria. Try adjusting your filters.",
    SEARCH_PLACEHOLDER: "Search by airline, locations, flight number, or date...",
    ALL_AIRLINES: "All Airlines",
    VIEW_DETAILS: "View Details",
    BOOK_NOW: "Book Now",
    TICKET_DETAILS: "Ticket Details",
    BOOK_TICKETS: "Book Tickets",
    PASSENGER_DETAILS: "Passenger Details",
    TOTAL_AMOUNT: "Total Amount",
    PROCESSING: "Processing...",
    SEATS: "seats",
    SEAT: "seat",
    TICKETS: "Tickets",
    TICKET: "Ticket",
  },
  BOOKING: {
    VALIDATION: {
      FILL_PASSENGER_DETAILS: "Please fill in all passenger details correctly.",
      SEATS_EXCEED_AVAILABLE: (available) => `Only ${available} seats are available.`,
    },
    ERROR: {
      FAILED_TO_CREATE: "Failed to create booking",
      FAILED_TO_CREATE_RETRY: "Failed to create booking. Please try again.",
    },
    SUCCESS: {
      REDIRECT_MESSAGE: "Success - redirect to my bookings",
    },
  },
  FLIGHT_INFO: {
    AIRLINE: "Airline",
    PNR: "PNR",
    SCC: "SCC",
    DATE: "Date",
    AVAILABLE_SEATS: "Available Seats",
    PRICE_PER_SEAT: "Price/Seat",
    QONS: "Qons",
    TOTAL: "Total",
    ADVANCE: "Advance",
    OUTSTANDING: "Outstanding",
    JOURNEY_DATE: "Journey Date",
    PRICE: "Price",
    SALE_PRICE: "Sale Price",
  },
  PASSENGER: {
    NAME: "Name",
    AGE: "Age",
    GENDER: "Gender",
    FULL_NAME: "Full name",
    SELECT: "Select",
    MALE: "M",
    FEMALE: "F",
    OTHER: "Other",
  },
};

export const TICKET_STATUS = {
  AVAILABLE: "available",
  BOOKED: "booked",
  CANCELLED: "cancelled",
};

export const API_ENDPOINTS = {
  TICKETS: "/api/v1/tickets",
  BOOKINGS: "/api/v1/bookings",
};

export const DATE_FORMATS = {
  TICKET_LIST: {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
  TICKET_DETAILS: {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
};

export const CURRENCY_FORMAT = {
  locale: "en-IN",
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
};

export const TICKET_INFO_NOTE =
  "Ticket prices displayed are the lowest available offers for one Economy class seat, based on recent listings from our partner airlines and verified resellers. Prices and seat availability may change at any time. Our platform uses advanced technology to match you with the best resale deals, but please note that not all listings are individually reviewed. We strive to provide accurate and up-to-date information for your next journey.";

export const CUSTOMER_TICKETS_PAGE_DESCRIPTION =
'Discover and book the best flight deals worldwide. Enjoy flexible bookings, secure payments, and exclusive offers for your next journey.'

export const CUSTOMER_TICKETS_PAGE_DESCRIPTION2 =
'Discover and book the best flight deals worldwide. Enjoy flexible bookings, secure payments, and exclusive offers for your next journey.'

export const CUSTOMER_TICKETS_PAGE_INFO =
  "Easily search and filter available tickets to find the best deals for your next trip.";

export const CUSTOMER_TICKETS_PAGE_HERO =
  "Find the best airline tickets, verified and secure, for your next journey—only on our trusted platform."; 
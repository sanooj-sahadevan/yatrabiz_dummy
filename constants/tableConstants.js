// Table-specific constants and configurations

export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  GRID_HEIGHT: 400,
  MIN_COLUMN_WIDTH: 120,
  ACTION_COLUMN_WIDTH: 130,
  FLEX: 1,
};

export const TABLE_CONTEXTS = {
  BOOKING_REQUEST: "bookingRequest",
  TICKETS: "tickets",
  BOOKINGS: "bookings",
  USERS: "users",
  ADMINS: "admins",
  LEDGER: "ledger",
  AUDIT_LOG: "auditLog",
  TICKET_AUDIT_LOG: "ticketAuditLog",
  AIRLINE_AUDIT_LOG: "airlineAuditLog",
  LOCATION_AUDIT_LOG: "locationAuditLog",
  SEARCH_HISTORY: "searchHistory",
  PASSENGER_NAME_EDIT_AUDIT_LOG: "passengerNameEditAuditLog",
};

export const ACTION_LABELS = {
  EDIT: "Edit",
  DELETE: "Delete",
  APPROVE: "Approve",
  REJECT: "Reject",
};

export const LOADING_TEXTS = {
  APPROVING: "Approving...",
  REJECTING: "Rejecting...",
  PROCESSING: "Processing...",
};

export const STATUS_BADGE_CLASSES = {
  BASE: "inline-block px-2 py-1 rounded text-xs font-medium",
  CONFIRMED: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  UNPAID: "bg-red-100 text-red-800",
  REFUNDED: "bg-purple-100 text-purple-800",
  DEFAULT: "bg-gray-100 text-gray-800",
};

export const BUTTON_CLASSES = {
  BASE: "text-xs font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed",
  EDIT: "text-blue-600",
  DELETE: "text-red-600",
  APPROVE: "text-green-600",
  ADD: "px-4 py-2 border border-black rounded-md text-sm font-semibold bg-white text-black hover:bg-black hover:text-white transition",
};

export const SEARCH_CONFIG = {
  PLACEHOLDER: "Search...",
  INPUT_CLASSES:
    "px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    CHECK: "/api/auth/check",
    SESSION: "/api/session",
  },
  ADMIN: {
    LIST: "/api/v1/admins",
    AUDIT: "/api/v1/admin-audit",
  },
  LOCATION: {
    LIST: "/api/v1/locations",
    CREATE: "/api/v1/locations",
    UPDATE: (id) => `/api/v1/locations/${id}`,
    DELETE: (id) => `/api/v1/locations/${id}`,
    AUDIT: "/api/v1/location-audit",
  },
  AIRLINE: {
    LIST: "/api/v1/airlines",
    CREATE: "/api/v1/airlines",
    UPDATE: (id) => `/api/v1/airlines/${id}`,
    DELETE: (id) => `/api/v1/airlines/${id}`,
    AUDIT: "/api/v1/airline-audit",
  },
  USERS: {
    LIST: "/api/v1/users",
  },
  TICKET: {
    LIST: "/api/v1/tickets",
    CREATE: "/api/v1/tickets",
    UPDATE: (id) => `/api/v1/tickets/${id}`,
    DELETE: (id) => `/api/v1/tickets/${id}`,
    GET_BY_ID: (id) => `/api/v1/tickets/${id}`,
    AUDIT: "/api/v1/ticket-audit",
  },
  BOOKING: {
    LIST: "/api/v1/bookings",
    CREATE: "/api/v1/bookings",
    GET_BY_ID: (id) => `/api/v1/bookings/${id}`,
    UPDATE: (id) => `/api/v1/bookings/${id}`,
    DELETE: (id) => `/api/v1/bookings/${id}`,
    APPROVE: (id) => `/api/v1/bookings/${id}/approve`,
    REJECT: (id) => `/api/v1/bookings/${id}/reject`,
    UPDATE_PAYMENT: (id) => `/api/v1/bookings/${id}/update-payment`,
    REQUEST_AUDIT: "/api/v1/booking-request-audit",
  },
  SEARCH_HISTORY: {
    LIST: "/api/v1/search-history",
  },
  ANALYTICS: {
    MONTHLY_BOOKINGS: "/api/v1/analytics/monthly-bookings",
    AIRLINE_MARKET_SHARE: "/api/v1/analytics/airline-market-share",
    TOP_DESTINATIONS: "/api/v1/analytics/top-destinations",
    TOP_SOURCES: "/api/v1/analytics/top-sources",
    TOP_CUSTOMERS: "/api/v1/analytics/top-customers",
    LEDGER_SUMMARY: "/api/v1/analytics/ledger-summary",
  },
  LEDGER_SUMMARY: "/api/v1/ledger-summary?type=customer",
};

export const COOKIE_NAMES = {
  ADMIN_TOKEN: "adminToken",
  USER_TOKEN: "userToken",
};

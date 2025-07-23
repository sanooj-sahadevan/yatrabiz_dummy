export const APP_NAME = "Yatrabiz";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Tickets", href: "/tickets" },
  { label: "Payment Details", href: "/payment-details" },
  { label: "My Bookings", href: "/my-bookings" },
];

import { API_ENDPOINTS as API_ENDPOINTS_MAIN } from "./api";
import { API_ENDPOINTS as TICKET_API_ENDPOINTS } from "./ticketConstants";

export { API_ENDPOINTS_MAIN, TICKET_API_ENDPOINTS };
export * from "./labels";
export * from "./messages";
export * from "./tableColumns";
export * from "./adminList";
export * from "./adminRoles";
export * from "./pdfConstants";
export * from "./ledgerConstants";
export * from "./bookingConstants";

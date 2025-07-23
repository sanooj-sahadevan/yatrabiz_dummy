import {
  DashboardIcon,
  LedgerIcon,
  BookingRequestIcon,
  TicketsIcon,
  CustomersIcon,
  LocationsIcon,
  AirlinesIcon,
  AuditIcon,
  AdminsIcon,
} from "./icons";

export const NAV_ITEMS = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: <DashboardIcon />,
  },
  {
    name: "Ledger",
    path: "/admin/ledger",
    icon: <LedgerIcon />,
  },
  {
    name: "Booking Request",
    path: "/admin/booking-request",
    icon: <BookingRequestIcon />,
  },
  {
    name: "Tickets",
    path: "/admin/tickets",
    icon: <TicketsIcon />,
  },
  {
    name: "Agents",
    path: "/admin/agents",
    icon: <CustomersIcon />,
  },
  {
    name: "Locations",
    path: "/admin/location",
    icon: <LocationsIcon />,
  },
  {
    name: "Airlines",
    path: "/admin/airlines",
    icon: <AirlinesIcon />,
  },
  {
    name: "Audit",
    path: "/admin/audit",
    icon: <AuditIcon />,
  },
  {
    name: "Admins",
    path: "/admin/admins",
    icon: <AdminsIcon />,
  },
];

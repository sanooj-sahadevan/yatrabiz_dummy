import { TABLE_CONFIG } from "./tableConstants";

export const ADMIN_COLUMNS = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    tooltip: "The admin's full name",
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    tooltip: "The admin's email address",
  },
  {
    key: "role",
    label: "Role",
    sortable: true,
    tooltip: "The admin's role (e.g., super admin, admin)",
  },
  {
    key: "actions",
    label: "Actions",
    isAction: true,
    tooltip: "Edit or delete admin",
    className: `px-2 py-1 text-xs rounded font-semibold bg-red-100 text-red-800`,
  },
];

export const LOCATION_COLUMNS = [
  {
    key: "name",
    label: "Location Name",
    sortable: true,
    tooltip: "The name of the location",
  },
  {
    key: "code",
    label: "Location Code",
    sortable: true,
    tooltip: "The code for the location",
  },
  {
    key: "actions",
    label: "Actions",
    isAction: true,
    tooltip: "Edit or delete location",
  },
];

export const AIRLINES_COLUMNS = [
  {
    key: "name",
    label: "Airline Name",
    sortable: true,
    tooltip: "The name of the airline",
  },
  {
    key: "code",
    label: "Airline Code",
    sortable: true,
    tooltip: "The code for the airline",
  },
  {
    key: "actions",
    label: "Actions",
    isAction: true,
    tooltip: "Edit or delete airline",
  },
];

export const BOOKING_REQUEST_COLUMNS = [
  {
    key: "bookingReference",
    label: "Booking Ref",
    sortable: true,
    tooltip: "Reference number for the booking",
  },
  {
    key: "user",
    label: "Agents",
    sortable: true,
    tooltip: "The Agents who made the booking",
  },
  {
    key: "ticket.airline",
    label: "Airline",
    sortable: true,
    tooltip: "Airline for the ticket",
  },
  {
    key: "ticket.PNR",
    label: "PNR",
    sortable: true,
    tooltip: "Passenger Name Record (PNR)",
  },
  {
    key: "ticket.dateOfJourney",
    label: "Journey Date",
    sortable: true,
    tooltip: "Date of the journey",
  },
  {
    key: "amountPerSeat",
    label: "Amount/Seat",
    sortable: true,
    tooltip: "Amount per seat",
    valueGetter: (params) => {
      const salePrice = params.data?.ticket?.salePrice;
      return salePrice !== undefined && salePrice !== null
        ? `₹${Number(salePrice).toLocaleString()}`
        : "-";
    },
  },
  {
    key: "totalAmount",
    label: "Total Cost",
    sortable: true,
    tooltip: "Total cost for the booking",
    valueGetter: (params) => `₹${params.data?.totalAmount?.toLocaleString()}`,
  },
  {
    key: "bookingStatus",
    label: "Booking Status",
    sortable: true,
    isAction: true,
    tooltip: "Status of the booking",
  },
  {
    key: "paymentStatus",
    label: "Payment Status",
    sortable: true,
    tooltip: "Status of the payment",
  },
  {
    key: "paymentMethod",
    label: "Payment Method",
    sortable: true,
    tooltip: "Method of payment",
  },
  {
    key: "bookingDate",
    label: "Booking Date",
    sortable: true,
    tooltip: "Date when the booking was made",
  },
];

export const USER_COLUMNS = [
  { key: "name", label: "Name", sortable: true, tooltip: "User's full name" },
  {
    key: "email",
    label: "Email",
    sortable: true,
    tooltip: "User's email address",
  },
  {
    key: "totalPaid",
    label: "Total Paid",
    sortable: true,
    tooltip: "Total amount paid by customers",
    formatter: "currency",
  },
  {
    key: "totalDue",
    label: "Due Amount",
    sortable: true,
    tooltip: "Total due amount from customers",
    formatter: "currency",
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    tooltip: "Approval status (pending, approved, rejected)",
    formatter: "statusBadge",
  },
  {
    key: "actions",
    label: "Actions",
    isAction: true,
    tooltip: "Approve or reject user",
    className: `px-2 py-1 text-xs rounded font-semibold bg-blue-100 text-blue-800`,
  },
];

export const AUDITLOG_COLUMNS = [
  {
    key: "createdAt",
    label: "Date",
    sortable: true,
    tooltip: "Date of the audit log entry",
  },
  {
    key: "changedBy",
    label: "Admin Email",
    sortable: true,
    tooltip: "Email of the admin who made the change",
  },
  {
    key: "person.email",
    label: "Email",
    sortable: true,
    tooltip: "Email of the person affected",
  },
  {
    key: "action",
    label: "Action",
    sortable: true,
    tooltip: "Type of action performed",
  },
  {
    key: "oldData",
    label: "Old Data",
    tooltip: "Previous data before the change",
  },
  {
    key: "newData",
    label: "New Data",
    tooltip: "New data after the change",
  },
];

export const ALL_AUDITLOG_COLUMNS = [
  {
    key: "createdAt",
    label: "Date",
    sortable: true,
    tooltip: "Date of the audit log entry",
    formatter: "datetime",
  },
  {
    key: "type",
    label: "Type",
    sortable: true,
    tooltip: "Type of entity affected",
  },
  {
    key: "adminEmail",
    label: "Admin Email",
    sortable: true,
    tooltip: "Email of the admin who made the change",
  },
  {
    key: "action",
    label: "Action",
    sortable: true,
    tooltip: "Type of action performed",
  },
  {
    key: "entityName",
    label: "Entity",
    sortable: true,
    tooltip: "Name of the entity affected",
  },
  {
    key: "oldData",
    label: "Old Data",
    tooltip: "Previous data before the change",
  },
  {
    key: "newData",
    label: "New Data",
    tooltip: "New data after the change",
  },
];

export const TICKET_AUDITLOG_COLUMNS = [
  {
    key: "createdAt",
    label: "Date",
    sortable: true,
    tooltip: "Date of the audit log entry",
  },
  {
    key: "adminId.email",
    label: "Admin Email",
    sortable: true,
    tooltip: "Email of the admin who made the change",
  },
  {
    key: "ticket.PNR",
    label: "PNR",
    sortable: true,
    tooltip: "Passenger Name Record (PNR)",
  },
  {
    key: "action",
    label: "Action",
    sortable: true,
    tooltip: "Type of action performed",
  },
  {
    key: "oldData",
    label: "Old Data",
    tooltip: "Previous data before the change",
  },
  {
    key: "newData",
    label: "New Data",
    tooltip: "New data after the change",
  },
];

export const AIRLINE_AUDITLOG_COLUMNS = [
  {
    key: "createdAt",
    label: "Date",
    sortable: true,
    tooltip: "Date of the audit log entry",
  },
  {
    key: "adminId.email",
    label: "Admin Email",
    sortable: true,
    tooltip: "Email of the admin who made the change",
  },
  {
    key: "airline.name",
    label: "Airline Name",
    sortable: true,
    tooltip: "Name of the airline affected",
  },
  {
    key: "action",
    label: "Action",
    sortable: true,
    tooltip: "Type of action performed",
  },
  {
    key: "oldData",
    label: "Old Data",
    tooltip: "Previous data before the change",
  },
  {
    key: "newData",
    label: "New Data",
    tooltip: "New data after the change",
  },
];

export const LOCATION_AUDITLOG_COLUMNS = [
  {
    key: "createdAt",
    label: "Date",
    sortable: true,
    tooltip: "Date of the audit log entry",
  },
  {
    key: "adminId.email",
    label: "Admin Email",
    sortable: true,
    tooltip: "Email of the admin who made the change",
  },
  {
    key: "location.name",
    label: "Location Name",
    sortable: true,
    tooltip: "Name of the location affected",
  },
  {
    key: "action",
    label: "Action",
    sortable: true,
    tooltip: "Type of action performed",
  },
  {
    key: "oldData",
    label: "Old Data",
    tooltip: "Previous data before the change",
  },
  {
    key: "newData",
    label: "New Data",
    tooltip: "New data after the change",
  },
];

export const SEARCH_HISTORY_COLUMNS = [
  {
    key: "searchTime",
    label: "Search Date",
    sortable: true,
    tooltip: "Date and time when the search was performed",
    formatter: "datetime",
  },
  {
    key: "user",
    label: "Agent",
    sortable: false,
    tooltip: "Agent (user) who performed the search",
    formatter: (row) =>
      row.user?.name || row.user?.username || row.user?.email || "-",
  },
  {
    key: "airline",
    label: "Airline",
    sortable: true,
    tooltip: "Airline searched for",
  },
  {
    key: "departureLocation",
    label: "Departure",
    sortable: true,
    tooltip: "Departure location searched for",
  },
  {
    key: "arrivalLocation",
    label: "Arrival",
    sortable: true,
    tooltip: "Arrival location searched for",
  },
  {
    key: "journeyDate",
    label: "Journey Date",
    sortable: true,
    tooltip: "Date of journey searched for",
    formatter: "date",
  },
];

export const TICKET_COLUMNS = [
  {
    key: "PNR",
    label: "PNR",
    sortable: true,
    tooltip: "Passenger Name Record (PNR)",
  },
  {
    key: "airline",
    label: "Airline",
    sortable: true,
    tooltip: "Airline for the ticket",
  },
  {
    key: "flightNumber",
    label: "Flight Number",
    sortable: true,
    tooltip: "Flight number",
  },
  {
    key: "journeyType",
    label: "Journey Type",
    sortable: true,
    tooltip: "Domestic or International",
  },
  {
    key: "classType",
    label: "Class",
    sortable: true,
    tooltip:
      "Ticket class (Economy, Premium Economy, Business Class, First Class)",
  },
  {
    key: "departureLocation",
    label: "departure",
    sortable: true,
    tooltip: "Departure location",
  },
  {
    key: "arrivalLocation",
    label: "arrival",
    sortable: true,
    tooltip: "Arrival location",
  },
  {
    key: "dateOfJourney",
    label: "Journey Date",
    sortable: true,
    formatter: "date",
    tooltip: "Date of the journey",
  },
  {
    key: "departureTime",
    label: "Departure",
    sortable: true,
    tooltip: "Departure time",
  },
  {
    key: "arrivalTime",
    label: "Arrival",
    sortable: true,
    tooltip: "Arrival time",
  },
  {
    key: "totalSeats",
    label: "Total Seats",
    sortable: true,
    tooltip: "Total number of seats",
  },
  {
    key: "availableSeats",
    label: "Available Seats",
    sortable: true,
    tooltip: "Number of available seats",
  },
  {
    key: "seatsSold",
    label: "Seats Sold",
    sortable: true,
    tooltip: "Number of seats sold (total - available)",
  },
  {
    key: "purchasePrice",
    label: "Purchase Price",
    sortable: true,
    tooltip: "Purchase price per seat",
  },
  {
    key: "totalPrice",
    label: "Total Price",
    sortable: true,
    tooltip: "Total price for all seats",
  },
  {
    key: "advPaidAmount",
    label: "Advance Paid",
    sortable: true,
    tooltip: "Advance amount paid",
  },
  {
    key: "outstanding",
    label: "Outstanding",
    sortable: true,
    tooltip: "Outstanding amount",
  },
  {
    key: "dateOfNameSubmission",
    label: "Name Submission",
    sortable: true,
    formatter: "datetime",
    tooltip: "Date of name submission",
  },
  {
    key: "outstandingDate",
    label: "Outstanding Date",
    sortable: true,
    formatter: "datetime",
    tooltip: "Date when outstanding is due",
  },
  {
    key: "salePrice",
    label: "Sale Price",
    sortable: true,
    tooltip: "Sale price per seat",
  },
  // {
  //   key: "release",
  //   label: "release",
  //   sortable: true,
  //   tooltip: "Release status",
  // },
  {
    key: "actions",
    label: "Actions",
    isAction: true,
    tooltip: "Edit or delete ticket",
  },
];

export const BOOKING_REQUEST_AUDITLOG_COLUMNS = [
  {
    key: "createdAt",
    label: "Date",
    sortable: true,
    tooltip: "Date of the audit log entry",
    formatter: "datetime",
  },
  {
    key: "action",
    label: "Action",
    sortable: true,
    tooltip: "Type of action performed",
  },
  {
    key: "adminId.email",
    label: "Admin Email",
    sortable: true,
    tooltip: "Email of the admin who made the change",
  },
  {
    key: "booking",
    label: "Booking ID",
    sortable: true,
    tooltip: "Booking ID",
  },

  {
    key: "changes.oldStatus",
    label: "Old Status",
    tooltip: "Previous booking status",
  },
  {
    key: "changes.newStatus",
    label: "New Status",
    tooltip: "New booking status",
  },
  {
    key: "changes.oldPaymentStatus",
    label: "Old Payment Status",
    tooltip: "Previous payment status",
  },
  {
    key: "changes.newPaymentStatus",
    label: "New Payment Status",
    tooltip: "New payment status",
  },
  {
    key: "changes.oldPaymentMethod",
    label: "Old Payment Method",
    tooltip: "Previous payment method",
  },
  {
    key: "changes.newPaymentMethod",
    label: "New Payment Method",
    tooltip: "New payment method",
  },
];

export const PASSENGER_COLUMNS = [
  {
    key: "rowNumber",
    label: "Row Number",
    tooltip: "Row number",
    sortable: true,
    flex: TABLE_CONFIG.FLEX,
    minWidth: TABLE_CONFIG.MIN_COLUMN_WIDTH,
    valueGetter: (params) => (params.node ? params.node.rowIndex + 1 : ""),
    width: 60,
  },
  {
    key: "passengerName",
    label: "Passenger Name",
    tooltip: "Full name of the passenger",
    sortable: true,
    flex: TABLE_CONFIG.FLEX,
    minWidth: TABLE_CONFIG.MIN_COLUMN_WIDTH,
    valueGetter: (params) =>
      params.data
        ? [params.data.honorific, params.data.firstName, params.data.lastName]
            .filter(Boolean)
            .join(" ")
        : "",
    cellRenderer: (params) => {
      const name = params.value;
      const onEditClick = params.context?.onEditClick;
      return (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <span>{name}</span>
          {typeof onEditClick === "function" && (
            <span
              style={{ cursor: "pointer", marginLeft: 8 }}
              title="Edit Name"
              onClick={(e) => {
                e.stopPropagation();
                const formData = new FormData();
                formData.set("id", params.data._id);
                onEditClick(formData);
              }}
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
              </svg>
            </span>
          )}
        </span>
      );
    },
  },
  {
    key: "type",
    label: "type",
    tooltip: "type",
    sortable: true,
    flex: TABLE_CONFIG.FLEX,
    minWidth: TABLE_CONFIG.MIN_COLUMN_WIDTH,
    valueGetter: (params) =>
      params.data && params.data.type ? params.data.type : "-",
  },
  {
    key: "passengerDOB",
    label: "Passenger DOB",
    tooltip: "Date of birth",
    sortable: true,
    flex: TABLE_CONFIG.FLEX,
    minWidth: TABLE_CONFIG.MIN_COLUMN_WIDTH,
    valueGetter: (params) =>
      params.data && params.data.dob
        ? new Date(params.data.dob).toLocaleDateString()
        : "-",
  },

  {
    key: "passengerPassport",
    label: "Passenger Passport",
    tooltip: "Passport number",
    sortable: true,
    flex: TABLE_CONFIG.FLEX,
    minWidth: TABLE_CONFIG.MIN_COLUMN_WIDTH,
    valueGetter: (params) =>
      params.data && params.data.passportNumber
        ? params.data.passportNumber
        : "-",
  },

  {
    key: "passengerNationality",
    label: "Passenger Nationality",
    tooltip: "Nationality of the passenger",
    sortable: true,
    flex: TABLE_CONFIG.FLEX,
    minWidth: TABLE_CONFIG.MIN_COLUMN_WIDTH,
    valueGetter: (params) =>
      params.data && params.data.nationality ? params.data.nationality : "-",
  },
];

export const PASSENGER_NAME_EDIT_AUDITLOG_COLUMNS = [
  {
    key: "createdAt",
    label: "Date",
    sortable: true,
    tooltip: "Date of the audit log entry",
    formatter: "datetime",
  },
  {
    key: "adminName",
    label: "Admin Name",
    sortable: true,
    tooltip: "Name of the admin who made the change",
  },
  {
    key: "bookingReference",
    label: "Booking Ref",
    sortable: true,
    tooltip: "Booking reference number",
  },
  {
    key: "PNR",
    label: "PNR",
    sortable: true,
    tooltip: "Passenger Name Record (PNR)",
  },
  {
    key: "remarks",
    label: "Remarks",
    sortable: true,
    tooltip: "Edit remarks",
  },
  {
    key: "passengerNameOld",
    label: "Old Name",
    sortable: true,
    tooltip: "Old passenger name",
  },
  {
    key: "passengerNameNew",
    label: "New Name",
    sortable: true,
    tooltip: "New passenger name",
  },
];

export const LEDGER_BOOKING_COLUMNS = [
  { key: "pnr", label: "PNR", sortable: true, tooltip: "PNR" },
  {
    key: "bookingRef",
    label: "Booking REF",
    sortable: true,
    tooltip: "Booking Reference",
  },
  { key: "agent", label: "Agent Name", sortable: true, tooltip: "Agent Name" },
  {
    key: "passengerList",
    label: "Passenger List",
    sortable: false,
    tooltip: "Passenger List",
  
    cellRenderer: ({ value }) => {
      if (Array.isArray(value) && value.length > 0) {
        return (
          <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
            {value.map((name, idx) => (
              <li key={idx} style={{ margin: 0, padding: 0 }}>
                {name}
              </li>
            ))}
          </ul>
        );
      }
      return "-";
    },
  },

  { key: "paid", label: "Paid", sortable: true, tooltip: "Paid Amount" },
  {
    key: "due",
    label: "Due",
    sortable: true,
    tooltip: "Due Amount",
    cellRenderer: ({ value }) => {
      const num = Number(String(value).replace(/[^\d.-]/g, ""));
      if (num > 0) {
        return (
          <span className="bg-red-100 text-red-700 px-2 py-1 text-xs rounded font-semibold">
            {value}
          </span>
        );
      }
      return <span>{value}</span>;
    },
  },
  
];

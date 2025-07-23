// Ledger-related constants
export const LEDGER_TYPES = {
  AIRLINE: "airline",
  CUSTOMER: "customer",
};

export const LEDGER_STATUS = {
  ACTIVE: "Active",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

export const PAYMENT_METHODS = {
  CASH: "Cash",
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  UPI: "UPI",
  ONLINE: "Online",
  OFFLINE: "Offline",
  OTHER: "Other",
  NA: "N/A",
};

export const CUSTOMER_LEDGER_COLUMNS = [
  {
    key: "ticketPNR",
    label: "PNR",
    sortable: true,
    valueGetter: (params) => params.data.ticketPNR || "N/A",
  },
  {
    key: "user.name",
    label: "Agents",
    sortable: true,
    valueGetter: (params) =>
      params.data.user && params.data.user.name ? params.data.user.name : "N/A",
  },
  {
    key: "airline",
    label: "Airline",
    sortable: true,
    valueGetter: (params) =>
      params.data.airline && params.data.airline.name
        ? params.data.airline.name
        : "N/A",
  },
  {
    key: "bookedDate",
    label: "Booked Date",
    sortable: true,
    valueGetter: (params) =>
      params.data.bookedDate ? formatDate(params.data.bookedDate) : "N/A",
  },
  {
    key: "dateOfJourney",
    label: "DOJ",
    sortable: true,
    valueGetter: (params) =>
      params.data.dateOfJourney ? formatDate(params.data.dateOfJourney) : "N/A",
  },
  {
    key: "totalPayment",
    label: "Total Payment",
    sortable: true,
    valueGetter: (params) =>
      typeof params.data.totalPayment === "number"
        ? formatCurrency(params.data.totalPayment)
        : "₹0.00",
  },
  {
    key: "credit",
    label: "Credit",
    sortable: true,
    valueGetter: (params) =>
      typeof params.data.credit === "number"
        ? formatCurrency(params.data.credit)
        : "₹0.00",
  },
  {
    key: "due",
    label: "Due",
    sortable: true,
    valueGetter: (params) =>
      typeof params.data.due === "number"
        ? formatCurrency(params.data.due)
        : "₹0.00",
  },
];

export const SUMMARY_CARD_LABELS = {
  TOTAL_ENTRIES: "Total Entries",
  TOTAL_PAYMENT: "Total Payment",
  TOTAL_REVENUE: "Total Revenue",
  OUTSTANDING: "Outstanding",
  DUE_AMOUNT: "Due Amount",
  ACTIVE_ENTRIES: "Active Entries",
  PAID_ENTRIES: "Paid Entries",
  PROFIT: "Profit",
};

export const TAB_LABELS = {
  AIRLINE: "Airline Ledger",
  CUSTOMER: "Agents Ledger",
};

export const TABLE_TITLES = {
  AIRLINE_LEDGER: "Airline Ledger Entries",
  CUSTOMER_LEDGER: "Agents Ledger Entries",
};

export const FILTER_LABELS = {
  CUSTOMER: "Customer",
  PNR: "PNR",
  START_DATE: "Start Date",
  END_DATE: "End Date",
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN");
};

export const AIRLINE_LEDGER_COLUMNS = [
  {
    key: "airline",
    label: "Airline",
    sortable: true,
    valueGetter: (params) => params.data.airline?.name || "N/A",
  },
  {
    key: "PNR",
    label: "PNR",
    sortable: true,
    valueGetter: (params) => params.data.PNR || "N/A",
  },
  {
    key: "totalPayment",
    label: "Total Payment",
    sortable: true,
    valueGetter: (params) => formatCurrency(params.data.totalPayment ?? 0),
  },
  {
    key: "advance",
    label: "Advance",
    sortable: true,
    valueGetter: (params) => formatCurrency(params.data.advance ?? 0),
  },
  {
    key: "outstanding",
    label: "Outstanding",
    sortable: true,
    valueGetter: (params) => formatCurrency(params.data.outstanding ?? 0),
  },
  {
    key: "outstandingDate",
    label: "Outstanding Date",
    sortable: true,
    valueGetter: (params) => {
      const dateStr = params.data.outstandingDate;
      if (!dateStr) return <span>N/A</span>;
      const date = new Date(dateStr);
      const now = new Date();
      const diffDays = Math.abs(
        Math.floor((now - date) / (1000 * 60 * 60 * 24))
      );
      const formatted = formatDate(dateStr);
      if (diffDays <= 30) {
        return (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
            {formatted}
          </span>
        );
      }
      return <span>{formatted}</span>;
    },
  },
  {
    key: "customerPaidAmount",
    label: "Customer Paid Amount",
    sortable: true,
    valueGetter: (params) =>
      formatCurrency(params.data.customerPaidAmount ?? 0),
    cellRenderer: (params) => {
      const paid = params.data.customerPaidAmount ?? 0;
      const total = params.data.totalPayment ?? 0;
      const formatted = formatCurrency(paid);
      if (paid > total) {
        return (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
            {formatted}
          </span>
        );
      } else if (paid < total) {
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
            {formatted}
          </span>
        );
      } else {
        return <span>{formatted}</span>;
      }
    },
  },
  {
    key: "customerOutstanding",
    label: "Customer Outstanding",
    sortable: true,
    valueGetter: (params) =>
      formatCurrency(params.data.customerOutstanding ?? 0),
    cellRenderer: (params) => {
      const outstanding = params.data.customerOutstanding ?? 0;
      const formatted = formatCurrency(outstanding);
      if (outstanding > 0) {
        return (
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
            {formatted}
          </span>
        );
      } else {
        return <span>{formatted}</span>;
      }
    },
  },
  // Download column for PDF export
  {
    key: "download",
    label: "Download",
    isDownload: true,
    sortable: false,
    tooltip: "Download",
    pinned: "right",
    width: 50,
  },
];

export const OUTSTANDING_PAYMENTS_COLUMNS = [
  {
    key: "date",
    label: "Date & Time",
    sortable: true,
    valueGetter: (params) =>
      params.data.date
        ? new Date(params.data.date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "N/A",
  },
  {
    key: "transactionId",
    label: "Transaction ID",
    sortable: true,
    valueGetter: (params) => params.data.transactionId || "N/A",
  },
  {
    key: "amountPaid",
    label: "Amount Paid",
    sortable: true,
    valueGetter: (params) => `₹${params.data.amountPaid}` || "N/A",
  },
  {
    key: "totalPaidSoFar",
    label: "Total Paid So Far",
    sortable: false,
    valueGetter: (params) => `₹${params.data.totalPaidSoFar}`,
  },
  {
    key: "balanceAmount",
    label: "Balance Amount",
    sortable: false,
    valueGetter: (params) => `₹${params.data.balanceAmount}`,
  },
];

// Format date for display
export const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-IN");
};

// Format date and time for display
export const formatDateTime = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-IN", {
    hourCycle: "h23",
    hour12: false,
  });
};

// Validate PNR format
export const validatePNR = (pnr) => {
  if (!pnr) return false;
  const pnrRegex = /^[A-Z0-9]{6}$/;
  return pnrRegex.test(pnr.toUpperCase());
};

// Generate unique PNR
export const generatePNR = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate payment amounts
export const validatePaymentAmounts = (
  totalPayment,
  paidAmount,
  type = "airline"
) => {
  const total = parseFloat(totalPayment);
  const paid = parseFloat(paidAmount) || 0;

  if (isNaN(total) || total < 0) {
    return { valid: false, message: "Total payment must be a positive number" };
  }

  if (paid < 0) {
    return {
      valid: false,
      message: `${
        type === "airline" ? "Advance" : "Credit"
      } amount cannot be negative`,
    };
  }

  if (paid > total) {
    return {
      valid: false,
      message: `${
        type === "airline" ? "Advance" : "Credit"
      } amount cannot exceed total payment`,
    };
  }

  return { valid: true };
};

export const calculateSummary = (ledgers, type = "airline") => {
  const summary = {
    totalEntries: ledgers.length,
    totalPayment: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    activeEntries: 0,
    paidEntries: 0,
  };

  ledgers.forEach((ledger) => {
    const total = parseFloat(ledger.totalPayment) || 0;
    const paid =
      type === "airline"
        ? parseFloat(ledger.advance) || 0
        : parseFloat(ledger.credit) || 0;
    const outstanding =
      type === "airline"
        ? parseFloat(ledger.outstanding) || 0
        : parseFloat(ledger.due) || 0;

    summary.totalPayment += total;
    summary.totalPaid += paid;
    summary.totalOutstanding += outstanding;

    if (outstanding > 0) {
      summary.activeEntries++;
    } else {
      summary.paidEntries++;
    }
  });

  return summary;
};

// Group ledgers by airline or customer
export const groupLedgersByField = (ledgers, field) => {
  const grouped = {};

  ledgers.forEach((ledger) => {
    const key = ledger[field];
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(ledger);
  });

  return grouped;
};

// Filter ledgers by criteria
export const filterLedgers = (ledgers, filters, type = "airline") => {
  return ledgers.filter((ledger) => {
    // Airline filter
    if (
      filters.airline &&
      !ledger.airline?.name
        ?.toLowerCase()
        .includes(filters.airline.toLowerCase())
    ) {
      return false;
    }

    // Customer filter
    if (
      type === "customer" &&
      filters.customer &&
      !ledger.user?.name?.toLowerCase().includes(filters.customer.toLowerCase())
    ) {
      return false;
    }

    // PNR filter
    if (
      filters.pnr &&
      !ledger.PNR.toLowerCase().includes(filters.pnr.toLowerCase())
    ) {
      return false;
    }

    // Date range filter
    if (filters.startDate) {
      const ledgerDate = new Date(ledger.createdAt);
      const startDate = new Date(filters.startDate);
      if (ledgerDate < startDate) {
        return false;
      }
    }

    if (filters.endDate) {
      const ledgerDate = new Date(ledger.createdAt);
      const endDate = new Date(filters.endDate);
      if (ledgerDate > endDate) {
        return false;
      }
    }

    return true;
  });
};

// Sort ledgers by field
export const sortLedgers = (
  ledgers,
  sortBy = "createdAt",
  sortOrder = "desc"
) => {
  return [...ledgers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle date fields
    if (
      sortBy === "createdAt" ||
      sortBy === "dueDate" ||
      sortBy === "dateOfJourney" ||
      sortBy === "bookedDate"
    ) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // Handle numeric fields
    if (
      sortBy === "totalPayment" ||
      sortBy === "advance" ||
      sortBy === "outstanding" ||
      sortBy === "credit" ||
      sortBy === "due"
    ) {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

// Export ledger data to CSV format
export const exportToCSV = (ledgers, type = "airline") => {
  const headers =
    type === "airline"
      ? [
          "PNR",
          "Airline",
          "Total Payment",
          "Advance",
          "Outstanding",
          "Due Date",
          "Notes",
        ]
      : [
          "PNR",
          "Customer",
          "Airline",
          "Booked Date",
          "DOJ",
          "Total Payment",
          "Credit",
          "Due",
          "Payment Method",
          "Notes",
        ];

  const csvContent = [
    headers.join(","),
    ...ledgers.map((ledger) => {
      const row =
        type === "airline"
          ? [
              ledger.PNR,
              ledger.airline?.name || "N/A",
              ledger.totalPayment,
              ledger.advance,
              ledger.outstanding,
              formatDate(ledger.dueDate),
              ledger.notes || "",
            ]
          : [
              ledger.PNR,
              ledger.user?.name || "",
              ledger.airline?.name || "N/A",
              formatDate(ledger.bookedDate),
              formatDate(ledger.dateOfJourney),
              ledger.totalPayment,
              ledger.credit,
              ledger.due,
              ledger.paymentMethod,
              ledger.notes || "",
            ];

      return row.map((field) => `"${field}"`).join(",");
    }),
  ].join("\n");

  return csvContent;
};

// Get payment method icon
export const getPaymentMethodIcon = (method) => {
  const icons = {
    Cash: "💵",
    Card: "💳",
    "Bank Transfer": "🏦",
    UPI: "📱",
    Other: "💰",
    NA: "❌",
  };

  return icons[method] || icons.Other;
};

// Ledger formatting utilities
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
};

export const formatLedgerCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount || 0);
};

export const formatLedgerDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN");
};

export const calculateOutstandingAmount = (totalPayment, advance) => {
  const total = parseFloat(totalPayment) || 0;
  const advanceAmount = parseFloat(advance) || 0;
  return Math.max(0, total - advanceAmount);
};

export const calculateDueAmount = (totalPayment, credit) => {
  const total = parseFloat(totalPayment) || 0;
  const creditAmount = parseFloat(credit) || 0;
  return Math.max(0, total - creditAmount);
};

export const buildLedgerFilters = (filters, type = "airline") => {
  const params = new URLSearchParams();

  if (filters.airline) params.append("airline", filters.airline);
  if (type === "customer" && filters.customer)
    params.append("customer", filters.customer);
  if (filters.pnr) params.append("pnr", filters.pnr);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);

  return params;
};

export const getLedgerEndpoint = (type, filters) => {
  const params = buildLedgerFilters(filters, type);
  return `/api/v1/${type}-ledger?${params}`;
};

export const getSummaryEndpoint = (type, filters) => {
  const params = new URLSearchParams();
  params.append("type", type);

  if (filters.airline) params.append("airline", filters.airline);
  if (type === "customer" && filters.customer)
    params.append("customer", filters.customer);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);

  return `/api/v1/ledger-summary?${params}`;
};

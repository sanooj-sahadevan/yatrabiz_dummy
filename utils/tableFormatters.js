// Table-specific formatting utilities
import {
  formatDate,
  formatPrice,
  getStatusColor,
  formatDateTime,
} from "@/utils/formatters";

// Helper function to get nested object values
export const getNestedValue = (obj, path) => {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};

// Format airline information for table display
export const formatAirlineInfo = (airline) => {
  if (!airline) return "N/A";
  if (typeof airline === "string") return airline;
  if (typeof airline === "object" && airline.name) {
    return airline.name;
  }
  return "N/A";
};

// Extended status badge function for tables
export const getStatusBadge = (status, type = "booking") => {
  const baseClasses = "inline-block px-2 py-1 rounded text-xs font-medium";

  if (type === "booking") {
    return `${baseClasses} ${getStatusColor(status)}`;
  } else if (type === "payment") {
    switch (status) {
      case "Paid":
        return `${baseClasses} bg-green-100 text-black`;
      case "Pending":
        return `${baseClasses} bg-yellow-100 text-black`;
      case "Failed":
      case "Unpaid":
        return `${baseClasses} bg-red-100 text-black`;
      case "Refunded":
        return `${baseClasses} bg-purple-100 text-black`;
      default:
        return `${baseClasses} bg-gray-100 text-black`;
    }
  } else if (type === "ledger") {
    switch (status) {
      case "Active":
        return `${baseClasses} bg-blue-100 text-black`;
      case "Paid":
        return `${baseClasses} bg-green-100 text-black`;
      case "Overdue":
        return `${baseClasses} bg-red-100 text-black`;
      case "Cancelled":
        return `${baseClasses} bg-gray-100 text-black`;
      default:
        return `${baseClasses} bg-gray-100 text-black`;
    }
  }

  return `${baseClasses} bg-gray-100 text-black`;
};

// Format currency for table display
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "N/A";
  return formatPrice(amount);
};

// Format date for table display
export const formatTableDate = (dateString) => {
  return formatDate(dateString, "default");
};

// Format datetime for table display
export const formatTableDateTime = (dateTimeString) => {
  return formatDateTime(dateTimeString, "short");
};

// Format user information for table display
export const formatUserInfo = (value) => {
  if (value && value.name && value.email) {
    return `${value.name} (${value.email})`;
  }
  return value?.name || value?.email || "N/A";
};

// Format admin name for table display
export const formatAdminName = (adminData) => {
  if (adminData && adminData.name) {
    return adminData.name;
  }
  return "N/A";
};

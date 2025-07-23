export const getBookingStatusDisplay = (
  bookingStatus,
  showApproveReject = false
) => {
  switch (bookingStatus) {
    case "Confirmed":
      return {
        displayText: "Confirmed",
        className:
          "inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800",
        shouldShowButtons: false,
        color: "green",
      };

    case "Partially Confirmed":
      return {
        displayText: "Partially Confirmed",
        className:
          "inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800",
        shouldShowButtons: false,
        color: "blue",
      };

    case "Cancelled":
      return {
        displayText: "Rejected",
        className:
          "inline-block px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800",
        shouldShowButtons: false,
        color: "red",
      };

    case "Pending":
      return {
        displayText: "Pending",
        className:
          "inline-block px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800",
        shouldShowButtons: showApproveReject,
        color: "yellow",
      };

    case "Completed":
      return {
        displayText: "Completed",
        className:
          "inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800",
        shouldShowButtons: false,
        color: "blue",
      };

    default:
      return {
        displayText: bookingStatus || "Unknown",
        className:
          "inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800",
        shouldShowButtons: false,
        color: "gray",
      };
  }
};

export const getPaymentStatusDisplay = (
  paymentStatus,
  bookingStatus,
  onPendingClick = null
) => {
  // If booking is cancelled, always show "Failed"
  if (bookingStatus === "Cancelled") {
    return {
      displayText: "Failed",
      className:
        "inline-block px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800",
      color: "red",
      isClickable: false,
    };
  }

  if (
    paymentStatus === "Pending" &&
    bookingStatus === "Confirmed" &&
    typeof onPendingClick === "function"
  ) {
    return {
      displayText: "Pending",
      className:
        "inline-block px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-black cursor-pointer border border-black shadow-md transition-all duration-150 hover:bg-yellow-200 hover:scale-105 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-black",
      style: {
        backgroundColor: "#fef3c7",
        color: "#000000",
        padding: "2px 6px",
        borderRadius: "0.25rem",
        fontSize: "0.70rem",
        fontWeight: "500",
        cursor: "pointer",
        border: "1px solid #000",
        boxShadow: "0 2px 3px rgba(55, 51, 51, 0.08)",
        transition: "all 0.15s",
        outline: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
      },
      color: "yellow",
      isClickable: true,
      onClick: onPendingClick,
    };
  }

  // If booking is confirmed, show payment status in green
  if (bookingStatus === "Confirmed") {
    return {
      displayText: paymentStatus,
      className:
        "inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800",
      color: "green",
      isClickable: false,
    };
  }

  // For other booking statuses, use default payment status styling
  switch (paymentStatus) {
    case "Paid":
      return {
        displayText: "Paid",
        className:
          "inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800",
        color: "green",
        isClickable: false,
      };

    case "Partially Paid":
      return {
        displayText: "Partially Paid",
        className:
          "inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800",
        color: "blue",
        isClickable: false,
      };

    case "Pending":
      return {
        displayText: "N/A",
        isClickable: false,
      };

    case "Failed":
    case "Unpaid":
      return {
        displayText: paymentStatus,
        className:
          "inline-block px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800",
        color: "red",
        isClickable: false,
      };

    case "Refunded":
      return {
        displayText: "Refunded",
        className:
          "inline-block px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800",
        color: "purple",
        isClickable: false,
      };

    default:
      return {
        displayText: paymentStatus || "N/A",
        className:
          "inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800",
        color: "gray",
        isClickable: false,
      };
  }
};

export const getPaymentMethodDisplay = (paymentMethod, bookingStatus) => {
  if (bookingStatus === "Cancelled") {
    return {
      displayText: "Failed",
      className:
        "inline-block px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800",
      color: "red",
    };
  }

  if (
    bookingStatus === "Confirmed" &&
    (paymentMethod === "Online" || paymentMethod === "Offline")
  ) {
    return {
      displayText: paymentMethod,
      className:
        "inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800",
      color: "green",
    };
  }

  return {
    displayText: paymentMethod || "N/A",
    className: "",
    color: "default",
  };
};

export const getPaymentStatusValue = (paymentStatus, bookingStatus) => {
  if (bookingStatus === "Cancelled") {
    return "Failed";
  }
  return paymentStatus;
};

export const getPaymentMethodValue = (paymentMethod, bookingStatus) => {
  if (bookingStatus === "Cancelled") {
    return "Failed";
  }
  return paymentMethod || "N/A";
};

export const shouldShowApproveRejectButtons = (
  bookingStatus,
  isSuperAdmin,
  tableContext
) => {
  return (
    bookingStatus === "Pending" &&
    isSuperAdmin &&
    tableContext === "bookingRequest"
  );
};

export const getBookingStatusInfo = (
  booking,
  isSuperAdmin = false,
  tableContext = ""
) => {
  const bookingStatusInfo = getBookingStatusDisplay(
    booking.bookingStatus,
    shouldShowApproveRejectButtons(
      booking.bookingStatus,
      isSuperAdmin,
      tableContext
    )
  );

  const paymentStatusInfo = getPaymentStatusDisplay(
    booking.paymentStatus,
    booking.bookingStatus
  );
  const paymentMethodInfo = getPaymentMethodDisplay(
    booking.paymentMethod,
    booking.bookingStatus
  );

  return {
    bookingStatus: bookingStatusInfo,
    paymentStatus: paymentStatusInfo,
    paymentMethod: paymentMethodInfo,
    shouldShowButtons: bookingStatusInfo.shouldShowButtons,
  };
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getBookingStatusDisplay,
    getPaymentStatusDisplay,
    getPaymentMethodDisplay,
    getPaymentStatusValue,
    getPaymentMethodValue,
    shouldShowApproveRejectButtons,
    getBookingStatusInfo,
  };
}

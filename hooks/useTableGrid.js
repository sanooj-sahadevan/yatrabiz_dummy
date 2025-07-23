import Link from "next/link";
import { toast } from "react-toastify";
import { useMemo, useCallback, useState } from "react";
import { exportBookingDetailsToExcel } from "@/utils/excelExportUtils";
import LoadingSpinner from "../components/admin/tableHeader/LoadingSpinner";
import {
  getNestedValue,
  formatTableDate,
  formatTableDateTime,
  formatCurrency,
  formatUserInfo,
  formatAdminName,
  getStatusBadge,
} from "@/utils/tableFormatters";
import {
  getPaymentStatusDisplay,
  getPaymentMethodDisplay,
  getPaymentStatusValue,
  getPaymentMethodValue,
  getBookingStatusDisplay,
  shouldShowApproveRejectButtons,
} from "@/utils/bookingStatusUtils";
import {
  TABLE_CONFIG,
  TABLE_CONTEXTS,
  ACTION_LABELS,
  LOADING_TEXTS,
  BUTTON_CLASSES,
} from "@/constants/tableConstants";

export const useTableGrid = ({
  columns,
  adminRole,
  tableContext,
  onEditClick,
  onDeleteClick,
  onPendingPaymentClick,
  actionLabels,
  loading,
  onNonBookableClick,
  showNonBookableAction,
}) => {
  const [api, setApi] = useState(null);
  const [searchText, setSearchText] = useState("");

  const isSuperAdmin = adminRole?.role === "super_admin";

  const getRowStyle = useCallback(
    (params) => {
      if (tableContext === TABLE_CONTEXTS.BOOKING_REQUEST) {
        const bookingStatus = params.data?.bookingStatus;
        if (bookingStatus === "Pending") {
          return {
            backgroundColor: "#e0f2fe",
            color: "#111827",
          };
        }
      }
      return {};
    },
    [tableContext]
  );

  const getRowClass = useCallback(
    (params) => {
      // Booking request context: highlight pending
      if (tableContext === TABLE_CONTEXTS.BOOKING_REQUEST) {
        const bookingStatus = params.data?.bookingStatus;
        if (bookingStatus === "Pending") {
          return "pending-row";
        }
      }
      // Agents table: highlight pending status
      if (
        columns.some(col => col.key === "status") &&
        params.data?.status &&
        params.data.status.toLowerCase() === "pending"
      ) {
        return "pending-row";
      }
      return "";
    },
    [tableContext, columns]
  );

  const agColumns = useMemo(
    () =>
      columns
        .filter((col) => {
          if (col.isAction && !isSuperAdmin) {
            return false;
          }
          if (
            adminRole?.role === "supplier" &&
            tableContext === TABLE_CONTEXTS.BOOKING_REQUEST
          ) {
            if (
              col.key === "bookingStatus" ||
              col.key === "paymentStatus" ||
              col.key === "paymentMethod"
            ) {
              return false;
            }
          }
          return true;
        })
        .map((col) => {
          if (col.isAction) {
            if (
              col.key === "bookingStatus" &&
              tableContext === TABLE_CONTEXTS.BOOKING_REQUEST
            ) {
              return {
                headerName: col.label,
                field: col.key,
                sortable: col.sortable ?? true,
                filter: true,
                resizable: true,
                flex: TABLE_CONFIG.FLEX,
                minWidth: TABLE_CONFIG.MIN_COLUMN_WIDTH,
                width: col.width,
                headerTooltip: col.headerTooltip || col.tooltip || col.label,
                cellRenderer: (params) => {
                  const rowData = params.data;
                  const showApproveReject =
                    isSuperAdmin &&
                    tableContext === TABLE_CONTEXTS.BOOKING_REQUEST;

                  const hasEdit = typeof onEditClick === "function";
                  const hasDelete = typeof onDeleteClick === "function";

                  return renderBookingStatusCell(
                    rowData,
                    showApproveReject,
                    hasEdit,
                    hasDelete,
                    onEditClick,
                    onDeleteClick,
                    loading
                  );
                },
              };
            }
            return {
              headerName: col.label,
              field: col.key,
              sortable: false,
              filter: false,
              resizable: true,
              width: TABLE_CONFIG.ACTION_COLUMN_WIDTH,
              pinned: "right",
              headerClass: "action-column-header",
              headerTooltip: col.headerTooltip || col.tooltip || col.label,
              cellRenderer: (params) => {
                const rowData = params.data;
                const hasEdit = typeof onEditClick === "function";
                const hasDelete = typeof onDeleteClick === "function";

                if (!hasEdit && !hasDelete && !showNonBookableAction)
                  return null;

                return renderActionCell(
                  rowData,
                  hasEdit,
                  hasDelete,
                  onEditClick,
                  onDeleteClick,
                  actionLabels,
                  loading,
                  onNonBookableClick,
                  showNonBookableAction
                );
              },
            };
          }
          return {
            headerName: col.label,
            field: col.key,
            sortable: col.sortable ?? true,
            filter: true,
            resizable: true,
            flex: TABLE_CONFIG.FLEX,
            minWidth: TABLE_CONFIG.MIN_COLUMN_WIDTH,
            width: col.width,
            headerTooltip: col.headerTooltip || col.tooltip || col.label,
            pinned: col.pinned,
            valueGetter: (params) => {
              if (col.formatter === "currency") {
                return formatCurrency(getNestedValue(params.data, col.key));
              }
              if (col.valueGetter) {
                return col.valueGetter(params);
              }

              const value = getNestedValue(params.data, col.key);
              if (col.key === "paymentStatus") {
                return getPaymentStatusValue(value, params.data.bookingStatus);
              }

              if (col.key === "paymentMethod") {
                return getPaymentMethodValue(value, params.data.bookingStatus);
              }
              if (
                col.key === "departureLocation" ||
                col.key === "arrivalLocation"
              ) {
                if (
                  value &&
                  typeof value === "object" &&
                  value.name &&
                  value.code
                ) {
                  return `${value.name} (${value.code})`;
                }
                return value || "-";
              }
              if (col.key === "airline" || col.key === "ticket.airline") {
                if (value && typeof value === "object" && value.name) {
                  return value.name;
                }
                return value || "-";
              }

              if (
                col.key.includes("date") ||
                col.key.includes("Date") ||
                col.key === "createdAt"
              ) {
                if (col.formatter === "date") {
                  return formatTableDate(value);
                }
                if (
                  col.formatter === "datetime" ||
                  col.key === "dateOfNameSubmission" ||
                  col.key === "outstandingDate" ||
                  col.key === "createdAt"
                ) {
                  return formatTableDateTime(value);
                }
              }

              if (
                col.key.includes("amount") ||
                col.key.includes("Amount") ||
                col.key.includes("price") ||
                col.key.includes("Price")
              ) {
                return formatCurrency(value);
              }

              if (col.key === "user") {
                return formatUserInfo(value);
              }

              if (col.key === "AdminName") {
                return formatAdminName(params.data.adminId);
              }

              if (col.key === "passengerAdminName") {
                return params.data.passengerAdminName || "N/A";
              }

              if (tableContext === TABLE_CONTEXTS.TICKET_AUDIT_LOG) {
                if (col.key === "oldData") {
                  const action = params.data.action;
                  if (action !== "UPDATE") return "-";
                  const changes = params.data.changes;
                  let result = "-";
                  if (params.data.type === "Admin") {
                    result =
                      changes?.name?.from ??
                      changes?.email?.from ??
                      changes?.role?.from ??
                      "-";
                  } else if (params.data.type === "Ticket") {
                    result =
                      changes?.PNR?.from ??
                      changes?.airline?.from ??
                      changes?.SCC?.from ??
                      "-";
                  } else if (params.data.type === "Airline") {
                    result = changes?.name?.from ?? changes?.code?.from ?? "-";
                  } else if (params.data.type === "Location") {
                    result = changes?.name?.from ?? changes?.code?.from ?? "-";
                  }
                  if (result && typeof result === "object") {
                    if (result.name && result.code) {
                      return `${result.name} (${result.code})`;
                    }
                    if (result.name) {
                      return result.name;
                    }
                    return JSON.stringify(result);
                  }

                  return result;
                }
                if (col.key === "newData") {
                  const action = params.data.action;
                  if (action !== "UPDATE") return "-";
                  const changes = params.data.changes;
                  let result = "-";

                  if (params.data.type === "Admin") {
                    result =
                      changes?.name?.to ??
                      changes?.email?.to ??
                      changes?.role?.to ??
                      "-";
                  } else if (params.data.type === "Ticket") {
                    result =
                      changes?.PNR?.to ??
                      changes?.airline?.to ??
                      changes?.SCC?.to ??
                      "-";
                  } else if (params.data.type === "Airline") {
                    result = changes?.name?.to ?? changes?.code?.to ?? "-";
                  } else if (params.data.type === "Location") {
                    result = changes?.name?.to ?? changes?.code?.to ?? "-";
                  }
                  if (result && typeof result === "object") {
                    if (result.name && result.code) {
                      return `${result.name} (${result.code})`;
                    }
                    if (result.name) {
                      return result.name;
                    }
                    return JSON.stringify(result);
                  }

                  return result;
                }
              }

              if (tableContext === TABLE_CONTEXTS.AIRLINE_AUDIT_LOG) {
                if (col.key === "oldData") {
                  const action = params.data.action;
                  if (action !== "UPDATE") return "-";
                  return (
                    params.data?.changes?.name?.from ??
                    params.data?.changes?.code?.from ??
                    "-"
                  );
                }
                if (col.key === "newData") {
                  const action = params.data.action;
                  if (action !== "UPDATE") return "-";
                  return (
                    params.data?.changes?.name?.to ??
                    params.data?.changes?.code?.to ??
                    "-"
                  );
                }
              }
              if (tableContext === TABLE_CONTEXTS.LOCATION_AUDIT_LOG) {
                if (col.key === "oldData") {
                  const action = params.data.action;
                  if (action !== "UPDATE") return "-";
                  return (
                    params.data?.changes?.name?.from ??
                    params.data?.changes?.code?.from ??
                    "-"
                  );
                }

                // Format audit log new data
                if (col.key === "newData") {
                  const action = params.data.action;
                  if (action !== "UPDATE") return "-";
                  return (
                    params.data?.changes?.name?.to ??
                    params.data?.changes?.code?.to ??
                    "-"
                  );
                }
              }

              if (
                tableContext === TABLE_CONTEXTS.AUDIT_LOG &&
                params.data.type
              ) {
                // Format admin email
                if (col.key === "adminEmail") {
                  return value || "-";
                }

                // Format entity name
                if (col.key === "entityName") {
                  return value || "-";
                }

                // Format audit log old data
                if (col.key === "oldData") {
                  const action = params.data.action;
                  if (action !== "UPDATE") return "-";

                  // Handle different audit types
                  const changes = params.data.changes;
                  let result = "-";

                  if (params.data.type === "Admin") {
                    result =
                      changes?.name?.from ??
                      changes?.email?.from ??
                      changes?.role?.from ??
                      "-";
                  } else if (params.data.type === "Ticket") {
                    result =
                      changes?.PNR?.from ??
                      changes?.airline?.from ??
                      changes?.SCC?.from ??
                      "-";
                  } else if (params.data.type === "Airline") {
                    result = changes?.name?.from ?? changes?.code?.from ?? "-";
                  } else if (params.data.type === "Location") {
                    result = changes?.name?.from ?? changes?.code?.from ?? "-";
                  }

                  // Ensure result is a string
                  if (result && typeof result === "object") {
                    if (result.name && result.code) {
                      return `${result.name} (${result.code})`;
                    }
                    if (result.name) {
                      return result.name;
                    }
                    return JSON.stringify(result);
                  }

                  return result;
                }

                // Format audit log new data
                if (col.key === "newData") {
                  const action = params.data.action;
                  if (action !== "UPDATE") return "-";

                  // Handle different audit types
                  const changes = params.data.changes;
                  let result = "-";

                  if (params.data.type === "Admin") {
                    result =
                      changes?.name?.to ??
                      changes?.email?.to ??
                      changes?.role?.to ??
                      "-";
                  } else if (params.data.type === "Ticket") {
                    result =
                      changes?.PNR?.to ??
                      changes?.airline?.to ??
                      changes?.SCC?.to ??
                      "-";
                  } else if (params.data.type === "Airline") {
                    result = changes?.name?.to ?? changes?.code?.to ?? "-";
                  } else if (params.data.type === "Location") {
                    result = changes?.name?.to ?? changes?.code?.to ?? "-";
                  }

                  // Ensure result is a string
                  if (result && typeof result === "object") {
                    if (result.name && result.code) {
                      return `${result.name} (${result.code})`;
                    }
                    if (result.name) {
                      return result.name;
                    }
                    return JSON.stringify(result);
                  }

                  return result;
                }
              }

              // Safety check: if value is an object, convert it to string
              if (value && typeof value === "object" && !Array.isArray(value)) {
                // If it's a date object, format it
                if (value instanceof Date) {
                  return value.toLocaleString();
                }
                // If it has name and code properties (like location/airline objects), format them
                if (value.name && value.code) {
                  return `${value.name} (${value.code})`;
                }
                // If it has name property, return just the name
                if (value.name) {
                  return value.name;
                }
                // For other objects, return a string representation
                return JSON.stringify(value);
              }

              if (col.key === "seatsSold") {
                return (
                  (params.data.totalSeats || 0) -
                  (params.data.availableSeats || 0)
                );
              }

              return value;
            },
            cellRenderer:
              col.cellRenderer ||
              ((params) => {
                const value = params.value;
                const rowData = params.data;

                // Render bookingReference as a link in bookingRequest context
                if (
                  col.key === "bookingReference" &&
                  tableContext === TABLE_CONTEXTS.BOOKING_REQUEST &&
                  value &&
                  rowData &&
                  rowData._id
                ) {
                  return (
                    <Link
                      href={{
                        pathname: `/admin/booking-request/${rowData._id}`,
                        query: {},
                      }}
                      className="text-gray-900 underline hover:text-gray-800"
                      // @ts-ignore
                      state={rowData}
                    >
                      {value}
                    </Link>
                  );
                }

                // Add status badges for payment status
                if (col.key === "paymentStatus") {
                  const paymentStatusInfo = getPaymentStatusDisplay(
                    rowData.paymentStatus,
                    rowData.bookingStatus,
                    typeof onPendingPaymentClick === "function"
                      ? () => onPendingPaymentClick(rowData)
                      : null
                  );
                  if (
                    paymentStatusInfo.isClickable &&
                    typeof onPendingPaymentClick === "function"
                  ) {
                    return (
                      <span
                        className={paymentStatusInfo.className}
                        style={paymentStatusInfo.style}
                        onClick={() => onPendingPaymentClick(rowData)}
                        tabIndex={0}
                        role="button"
                        title="Mark as Paid"
                      >
                        {paymentStatusInfo.displayText}
                      </span>
                    );
                  }
                  return (
                    <span
                      className={paymentStatusInfo.className}
                      style={paymentStatusInfo.style}
                    >
                      {paymentStatusInfo.displayText}
                    </span>
                  );
                }

                if (col.key === "paymentMethod") {
                  const paymentMethodInfo = getPaymentMethodDisplay(
                    rowData.paymentMethod,
                    rowData.bookingStatus
                  );
                  if (paymentMethodInfo.className) {
                    return (
                      <span className={paymentMethodInfo.className}>
                        {paymentMethodInfo.displayText}
                      </span>
                    );
                  }
                  return paymentMethodInfo.displayText;
                }

                if (
                  col.key === "status" &&
                  tableContext === TABLE_CONTEXTS.LEDGER
                ) {
                  return (
                    <span className={getStatusBadge(value, "ledger")}>
                      {value}
                    </span>
                  );
                }

                if (col.key === "status") {
                  // Only show approve/reject buttons for 'pending' status
                  if (value === "pending") {
                    const [loading, setLoading] = useState(false);
                    const handleAction = async (action) => {
                      setLoading(true);
                      try {
                        const endpoint = action.toLowerCase();
                        const res = await fetch(`/api/v1/users/${rowData._id}/${endpoint}`, {
                          method: "POST",
                        });
                        if (!res.ok) throw new Error("Failed to update status");
                        toast.success(`User ${capitalize(endpoint)}d successfully`);
                        if (typeof params.api !== 'undefined') {
                          params.api.applyTransaction({ update: [{ ...rowData, status: endpoint === 'approve' ? 'Approved' : 'Rejected' }] });
                        }
                      } catch (err) {
                        toast.error(err.message || `Failed to ${action} user`);
                      } finally {
                        setLoading(false);
                      }
                    };
                    return (
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 text-xs  font-semibold text-green-500"
                          disabled={loading}
                          onClick={() => handleAction("approve")}
                        >
                          {loading ? "Approving..." : "Approve"}
                        </button>
                        <button
                          className="px-2 py-1 text-xs  font-semibold  text-red-500"
                          disabled={loading}
                          onClick={() => handleAction("reject")}
                        >
                          {loading ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                    );
                  }
                  // Show colored badge for non-pending statuses
                  let badgeClass = "bg-gray-100 text-gray-800";
                  let displayValue = value;
                  if (typeof value === "string") {
                    if (value.toLowerCase() === "approved") {
                      badgeClass = "bg-green-100 text-green-800";
                      displayValue = "Approved";
                    } else if (value.toLowerCase() === "rejected") {
                      badgeClass = "bg-red-100 text-red-800";
                      displayValue = "Rejected";
                    } else if (value.toLowerCase() === "approve") {
                      displayValue = "Approve";
                    } else if (value.toLowerCase() === "reject") {
                      displayValue = "Reject";
                    } else {
                      displayValue = capitalize(value);
                    }
                  }
                  return (
                    <span className={`px-2 py-1 text-xs rounded font-semibold ${badgeClass}`}>
                      {displayValue}
                    </span>
                  );
                }

                // Add status badges for audit log actions
                if (
                  col.key === "action" &&
                  (tableContext === TABLE_CONTEXTS.AUDIT_LOG ||
                    tableContext === TABLE_CONTEXTS.TICKET_AUDIT_LOG ||
                    tableContext === TABLE_CONTEXTS.AIRLINE_AUDIT_LOG ||
                    tableContext === TABLE_CONTEXTS.LOCATION_AUDIT_LOG)
                ) {
                  // Special color logic for booking request audit logs
                  if (
                    columns.length > 0 &&
                    columns[0].key === "createdAt" &&
                    columns.some(
                      (c) => c.key === "booking" && c.label === "Booking ID"
                    )
                  ) {
                    // Booking Request Audit Table
                    let actionClass = "bg-gray-100 text-gray-800";
                    if (typeof value === "string") {
                      if (value.toLowerCase().includes("approve")) {
                        actionClass = "bg-green-100 text-green-700";
                      } else if (value.toLowerCase().includes("reject")) {
                        actionClass = "bg-red-100 text-red-700";
                      } else if (value.toLowerCase().includes("status")) {
                        actionClass = "bg-blue-100 text-blue-700";
                      }
                    }
                    return (
                      <span
                        className={`px-2 py-1 text-xs rounded font-semibold ${actionClass}`}
                      >
                        {value}
                      </span>
                    );
                  }
                  // Default for other audit logs
                  const actionClass =
                    value === "CREATE"
                      ? "bg-green-100 text-green-700"
                      : value === "UPDATE"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700";

                  return (
                    <span
                      className={`px-2 py-1 text-xs rounded font-semibold ${actionClass}`}
                    >
                      {value}
                    </span>
                  );
                }

                if (
                  col.key === "type" &&
                  tableContext === TABLE_CONTEXTS.AUDIT_LOG &&
                  params.data.type
                ) {
                  return value;
                }

                if (col.key === "totalDue") {
                  const numericValue =
                    typeof value === "string"
                      ? parseFloat(value.replace(/[^\d.-]/g, ""))
                      : value;

                  if (numericValue > 0) {
                    return (
                      <span className="bg-red-100 text-red-700 px-2 py-1 text-xs rounded font-semibold">
                        {value}
                      </span>
                    );
                  }
                  return value;
                }

                if (col.isDownload && tableContext === TABLE_CONTEXTS.LEDGER) {
                  const [downloading, setDownloading] = useState(false);
                  const handleDownload = async () => {
                    setDownloading(true);
                    try {
                      await exportBookingDetailsToExcel(params.data.PNR);
                    } catch (err) {
                      toast?.error?.(err.message || "Failed to export Excel");
                    } finally {
                      setDownloading(false);
                    }
                  };
                  return (
                    <span
                      title="Download"
                      className={`inline-flex items-center justify-center gap-1 cursor-pointer ${
                        downloading ? "opacity-50 pointer-events-none" : ""
                      }`}
                      onClick={handleDownload}
                    >
                      {downloading ? (
                        <svg
                          className="animate-spin h-4 w-4 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                          />
                        </svg>
                      )}
                      <span className="text-xs font-medium">Download</span>
                    </span>
                  );
                }

                return value;
              }),
          };
        }),
    [
      columns,
      adminRole,
      tableContext,
      onEditClick,
      onDeleteClick,
      actionLabels,
      loading,
      isSuperAdmin,
      onPendingPaymentClick,
      onNonBookableClick,
      showNonBookableAction,
    ]
  );

  // Default column definitions
  const defaultColDef = useMemo(
    () => ({
      filter: true,
      resizable: true,
      sortable: true,
    }),
    []
  );

  // Grid ready callback
  const onGridReady = useCallback((params) => {
    setApi(params.api);
  }, []);

  // Search functionality
  const onSearchChange = useCallback((event) => {
    const value = event.target.value;
    setSearchText(value);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchText("");
  }, []);

  return {
    agColumns,
    defaultColDef,
    onGridReady,
    onSearchChange,
    clearSearch,
    searchText,
    api,
    getRowStyle,
    getRowClass,
  };
};

// Helper function to render booking status cell
const renderBookingStatusCell = (
  rowData,
  showApproveReject,
  hasEdit,
  hasDelete,
  onEditClick,
  onDeleteClick,
  loading
) => {
  const bookingStatusInfo = getBookingStatusDisplay(
    rowData.bookingStatus,
    shouldShowApproveRejectButtons(
      rowData.bookingStatus,
      showApproveReject,
      "bookingRequest"
    )
  );

  // If we should show approve/reject buttons and we have the handlers
  if (bookingStatusInfo.shouldShowButtons && hasEdit && hasDelete) {
    return renderApproveRejectButtons(
      rowData,
      onEditClick,
      onDeleteClick,
      loading
    );
  }

  // Otherwise show the status badge
  return (
    <span className={bookingStatusInfo.className}>
      {bookingStatusInfo.displayText}
    </span>
  );
};

// Helper function to render approve/reject buttons
const renderApproveRejectButtons = (
  rowData,
  onEditClick,
  onDeleteClick,
  loading
) => {
  const handleAction = (handler) => (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set("id", rowData._id);
    formData.set("passengerIndex", rowData.passengerIndex);
    handler(formData);
  };

  // For booking requests, use the passenger-specific ID for loading state
  const loadingKey = rowData._id;
  const isRowLoading = loading[loadingKey];

  return (
    <div className="flex gap-2">
      <form onSubmit={handleAction(onEditClick)}>
        <input type="hidden" name="id" value={rowData._id} />
        <input
          type="hidden"
          name="passengerIndex"
          value={rowData.passengerIndex}
        />
        <button
          type="submit"
          disabled={isRowLoading}
          className={`${BUTTON_CLASSES.BASE} ${BUTTON_CLASSES.APPROVE}`}
          style={{ color: "#16a34a" }}
        >
          {isRowLoading ? (
            <LoadingSpinner text={LOADING_TEXTS.APPROVING} />
          ) : (
            ACTION_LABELS.APPROVE
          )}
        </button>
      </form>
      <form onSubmit={handleAction(onDeleteClick)}>
        <input type="hidden" name="id" value={rowData._id} />
        <input
          type="hidden"
          name="passengerIndex"
          value={rowData.passengerIndex}
        />
        <button
          type="submit"
          disabled={isRowLoading}
          className={`${BUTTON_CLASSES.BASE} ${BUTTON_CLASSES.DELETE}`}
        >
          {isRowLoading ? (
            <LoadingSpinner text={LOADING_TEXTS.REJECTING} />
          ) : (
            ACTION_LABELS.REJECT
          )}
        </button>
      </form>
    </div>
  );
};

// Helper function to render action cell
const renderActionCell = (
  rowData,
  hasEdit,
  hasDelete,
  onEditClick,
  onDeleteClick,
  actionLabels,
  loading,
  onNonBookableClick,
  showNonBookableAction
) => {
  const handleAction = (handler) => (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set("id", rowData._id);
    formData.set("passengerIndex", rowData.passengerIndex);
    handler(formData);
  };

  // For booking requests, use the passenger-specific ID for loading state
  const loadingKey = rowData._id;
  const isRowLoading = loading[loadingKey];

  return (
    <div className="flex gap-1">
      {hasEdit && (
        <form onSubmit={handleAction(onEditClick)}>
          <input type="hidden" name="id" value={rowData._id} />
          <input
            type="hidden"
            name="passengerIndex"
            value={rowData.passengerIndex}
          />
          <button
            type="submit"
            disabled={isRowLoading}
            className={`${BUTTON_CLASSES.BASE} ${BUTTON_CLASSES.EDIT}`}
          >
            {isRowLoading ? (
              <LoadingSpinner text={LOADING_TEXTS.PROCESSING} />
            ) : (
              actionLabels.edit
            )}
          </button>
        </form>
      )}
      {hasDelete && (
        <form onSubmit={handleAction(onDeleteClick)}>
          <input type="hidden" name="id" value={rowData._id} />
          <input
            type="hidden"
            name="passengerIndex"
            value={rowData.passengerIndex}
          />
          <button
            type="submit"
            disabled={isRowLoading}
            className={`${BUTTON_CLASSES.BASE} ${BUTTON_CLASSES.DELETE}`}
          >
            {isRowLoading ? (
              <LoadingSpinner text={LOADING_TEXTS.PROCESSING} />
            ) : (
              actionLabels.delete
            )}
          </button>
        </form>
      )}
      {showNonBookableAction && typeof onNonBookableClick === "function" && (
        <form onSubmit={handleAction(onNonBookableClick)}>
          <input type="hidden" name="id" value={rowData._id} />
          <input
            type="hidden"
            name="passengerIndex"
            value={rowData.passengerIndex}
          />
          <button
            type="submit"
            className={`${BUTTON_CLASSES.BASE} ${
              rowData.nonBookable
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
            title={
              rowData.nonBookable ? "Unblock this ticket" : "Block this ticket"
            }
          >
            {rowData.nonBookable
              ? actionLabels?.nonBookable || "Unblock"
              : actionLabels?.nonBookable || "Block"}
          </button>
        </form>
      )}
    </div>
  );
};

// Utility to capitalize first letter
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

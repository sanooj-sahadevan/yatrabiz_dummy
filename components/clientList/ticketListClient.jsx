"use client";
import { useAdminSession } from "@/hooks/useAdminSession";
import AGGrid from "@/components/admin/table/AGGrid";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/constants/api";
import { useTickets } from "@/hooks/useTickets";
import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api/client";
import { createPortal } from "react-dom";
import {
  formatDate,
  formatTime,
  calculateTravelDuration,
  getStatusColor,
} from "@/utils/formatters";
import { formatCurrency } from "@/utils/ticketCalculations";

export default function TicketListClient({
  tickets: initialTickets,
  columns,
  allBookings: initialAllBookings,
}) {
  const router = useRouter();

  const {
    admin: currentAdmin,
    loading: adminLoading,
    error: adminError,
  } = useAdminSession();

  const {
    data: tickets,
    loading: ticketsLoading,
    error: ticketsError,
    refetch,
    deleteData,
    page,
    limit,
    total,
    totalPages,
    setPage,
    setLimit,
  } = useTickets(
    API_ENDPOINTS.TICKET.LIST,
    "Tickets",
    currentAdmin,
    initialTickets
  );
  const [popup, setPopup] = useState({
    show: false,
    x: 0,
    y: 0,
    ticketId: null,
  });
  const [popupData, setPopupData] = useState([]);
  const [isOverPopup, setIsOverPopup] = useState(false);
  const [isOverCell, setIsOverCell] = useState(false);
  const popupCloseTimeout = React.useRef(null);
  const allBookings = initialAllBookings || [];

  const formattedTickets = useMemo(() => {
    return tickets.map((ticket) => ({
      ...ticket,
      formattedDateOfJourney: formatDate(ticket.dateOfJourney, "ticket-list"),
      formattedDepartureTime: formatTime(ticket.departureTime),
      formattedArrivalTime: formatTime(ticket.arrivalTime),
      travelDuration: calculateTravelDuration(
        ticket.dateOfJourney,
        ticket.departureTime,
        ticket.arrivalTime
      ),
      formattedSalePrice: formatCurrency(ticket.salePrice),
      formattedPurchasePrice: formatCurrency(ticket.purchasePrice),
      formattedTotalPrice: formatCurrency(ticket.totalPrice),
      formattedAdvPaidAmount: formatCurrency(ticket.advPaidAmount),
      formattedOutstanding: formatCurrency(ticket.outstanding),
      formattedDiscount: formatCurrency(ticket.Discount),
      statusColor: getStatusColor(ticket.status || "Available"),
      availableSeatsDisplay: `${ticket.availableSeats}/${ticket.totalSeats}`,
      isLowSeats: ticket.availableSeats <= 2 && ticket.availableSeats > 0,
      isNoSeats: ticket.availableSeats === 0,
    }));
  }, [tickets]);

  const closePopupWithDelay = () => {
    if (popupCloseTimeout.current) clearTimeout(popupCloseTimeout.current);
    popupCloseTimeout.current = setTimeout(() => {
      setPopup({ show: false, x: 0, y: 0, ticketId: null });
      setPopupData([]);
    }, 150);
  };

  const cancelClosePopup = () => {
    if (popupCloseTimeout.current) clearTimeout(popupCloseTimeout.current);
  };

  const pnrCellRenderer = (params) => {
    const handleMouseEnter = (e) => {
      cancelClosePopup();
      setIsOverCell(true);
      const rect = e.target.getBoundingClientRect();
      setPopup({
        show: true,
        x: rect.right,
        y: rect.top + rect.height / 2,
        ticketId: params.data._id,
      });
      const bookings = allBookings.filter((b) => {
        if (!b.ticket) return false;
        if (typeof b.ticket === "string") {
          return b.ticket === params.data._id;
        }
        if (typeof b.ticket === "object" && b.ticket._id) {
          return b.ticket._id === params.data._id;
        }
        return false;
      });
      // Map each booking to an array of passenger/bookingRef/agentName objects
      const passengerBookingData = bookings.flatMap((b) => {
        const passengers = b.passengers || (b.passenger ? [b.passenger] : []);
        return passengers.map((p) => ({
          passenger: p,
          bookingRef: b.bookingReference || "-",
          agentName:
            (b.user && (b.user.name || b.user.fullName || b.user.username)) ||
            "-",
        }));
      });
      setPopupData(passengerBookingData);
    };
    const handleMouseLeave = () => {
      setIsOverCell(false);
      closePopupWithDelay();
    };
    const handleClick = (e) => {
      e.stopPropagation();
      router.push(
        `/admin/tickets/edit-Tickets?id=${params.data._id}&readOnly=true`
      );
    };
    return (
      <span
        style={{
          cursor: "pointer",
          textDecoration: "underline",
          color: "#111827",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {params.value}
      </span>
    );
  };

  const modifiedColumns = columns.map((col) => {
    if (col.key === "PNR") {
      return { ...col, cellRenderer: pnrCellRenderer };
    }
    return col;
  });

  const handleEditClick = (formData) => {
    const ticketId = formData.get("id");
    router.push(`/admin/tickets/edit-Tickets?id=${ticketId}`);
  };

  const handleDeleteClick = async (formData) => {
    const ticketId = formData.get("id");

    const ticketToDelete = tickets.find((t) => t._id === ticketId);
    if (
      !ticketToDelete ||
      !confirm(
        `Delete ticket with PNR: ${
          ticketToDelete.PNR || ticketToDelete.airline || ticketToDelete._id
        }?`
      )
    )
      return;

    try {
      await deleteData(ticketId, {
        performedBy: {
          id: currentAdmin?.id,
          name: currentAdmin?.name,
          role: currentAdmin?.role,
        },
        deletedTicket: {
          id: ticketToDelete._id,
          PNR: ticketToDelete.PNR,
          airline: ticketToDelete.airline,
        },
        adminId: currentAdmin?.id,
      });
      toast.success("Ticket deleted successfully");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete ticket");
      console.error(err);
    }
  };

  const handleNonBookableClick = async (formData) => {
    const ticketId = formData.get("id");
    const ticket = tickets.find((t) => t._id === ticketId);

    if (
      !ticket ||
      !confirm(
        `Are you sure you want to toggle the bookable status for PNR: ${
          ticket.PNR || ticket.airline || ticket._id
        }?`
      )
    ) {
      return;
    }

    try {
      const response = await apiClient.put(
        `${API_ENDPOINTS.TICKET.LIST}/${ticketId}/toggle-bookable`
      );

      if (response) {
        toast.success(response.message || "Status updated successfully!");
        refetch();
      } else {
        toast.error(response.message || "Failed to update status.");
      }
    } catch (error) {
      console.error("Failed to toggle non-bookable status", error);
      toast.error(
        error.response?.data?.message || "An error occurred while updating."
      );
    }
  };

  const isLoading = ticketsLoading || adminLoading;
  const error = ticketsError || adminError;

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : (
        <div style={{ position: "relative" }}>
          <AGGrid
            data={formattedTickets}
            title="Tickets"
            columns={modifiedColumns}
            onAddClick={() => router.push("/admin/tickets/add-Tickets")}
            adminRole={currentAdmin}
            tableContext="tickets"
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            actionLabels={{
              edit: "Edit",
              delete: "Delete",
            }}
            onNonBookableClick={handleNonBookableClick}
            showNonBookableAction={true}
          />
          {/* Pagination Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "20px 0",
            }}
          >
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              style={{ marginRight: 10 }}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              style={{ marginLeft: 10 }}
            >
              Next
            </button>
            <span style={{ marginLeft: 20 }}>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              style={{ marginLeft: 5 }}
            >
              {[10, 20, 50, 100].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span style={{ marginLeft: 20 }}>Total: {total}</span>
          </div>
          {popup.show && typeof window !== "undefined"
            ? createPortal(
                <div
                  style={{
                    position: "fixed",
                    left: popup.x,
                    top: popup.y,
                    transform: "translateY(-50%)",
                    pointerEvents: "auto",
                    minWidth: "220px",
                    maxWidth: "320px",
                    maxHeight: "220px",
                    overflowY: "auto",
                    zIndex: 9999,
                  }}
                  className="popup-scroll-hide"
                  onMouseEnter={() => {
                    cancelClosePopup();
                    setIsOverPopup(true);
                  }}
                  onMouseLeave={() => {
                    setIsOverPopup(false);
                    closePopupWithDelay();
                  }}
                >
                  <style>{`
                    .popup-table {
                      border: 1.5px solid #111827;
                      border-radius: 6px;
                      width: 100%;
                      background: #fff;
                      font-size: 15px;
                      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
                    }
                    .popup-table th, .popup-table td {
                      border-bottom: 1px solid #e5e7eb;
                      border-right: 1px solid #e5e7eb;
                      padding: 4px 8px;
                      font-weight: normal;
                    }
                    .popup-table th:last-child, .popup-table td:last-child {
                      border-right: none;
                    }
                    .popup-table tr:last-child td {
                      border-bottom: none;
                    }
                    .popup-table th {
                      background: #fff;
                      font-weight: bold;
                    }
                    /* Hide scrollbar for popup container */
                    .popup-scroll-hide::-webkit-scrollbar { display: none !important; }
                    .popup-scroll-hide { scrollbar-width: none; ms-overflow-style: none; }
                  `}</style>
                  {popupData.length === 0 ? (
                    <div
                      style={{
                        border: "1.5px solid #111827",
                        borderRadius: "6px",
                        background: "#fff",
                        fontSize: "15px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        padding: "16px",
                        textAlign: "center",
                        color: "#6b7280",
                        minWidth: "220px",
                        maxWidth: "320px",
                      }}
                    >
                      No passenger/booking data
                    </div>
                  ) : (
                    <table
                      className="popup-table"
                      style={{ borderCollapse: "collapse", borderSpacing: 0 }}
                    >
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left" }}>Name</th>
                          <th style={{ textAlign: "left" }}>Booking Ref</th>
                          <th style={{ textAlign: "left" }}>Agent Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {popupData.map((item, i) => (
                          <tr key={i}>
                            <td>
                              {`${item.passenger?.honorific || ""} ${
                                item.passenger?.firstName || ""
                              } ${item.passenger?.lastName || ""}`.trim()}
                            </td>
                            <td>{item.bookingRef}</td>
                            <td>{item.agentName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>,
                document.body
              )
            : null}
        </div>
      )}
    </>
  );
}

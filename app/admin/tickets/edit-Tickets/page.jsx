"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAdminSession } from "@/hooks/useAdminSession";
import { useTickets } from "@/hooks/useTickets";
import TicketForm from "@/components/admin/form/ticketForm";
import { API_ENDPOINTS } from "@/constants/api";
import { useEffect, useState, Suspense } from "react";
import { toast } from "react-toastify";
import ToastNotifications from "@/components/common/toastNotifications/toastNotifications";

// Separate component for search params logic
function EditTicketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("id");
  const readOnly = searchParams.get("readOnly") === "true";
  const { admin: currentAdmin } = useAdminSession();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    putData,
    loading: updateLoading,
    data: tickets,
  } = useTickets(API_ENDPOINTS.TICKET.LIST, "Ticket", currentAdmin);
  useEffect(() => {
    if (!ticketId) {
      router.push("/admin/tickets");
      return;
    }

    if (tickets && tickets.length > 0) {
      const ticket = tickets.find((t) => t._id === ticketId);
      if (ticket) {
        const formatDateTimeForInput = (dateTimeString) => {
          if (!dateTimeString) return "";
          try {
            const date = new Date(dateTimeString);
            if (isNaN(date.getTime())) return "";

            // Format as YYYY-MM-DDTHH:MM for datetime-local input
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");

            return `${year}-${month}-${day}T${hours}:${minutes}`;
          } catch (error) {
            console.error("Error formatting datetime for input:", error);
            return "";
          }
        };

        const firstPayment =
          ticket.outstandingPayments && ticket.outstandingPayments.length > 0
            ? ticket.outstandingPayments[0]
            : {};

        // Format the ticket data for the form
        const formattedTicketData = {
          ...ticket,
          // Extract location IDs for SearchableDropdown
          departureLocation:
            ticket.departureLocation?._id || ticket.departureLocation,
          arrivalLocation:
            ticket.arrivalLocation?._id || ticket.arrivalLocation,
          // Extract airline ID for SearchableDropdown
          airline: ticket.airline?._id || ticket.airline,
          // Format dates for input fields
          dateOfJourney: ticket.dateOfJourney
            ? new Date(ticket.dateOfJourney).toISOString().split("T")[0]
            : "",
          purchaseDate: ticket.purchaseDate
            ? new Date(ticket.purchaseDate).toISOString().split("T")[0]
            : "",
          dateOfNameSubmission: formatDateTimeForInput(
            ticket.dateOfNameSubmission
          ),
          outstandingDate: formatDateTimeForInput(ticket.outstandingDate),
          advPaymentTxnId: firstPayment.transactionId || "",
          advPaymentDate: firstPayment.date
            ? new Date(firstPayment.date).toISOString().split("T")[0]
            : "",
          totalSeats: Number(ticket.totalSeats) || 0,
          availableSeats: Number(ticket.availableSeats),
          purchasePrice: Number(ticket.purchasePrice) || 0,
          advPaidAmount: Number(ticket.advPaidAmount) || 0,
          outstanding: Number(ticket.outstanding) || 0,
          totalPrice: Number(ticket.totalPrice) || 0,
          salePrice: Number(ticket.salePrice) || 0,
          release: Number(ticket.release) || 0,
          Discount: Number(ticket.Discount) || 0,
        };

        setTicketData(formattedTicketData);
      } else {
        console.error("Ticket not found");
        router.push("/admin/tickets");
      }
      setLoading(false);
    }
  }, [ticketId, tickets, router]);

  const handleSubmit = async (formData) => {
    try {
      await putData(ticketId, formData);
      toast.success("Ticket updated successfully");
      router.push("/admin/tickets");
    } catch (err) {
      console.error("Failed to update ticket:", err);
      throw err; // Re-throw to be caught in the form
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex justify-center items-center">
        <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-white text-black flex justify-center items-center">
        <div className="text-red-500">Ticket not found</div>
      </div>
    );
  }

  return (
    <>
      <ToastNotifications />
      <div className="min-h-screen bg-white text-black">
        <TicketForm
          onSubmit={handleSubmit}
          loading={updateLoading}
          initialData={ticketData}
          isEditMode={true}
          tickets={tickets || []}
          readOnly={readOnly}
        />
      </div>
    </>
  );
}

// Loading fallback component
function EditTicketLoading() {
  return (
    <div className="min-h-screen bg-white text-black flex justify-center items-center">
      <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-gray-900"></div>
    </div>
  );
}

// Main component with Suspense boundary
export default function EditTicketPage() {
  return (
    <Suspense fallback={<EditTicketLoading />}>
      <EditTicketContent />
    </Suspense>
  );
}

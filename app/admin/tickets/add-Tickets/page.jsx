"use client";
import { useRouter } from "next/navigation";
import { useTickets } from "@/hooks/useTickets";
import { API_ENDPOINTS } from "@/constants/api";
import { useAdminSession } from "@/hooks/useAdminSession";
import TicketForm from "@/components/admin/form/ticketForm";
import { toast } from "react-toastify";
import ToastNotifications from "@/components/common/toastNotifications/toastNotifications";

export default function AddTicketPage() {
  const router = useRouter();
  const { admin: currentAdmin } = useAdminSession();

  const {
    postData,
    loading,
    data: tickets,
  } = useTickets(API_ENDPOINTS.TICKET.LIST, "Ticket", currentAdmin);

  const handleSubmit = async (formData) => {
    try {
      await postData(formData);
      toast.success("Ticket added successfully");
      router.push("/admin/tickets");
    } catch (err) {
      console.error("Failed to add ticket:", err);
      throw err; // Re-throw to be caught in the form
    }
  };

  return (
    <>
      <ToastNotifications />
      <div className=" text-black">
        <TicketForm
          onSubmit={handleSubmit}
          loading={loading}
          tickets={tickets || []}
        />
      </div>
    </>
  );
}

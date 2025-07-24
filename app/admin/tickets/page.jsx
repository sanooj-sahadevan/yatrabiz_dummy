export const dynamic = "force-dynamic";
import { getTickets } from "@/lib/server/getTickets";
import { TICKET_COLUMNS } from "@/constants/tableColumns";
import { getBookingRequest } from "@/lib/server/getBookingRequest";
import TicketListClient from "@/components/clientList/ticketListClient";
import ToastNotifications from "@/components/common/toastNotifications/toastNotifications";

export default async function TicketList() {
  let tickets = [];
  let allBookings = [];
  try {
    tickets = await getTickets();
    allBookings = await getBookingRequest();
  } catch (error) {
    return <div className="text-red-500 p-6">{error.message}</div>;
  }

  return (
    <>
      <ToastNotifications />
      <div className="p-6 min-h-screen">
        <TicketListClient
          tickets={tickets}
          columns={TICKET_COLUMNS}
          allBookings={allBookings}
        />
      </div>
    </>
  );
}

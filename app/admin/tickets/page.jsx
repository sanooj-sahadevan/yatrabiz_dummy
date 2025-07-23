// "use client";
import { connectToDatabase } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { TICKET_COLUMNS } from "@/constants/tableColumns";
import TicketListClient from "@/components/clientList/ticketListClient";
import ToastNotifications from "@/components/common/toastNotifications/toastNotifications";
import { getBookingRequest } from "@/lib/server/getBookingRequest";
import { cookies } from "next/headers";
import { getAdminSessionSSR } from "@/lib/server/getAdminSessionSSR";

export const revalidate = 60;

export default async function TicketList() {
  try {
    await connectToDatabase();

    const cookieStore = await cookies();
    const adminToken = cookieStore.get("adminToken")?.value || "";
    const cookieHeader = adminToken ? `adminToken=${adminToken}` : "";

    const { admin } = await getAdminSessionSSR(cookieHeader);

    const query =
      !admin || admin.type !== "admin"
        ? {
            nonBookable: false,
            availableSeats: { $gt: 0 },
            dateOfJourney: { $gt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
          }
        : {};

    const tickets = await Ticket.find(query)
      .sort({ dateOfJourney: 1 })
      .select([
        "_id",
        "PNR",
        "isDummyPNR",
        "flightNumber",
        "journeyType",
        "classType",
        "totalSeats",
        "availableSeats",
        "purchasePrice",
        "salePrice",
        "outstanding",
        "advPaidAmount",
        "nonBookable",
        "handBaggage",
        "checkedBaggage",
        "infantFees",
        "Discount",
        "release",
        "purchaseDate",
        "dateOfJourney",
        "dateOfNameSubmission",
        "outstandingDate",
        "createdAt",
        "updatedAt",
      ])
      .lean();

    const serializedTickets = tickets.map((t) => ({
      ...t,
      _id: t._id?.toString(),
      purchaseDate: t.purchaseDate?.toISOString(),
      dateOfJourney: t.dateOfJourney?.toISOString(),
      dateOfNameSubmission: t.dateOfNameSubmission?.toISOString(),
      outstandingDate: t.outstandingDate?.toISOString(),
      createdAt: t.createdAt?.toISOString(),
      updatedAt: t.updatedAt?.toISOString(),
    }));

    let allBookings = [];
    if (admin) {
      try {
        allBookings = await getBookingRequest(cookieHeader);
      } catch (err) {
        console.warn(" Booking fetch failed:", err.message);
      }
    }

    return (
      <>
        <ToastNotifications />
        <div className="p-6 min-h-screen">
          <TicketListClient
            tickets={serializedTickets}
            columns={TICKET_COLUMNS}
            allBookings={allBookings}
          />
        </div>
      </>
    );
  } catch (error) {
    console.error("Error in SSR TicketList:", error);
    return (
      <div className="text-red-500 p-6 whitespace-pre-wrap">
        {error.message || "Something went wrong"}
      </div>
    );
  }
}

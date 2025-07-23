// export const dynamic = "force-dynamic";
// import { getTickets } from "@/lib/server/getTickets";
// import { TICKET_COLUMNS } from "@/constants/tableColumns";
// import { getBookingRequest } from "@/lib/server/getBookingRequest";
// import TicketListClient from "@/components/clientList/ticketListClient";
// import ToastNotifications from "@/components/common/toastNotifications/toastNotifications";

// export default async function TicketList() {
//   let tickets = [];
//   let allBookings = [];
//   try {
//     tickets = await getTickets();
//     allBookings = await getBookingRequest();
//   } catch (error) {
//     return <div className="text-red-500 p-6">{error.message}</div>;
//   }

//   return (
//     <>
//       <ToastNotifications />
//       <div className="p-6 min-h-screen">
//         <TicketListClient
//           tickets={tickets}
//           columns={TICKET_COLUMNS}
//           allBookings={allBookings}
//         />
//       </div>
//     </>
//   );
// }


// app/tickets/page.tsx

// import { connectToDatabase } from "@/lib/mongodb";
// import Ticket from "@/models/Ticket";
// import { getAdminSessionSSR } from "@/lib/auth";
// import { TICKET_COLUMNS } from "@/constants/tableColumns";
// import TicketListClient from "@/components/clientList/ticketListClient";
// import ToastNotifications from "@/components/common/toastNotifications/toastNotifications";
// import { cookies } from "next/headers";
// import { getBookingRequest } from "@/lib/server/getBookingRequest";

// export const dynamic = "force-dynamic";

// export default async function TicketList() {
//   try {
//     const cookieStore = cookies();
//     const cookieHeader = cookieStore.get("cookie")?.value || "";
//     const { admin } = await getAdminSessionSSR(cookieHeader);

//     await connectToDatabase();

//     let query = {};
//     if (!admin || admin.type !== "admin") {
//       const now = new Date();
//       const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
//       query = {
//         nonBookable: false,
//         availableSeats: { $gt: 0 },
//         dateOfJourney: { $gt: twentyFourHoursFromNow },
//       };
//     }

//     // Pagination (Optional, hardcoded page 1 for SSR)
//     const page = 1;
//     const limit = 500;
//     const skip = (page - 1) * limit;

//     const [tickets, total, allBookings] = await Promise.all([
//       Ticket.find(query)
//         .sort({ dateOfJourney: 1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("airline", "name code")
//         .populate("departureLocation", "name code")
//         .populate("arrivalLocation", "name code")
//         .populate("connectingLocation", "name code")
//         .lean(),

//       Ticket.countDocuments(query),

//       getBookingRequest(),
//     ]);

//     return (
//       <>
//         <ToastNotifications />
//         <div className="p-6 min-h-screen">
//           <TicketListClient
//             tickets={tickets}
//             columns={TICKET_COLUMNS}
//             allBookings={allBookings}
//           />
//         </div>
//       </>
//     );
//   } catch (error) {
//     console.error("Error in SSR TicketList:", error);
//     return (
//       <div className="text-red-500 p-6">
//         {error.message || "Something went wrong"}
//       </div>
//     );
//   }
// }

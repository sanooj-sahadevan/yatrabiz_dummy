import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Ticket from "@/models/Ticket";
import Airline from "@/models/Airline";
import User from "@/models/User";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const airlineId = searchParams.get("airline");
    const pnr = searchParams.get("pnr");

    // Build booking query
    const bookingQuery = {};
    if (userId) bookingQuery.user = userId;
    // We'll filter by airline and PNR after populating ticket

    // Only include confirmed bookings
    bookingQuery.bookingStatus = "Confirmed";

    // Fetch bookings with ticket and user populated
    const bookings = await Booking.find(bookingQuery)
      .populate({
        path: "ticket",
        populate: { path: "airline", select: "name code" },
      })
      .populate({ path: "user", select: "name email" });

    // Filter by airline and PNR if needed
    const filtered = bookings.filter((booking) => {
      if (!booking.ticket) return false;
      if (airlineId && String(booking.ticket.airline?._id) !== String(airlineId)) return false;
      if (pnr && !booking.ticket.PNR?.toLowerCase().includes(pnr.toLowerCase())) return false;
      return true;
    });

    // Aggregate by user, airline, and PNR (first 6 chars)
    const ledgerMap = new Map();
    filtered.forEach((booking) => {
      const ticket = booking.ticket;
      const user = booking.user;
      const airline = ticket.airline;
      const ticketPNR = ticket.PNR?.substring(0, 6) || "N/A";
      const key = `${user?._id}|${airline?._id}|${ticketPNR}`;
      if (!ledgerMap.has(key)) {
        ledgerMap.set(key, {
          ticketPNR,
          user,
          airline,
          bookedDate: booking.bookingDate,
          dateOfJourney: ticket.dateOfJourney,
          totalPayment: 0,
          credit: 0,
          due: 0,
          ticket: ticket._id,
        });
      }
      const entry = ledgerMap.get(key);
      entry.totalPayment += booking.totalAmount || 0;
      entry.credit += booking.agentCredit || 0;
      entry.due = entry.totalPayment - entry.credit;
      // Use earliest bookedDate and latest dateOfJourney
      if (booking.bookingDate < entry.bookedDate) entry.bookedDate = booking.bookingDate;
      if (ticket.dateOfJourney > entry.dateOfJourney) entry.dateOfJourney = ticket.dateOfJourney;
    });

    const ledgers = Array.from(ledgerMap.values());

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: ledgers,
      }),
      {
        status: 200,
      
      }
    );
  } catch (error) {
    console.error("Error fetching customer ledgers:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customer ledgers" },
      { status: 500 }
    );
  }
}

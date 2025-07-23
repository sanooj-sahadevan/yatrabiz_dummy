import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Booking from "@/models/Booking";
import Airline from "@/models/Airline";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const airlineId = searchParams.get("airline");

    const ticketQuery = airlineId ? { airline: airlineId } : {};

    const tickets = await Ticket.find(ticketQuery).populate(
      "airline",
      "name code"
    );
    const results = await Promise.all(
      tickets.map(async (ticket) => {
        const bookings = await Booking.find({
          ticket: ticket._id,
          bookingStatus: "Confirmed",
        });
       

        let customerPaidAmount = 0;
        let customerOutstandingAmount = 0;
        bookings.forEach((booking) => {
          customerPaidAmount += booking.agentCredit || 0;
          customerOutstandingAmount += booking.agentOutstanding;
        });

        return {
          ticketId: ticket._id,
          PNR: ticket.PNR,
          airline: ticket.airline,
          totalPayment: ticket.totalSeats * ticket.purchasePrice,
          advance: ticket.advPaidAmount,
          outstanding: ticket.outstanding,
          outstandingDate: ticket.outstandingDate, 
          customerPaidAmount: customerPaidAmount,
          customerOutstanding: customerOutstandingAmount,
        };
      })
    );
    return new NextResponse(
      JSON.stringify({ success: true, data: results }),
      {
        status: 200,
      
      }
    );
  } catch (error) {
    console.error("Error fetching airline ledger data:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

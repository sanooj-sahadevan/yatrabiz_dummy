import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";

export async function POST(request, { params }) {
  try {
    await connectToDatabase();
    const { id: pnr } = params;
    const { amountPaid, date, transactionId } = await request.json();

    if (!pnr || !amountPaid || !date || !transactionId) {
      return NextResponse.json({ success: false, message: "All fields are required." }, { status: 400 });
    }

    const ticket = await Ticket.findOne({ PNR: pnr });
    if (!ticket) {
      return NextResponse.json({ success: false, message: "Ticket not found." }, { status: 404 });
    }

    ticket.outstandingPayments.push({
      amountPaid,
      date,
      transactionId,
    });

    // Reduce outstanding
    ticket.outstanding = Math.max(0, (ticket.outstanding || 0) - amountPaid);

    await ticket.save();

    return NextResponse.json({ success: true, outstanding: ticket.outstanding });
  } catch (error) {
    console.error("Error saving outstanding payment:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
} 
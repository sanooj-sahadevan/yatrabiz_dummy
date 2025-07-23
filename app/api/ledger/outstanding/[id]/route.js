import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id: pnr } = await params;
    const ticket = await Ticket.findOne({ PNR: pnr });
    if (!ticket) {
      return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Error fetching outstanding details by PNR:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
} 
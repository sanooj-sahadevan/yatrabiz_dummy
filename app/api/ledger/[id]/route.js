import Booking from "@/models/Booking";
import "@/models/User";
import "@/models/Ticket";
import "@/models/Admin";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  await connectToDatabase();
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error("Invalid ticketId:", id);
    return new Response(
      JSON.stringify({ success: false, error: "Invalid ticketId" }),
      { status: 400 }
    );
  }

  try {
    const ticketObjectId = new mongoose.Types.ObjectId(id);
    const bookings = await Booking.find({ ticket: ticketObjectId })
      .populate("user")
      .populate("ticket")
      .populate("adminId");

    return new Response(JSON.stringify({ success: true, data: bookings }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error in /api/ledger/[id]:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}

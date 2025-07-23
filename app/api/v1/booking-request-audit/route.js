import { connectToDatabase } from "@/lib/mongodb";
import BookingRequestAuditLog from "@/models/BookingRequestAuditLog";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const bookingRequestAuditLog = await BookingRequestAuditLog.find({})
      .populate("adminId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return new NextResponse(
      JSON.stringify({
        message: "Booking Request Audit Log fetched successfully",
        data: bookingRequestAuditLog,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=3"
        }
      }
    );
  } catch (error) {
    console.error("Error fetching Booking Request Audit Log:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 
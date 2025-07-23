import { connectToDatabase } from "@/lib/mongodb";
import AirlineAuditLog from "@/models/AirlineAuditLog";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const airlineAuditLog = await AirlineAuditLog.find({})
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return new NextResponse(
      JSON.stringify({
        message: "Airline Audit Log fetched successfully",
        data: airlineAuditLog,
      }),
      {
        status: 200,
       
      }
    );
  } catch (error) {
    console.error("Error fetching Airline Audit Log:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 
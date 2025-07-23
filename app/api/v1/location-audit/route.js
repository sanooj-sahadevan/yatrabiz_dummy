import { connectToDatabase } from "@/lib/mongodb";
import LocationAuditLog from "@/models/LocationAuditLog";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const locationAuditLog = await LocationAuditLog.find({})
      .populate("adminId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return new NextResponse(
      JSON.stringify({
        message: "Location Audit Log fetched successfully",
        data: locationAuditLog,
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
    console.error("Error fetching Location Audit Log:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

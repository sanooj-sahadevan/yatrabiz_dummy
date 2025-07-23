import { connectToDatabase } from "@/lib/mongodb";
import AuditLog from "@/models/AdminAuditLog";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const auditLog = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .lean();

    return new NextResponse(
      JSON.stringify({
        message: "AuditLog fetched successfully",
        data: auditLog,
      }),
      {
        status: 200,
       
      }
    );
  } catch (error) {
    console.error("Error fetching AuditLog:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

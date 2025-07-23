import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PassengerNameEditAuditLog from "@/models/PassengerNameEditAuditLog";

export async function GET(request) {
  try {
    await connectToDatabase();
    const logs = await PassengerNameEditAuditLog.find({}).sort({
      createdAt: -1,
    });
    return new NextResponse(
      JSON.stringify({ success: true, data: logs }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=3"
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

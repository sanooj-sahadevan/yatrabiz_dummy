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
       
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

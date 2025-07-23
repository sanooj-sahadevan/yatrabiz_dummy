import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";

export async function GET(request) {
  try {
    await connectToDatabase();
    const year = 2025;

    // Aggregate confirmed bookings for 2025, grouped by user
    const bookings = await Booking.aggregate([
      {
        $match: {
          bookingStatus: "Confirmed",
        },
      },
      {
        $lookup: {
          from: "tickets",
          localField: "ticket",
          foreignField: "_id",
          as: "ticketInfo",
        },
      },
      { $unwind: "$ticketInfo" },
      {
        $project: {
          user: 1,
          credit: "$agentCredit",
          due: "$agentOutstanding",
          year: { $year: "$ticketInfo.dateOfJourney" },
        },
      },
      { $match: { year } },
      {
        $group: {
          _id: "$user",
          credit: { $sum: "$credit" },
          due: { $sum: "$due" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: 0,
          name: "$userInfo.name",
          credit: 1,
          due: 1,
        },
      },
      { $sort: { credit: -1, due: -1 } },
    ]);

    return new NextResponse(
      JSON.stringify(bookings),
      {
        status: 200,
        
      }
    );
  } catch (error) {
    console.error("Error fetching ledger summary analytics:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch ledger summary analytics" },
      { status: 500 }
    );
  }
} 
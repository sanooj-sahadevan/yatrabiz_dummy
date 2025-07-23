import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET(request) {
  try {
    await connectToDatabase();
    const year = 2025;

    // Aggregate confirmed bookings by customer
    const customers = await Booking.aggregate([
      { $match: { bookingStatus: "Confirmed" } },
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
          totalAmount: 1,
          year: { $year: "$ticketInfo.dateOfJourney" },
        },
      },
      { $match: { year } },
      {
        $group: {
          _id: "$user",
          ticketCount: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      { $sort: { ticketCount: -1, totalAmount: -1 } },
      { $limit: 10 },
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
          ticketCount: 1,
          totalAmount: 1,
        },
      },
    ]);

    return new NextResponse(
      JSON.stringify(customers),
      {
        status: 200,
       
      }
    );
  } catch (error) {
    console.error("Error fetching top customers:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch top customers" },
      { status: 500 }
    );
  }
} 
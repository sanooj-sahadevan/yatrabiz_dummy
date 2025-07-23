import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET(request) {
  try {
    await connectToDatabase();
    const year = 2025;

    const topDestinations = await Booking.aggregate([
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
          arrivalLocation: "$ticketInfo.arrivalLocation",
          year: { $year: "$ticketInfo.dateOfJourney" },
        },
      },
      { $match: { year } },
      {
        $group: {
          _id: "$arrivalLocation",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "locations",
          localField: "_id",
          foreignField: "_id",
          as: "location",
        },
      },
      { $unwind: "$location" },
      {
        $project: {
          _id: 0,
          name: "$location.name",
          count: 1,
        },
      },
    ]);

    return new NextResponse(
      JSON.stringify(topDestinations),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=3"
        }
      }
    );
  } catch (error) {
    console.error("Error fetching top destinations:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch top destinations" },
      { status: 500 }
    );
  }
} 
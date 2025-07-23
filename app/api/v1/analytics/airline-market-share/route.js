import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Ticket from "@/models/Ticket";

export async function GET(request) {
  try {
    await connectToDatabase();

    const year = 2025;

    // Aggregate confirmed bookings for 2025, grouped by airline
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
          airline: "$ticketInfo.airline",
          year: { $year: "$ticketInfo.dateOfJourney" },
        },
      },
      {
        $match: { year },
      },
      {
        $group: {
          _id: "$airline",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get airline names
    const airlineIds = bookings.map(b => b._id);
    let airlines = [];
    if (airlineIds.length > 0) {
      const Airline = (await import("@/models/Airline")).default;
      airlines = await Airline.find({ _id: { $in: airlineIds } }, "_id name");
    }
    const airlineMap = new Map(airlines.map(a => [a._id.toString(), a.name]));

    // Calculate total
    const total = bookings.reduce((sum, b) => sum + b.count, 0);
    const result = bookings.map(b => ({
      airline: airlineMap.get(b._id?.toString()) || "Unknown",
      count: b.count,
      percent: total > 0 ? (b.count / total) : 0,
    }));

    return new NextResponse(
      JSON.stringify(result),
      {
        status: 200,
        
      }
    );
  } catch (error) {
    console.error("Error fetching airline market share:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch airline market share" },
      { status: 500 }
    );
  }
} 
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET(request) {
  try {
    await connectToDatabase();

    const year = 2025;

    const monthlyBookings = await Booking.aggregate([
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
      {
        $unwind: "$ticketInfo",
      },
      {
        $project: {
          year: { $year: "$ticketInfo.dateOfJourney" },
          month: { $month: "$ticketInfo.dateOfJourney" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

   
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const chartData = monthNames.map((name, index) => {
      const monthData = monthlyBookings.find((item) => item._id === index + 1);
      return {
        name,
        total: monthData ? monthData.count : 0,
      };
    });

    return new NextResponse(
      JSON.stringify(chartData),
      {
        status: 200,
        
      }
    );
  } catch (error) {
    console.error("Error fetching monthly bookings analytics:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET() {
  try {
    await connectToDatabase();

    const users = await User.find({}, { password: 0 })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    const bookingAgg = await Booking.aggregate([
      { $match: { bookingStatus: "Confirmed" } },
      {
        $group: {
          _id: "$user",
          totalPaid: { $sum: { $ifNull: ["$agentCredit", 0] } },
          totalDue: { $sum: { $ifNull: ["$agentOutstanding", 0] } },
        },
      },
    ]);

    const bookingMap = {};
    bookingAgg.forEach((item) => {
      bookingMap[item._id?.toString()] = {
        totalPaid: item.totalPaid,
        totalDue: item.totalDue,
      };
    });

    const usersWithLedger = users.map((user) => {
      const ledger = bookingMap[user._id?.toString()] || { totalPaid: 0, totalDue: 0 };
      return {
        ...user,
        totalPaid: ledger.totalPaid,
        totalDue: ledger.totalDue,
        status: user.status || 'pending',
      };
    });

    return NextResponse.json(
      {
        message: "Users fetched successfully",
        data: usersWithLedger,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

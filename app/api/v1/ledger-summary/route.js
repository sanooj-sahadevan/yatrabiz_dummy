import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import CustomerLedger from "@/models/CustomerLedger";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const airline = searchParams.get("airline");
    const customer = searchParams.get("customer");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = endDateTime;
      }
    }

    if (type === "customer") {
      // Customer ledger summary
      const customerFilter = { ...dateFilter };
      if (airline) customerFilter.airline = { $regex: airline, $options: "i" };

      const summary = await CustomerLedger.aggregate([
        { $match: customerFilter },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $lookup: {
            from: "airlines",
            localField: "airline",
            foreignField: "_id",
            as: "airlineInfo",
          },
        },
        {
          $unwind: "$userDetails",
        },
        {
          $unwind: "$airlineInfo",
        },
        {
          $group: {
            _id: customer ? "$userDetails.name" : "$airlineInfo.name",
            airlineCode: { $first: "$airlineInfo.code" },
            totalEntries: { $sum: 1 },
            totalPayment: { $sum: { $ifNull: ["$totalPayment", 0] } },
            totalCredit: { $sum: { $ifNull: ["$credit", 0] } },
            totalDue: {
              $sum: {
                $subtract: [
                  { $ifNull: ["$totalPayment", 0] },
                  { $ifNull: ["$credit", 0] },
                ],
              },
            },
            activeEntries: {
              $sum: {
                $cond: [
                  {
                    $gt: [
                      {
                        $subtract: [
                          { $ifNull: ["$totalPayment", 0] },
                          { $ifNull: ["$credit", 0] },
                        ],
                      },
                      0,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            paidEntries: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      {
                        $subtract: [
                          { $ifNull: ["$totalPayment", 0] },
                          { $ifNull: ["$credit", 0] },
                        ],
                      },
                      0,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const overallSummary = await CustomerLedger.aggregate([
        { $match: customerFilter },
        {
          $group: {
            _id: { user: "$user", airline: "$airline" },
            totalPayment: { $sum: "$totalPayment" },
            totalCredit: { $sum: "$credit" },
            totalDue: { $sum: { $subtract: ["$totalPayment", "$credit"] } },
          },
        },
        {
          $group: {
            _id: null,
            totalEntries: { $sum: 1 },
            totalPayment: { $sum: "$totalPayment" },
            totalCredit: { $sum: "$totalCredit" },
            totalDue: { $sum: "$totalDue" },
            activeEntries: {
              $sum: { $cond: [{ $gt: ["$totalDue", 0] }, 1, 0] },
            },
            paidEntries: { $sum: { $cond: [{ $eq: ["$totalDue", 0] }, 1, 0] } },
          },
        },
      ]);

      return NextResponse.json({
        success: true,
        data: {
          customerSummary: summary,
          overallSummary: overallSummary[0] || {
            totalEntries: 0,
            totalPayment: 0,
            totalCredit: 0,
            totalDue: 0,
            activeEntries: 0,
            paidEntries: 0,
          },
        },
      });
    } else {
      // Return both summaries if no type specified
      const customerSummary = await CustomerLedger.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalEntries: { $sum: 1 },
            totalPayment: { $sum: { $ifNull: ["$totalPayment", 0] } },
            totalCredit: { $sum: { $ifNull: ["$credit", 0] } },
            totalDue: {
              $sum: {
                $subtract: [
                  { $ifNull: ["$totalPayment", 0] },
                  { $ifNull: ["$credit", 0] },
                ],
              },
            },
          },
        },
      ]);

      return NextResponse.json({
        success: true,
        data: {
          customerSummary: customerSummary[0] || {
            totalEntries: 0,
            totalPayment: 0,
            totalCredit: 0,
            totalDue: 0,
          },
        },
      });
    }
  } catch (error) {
    console.error("Error fetching ledger summary:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch ledger summary" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET(request) {
	try {
		await connectToDatabase();

		const topAgents = await Booking.aggregate([
			{
				$match: {
					bookingStatus: "Confirmed",
				},
			},
			{
				$group: {
					_id: "$user",
					bookingCount: { $sum: 1 },
					totalAmount: { $sum: "$totalAmount" },
				},
			},
			{
				$sort: { bookingCount: -1 },
			},
			{
				$limit: 10,
			},
			{
				$lookup: {
					from: "users",
					localField: "_id",
					foreignField: "_id",
					as: "userDetails",
				},
			},
			{
				$unwind: "$userDetails",
			},
			{
				$project: {
					_id: 0,
					agentId: "$_id",
					agentName: "$userDetails.name",
					bookingCount: "$bookingCount",
					totalAmount: { $round: ["$totalAmount", 2] },
				},
			},
		]);

		return new NextResponse(
			JSON.stringify(topAgents),
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
			{ message: "Failed to fetch top booking agents", error: error.message },
			{ status: 500 },
		);
	}
} 
import { connectToDatabase } from "@/lib/mongodb";
import Airline from "@/models/Airline";

export async function getAirlines() {
  try {
    await connectToDatabase();

    const airlines = await Airline.find({}).sort({ name: 1 }).lean();

    const serializedAirlines = airlines.map((airline) => ({
      ...airline,
      _id: airline._id.toString(),
      createdAt: airline.createdAt?.toISOString?.() || airline.createdAt,
      updatedAt: airline.updatedAt?.toISOString?.() || airline.updatedAt,
    }));

    return serializedAirlines;
  } catch (error) {
    console.error("Error fetching airlines:", error);
    throw new Error("Failed to fetch airlines");
  }
}

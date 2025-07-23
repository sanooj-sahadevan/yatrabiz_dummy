import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import AgentSearchHistory from "@/models/AgentSearchHistory";
import Airline from "@/models/Airline";
import Location from "@/models/Location";
import User from "@/models/User";
import { jwtVerify } from "jose";

const getUserFromToken = async (request) => {
  try {
    const userToken = request.cookies.get("userToken")?.value;
    const adminToken = request.cookies.get("adminToken")?.value;
    let payload = null;
    let id = null;
    if (userToken) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      ({ payload } = await jwtVerify(userToken, secret));
      id = payload.id;
    } else if (adminToken) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      ({ payload } = await jwtVerify(adminToken, secret));
      id = payload.id;
    } else {
      return null;
    }
    return {
      id,
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

export async function POST(request) {
  try {
    await connectToDatabase();
    const currentUser = await getUserFromToken(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "User authentication required" },
        { status: 401 }
      );
    }
    const body = await request.json();
    const { airline, departureLocation, arrivalLocation, journeyDate } = body;

    // Find airline by name if provided
    let airlineId = null;
    if (airline) {
      const airlineDoc = await Airline.findOne({ name: airline });
      airlineId = airlineDoc?._id;
    }

    // Find departure location by code if provided
    let departureLocationId = null;
    if (departureLocation) {
      const departureDoc = await Location.findOne({ code: departureLocation });
      departureLocationId = departureDoc?._id;
    }

    // Find arrival location by code if provided
    let arrivalLocationId = null;
    if (arrivalLocation) {
      const arrivalDoc = await Location.findOne({ code: arrivalLocation });
      arrivalLocationId = arrivalDoc?._id;
    }

    // Use logged-in user's id
    const userObjectId = currentUser.id;
    if (!userObjectId) {
      return NextResponse.json(
        { error: "User (agent) is required for search history." },
        { status: 400 }
      );
    }

    // Create search history record
    const searchHistory = new AgentSearchHistory({
      airline: airlineId,
      departureLocation: departureLocationId,
      arrivalLocation: arrivalLocationId,
      journeyDate: journeyDate ? new Date(journeyDate) : null,
      searchTime: new Date(),
      user: userObjectId,
    });

    await searchHistory.save();

    return NextResponse.json(
      { message: "Search history saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving search history:", error);
    return NextResponse.json(
      { error: "Failed to save search history" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 50;

    const searchHistory = await AgentSearchHistory.find()
      .populate("airline", "name code")
      .populate("departureLocation", "name code")
      .populate("arrivalLocation", "name code")
      .populate({
        path: "user",
        select: "name username email",
        strictPopulate: false,
      })
      .sort({ searchTime: -1 })
      .limit(limit);
   

    return new NextResponse(
      JSON.stringify({ data: searchHistory }),
      {
        status: 200,
      
      }
    );
  } catch (error) {
    console.error("Error fetching search history:", error);
    return NextResponse.json(
      { error: "Failed to fetch search history" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Airline from "@/models/Airline";
import AirlineAuditLog from "@/models/AirlineAuditLog";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectToDatabase();

    const airlines = await Airline.find({}).sort({ name: 1 }).lean();

    return NextResponse.json(
      {
        success: true,
        data: airlines,
      },
      {
        status: 200,
       
      }
    );
  } catch (error) {
    console.error("Error fetching airlines:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch airlines" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      name,
      code,
      contactEmail,
      contactPhone,
      adminId,
      headerImageBase64,
    } = body;

    if (!name || !code || !adminId) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, code, and adminId are required",
        },
        { status: 400 }
      );
    }

    const existingAirline = await Airline.findOne({
      $or: [{ name }, { code: code.toUpperCase() }],
    });

    if (existingAirline) {
      return NextResponse.json(
        {
          success: false,
          message: "Airline with this name or code already exists",
        },
        { status: 400 }
      );
    }

    const airline = new Airline({
      name,
      code,
      contactEmail,
      contactPhone,
      headerImageBase64,
    });

    await airline.save();

    const airlineData = airline.toObject();
    delete airlineData.__v;

    const changes = {};
    for (const key in airlineData) {
      if (key !== "_id" && key !== "createdAt" && key !== "updatedAt") {
        changes[key] = { from: null, to: airlineData[key] };
      }
    }

    try {
      await AirlineAuditLog.create({
        adminId: new mongoose.Types.ObjectId(adminId),
        action: "CREATE",
        changes,
        airline: airlineData,
      });
    } catch (logErr) {
      console.error("AirlineAuditLog CREATE failed:", logErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Airline created successfully",
        data: airlineData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating airline:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        { success: false, message: validationErrors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create airline" },
      { status: 500 }
    );
  }
}

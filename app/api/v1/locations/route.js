import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Location from '@/models/Location';
import LocationAuditLog from '@/models/LocationAuditLog';
// import { revalidateTag } from 'next/cache';
import mongoose from 'mongoose';


export async function GET(request) {
  try {
    await connectToDatabase();
    const locations = await Location.find({});

    return NextResponse.json(
      {
        message: "Locations fetched successfully",
        data: locations,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


// ✅ POST handler in /api/v1/locations/route.js
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, code, adminId } = body;

    const newLocation = await Location.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
    });

    // await revalidateTag("locations"); // Manual cache purge

    return NextResponse.json({
      success: true,
      message: "Location created successfully",
      data: newLocation,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create location",
        error: error.message,
      },
      { status: 500 }
    );
  }
}


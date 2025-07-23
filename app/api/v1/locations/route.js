import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Location from '@/models/Location';
import LocationAuditLog from '@/models/LocationAuditLog';
import { revalidateTag } from 'next/cache';
import mongoose from 'mongoose';

// GET - Fetch all locations
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    let locations;
    if (query) {
      // Search by name or code, case-insensitive
      locations = await Location.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { code: { $regex: query, $options: 'i' } },
        ],
      }).select('name code').limit(10);
    } else {
      // Return all locations, limited to avoid huge payloads
      locations = await Location.find({});
    }
    
    return NextResponse.json({
      message: 'Locations fetched successfully',
      data: locations,
    }, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30"
      }
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new location
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { name, code, adminId } = body;

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Name and code are required' 
        },
        { status: 400 }
      );
    }

    // Check if location with same code already exists
    const existingLocation = await Location.findOne({ code: code.toUpperCase() });
    if (existingLocation) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Location with this code already exists' 
        },
        { status: 400 }
      );
    }

    // Create new location
    const newLocation = new Location({
      name: name.trim(),
      code: code.toUpperCase().trim(),
    });

    await newLocation.save();

    const locationData = newLocation.toObject();
    delete locationData.__v;

    // Log creation changes (all fields from null to new value)
    const changes = {};
    for (const key in locationData) {
      if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
        changes[key] = { from: null, to: locationData[key] };
      }
    }

    try {
      await LocationAuditLog.create({
        adminId: new mongoose.Types.ObjectId(adminId),
        action: "CREATE",
        changes,
        location: locationData,
      });
    } catch (logErr) {
      console.error("LocationAuditLog CREATE failed:", logErr);
    }

    revalidateTag('locations');

    return NextResponse.json({
      success: true,
      message: 'Location created successfully',
      data: locationData,
    });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to create location',
        error: error.message 
      },
      { status: 500 }
    );
  }
} 
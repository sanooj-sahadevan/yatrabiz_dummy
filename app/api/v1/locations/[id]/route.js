import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Location from "@/models/Location";
import LocationAuditLog from "@/models/LocationAuditLog";
import { revalidatePath, revalidateTag } from "next/cache";
import mongoose from "mongoose";

function getChanges(oldData, newData) {
  const changes = {};
  for (const key in newData) {
    if (oldData[key] !== newData[key]) {
      changes[key] = {
        from: oldData[key],
        to: newData[key],
      };
    }
  }
  return changes;
}

// GET - Fetch a specific location by ID
export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Location ID is required" },
        { status: 400 }
      );
    }

    const location = await Location.findById(id);

    if (!location) {
      return NextResponse.json(
        { success: false, message: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Location fetched successfully",
        data: location,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=3",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch location",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update a location
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();
    const { name, code, adminId } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Location ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !code || !adminId) {
      return NextResponse.json(
        { success: false, message: "Name and code are required" },
        { status: 400 }
      );
    }

    const existingLocation = await Location.findById(id).lean();

    if (!existingLocation) {
      return NextResponse.json(
        { success: false, message: "Location not found" },
        { status: 404 }
      );
    }

    // Check if location with same code already exists (excluding current location)
    const duplicateLocation = await Location.findOne({
      code: code.toUpperCase(),
      _id: { $ne: id },
    });

    if (duplicateLocation) {
      return NextResponse.json(
        { success: false, message: "Location with this code already exists" },
        { status: 400 }
      );
    }

    // Update location
    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        code: code.toUpperCase().trim(),
      },
      { new: true, runValidators: true }
    );

    const locationData = updatedLocation.toObject();
    delete locationData.__v;

    const changes = getChanges(existingLocation, locationData);

    if (Object.keys(changes).length > 0 && adminId) {
      try {
        await LocationAuditLog.create({
          adminId: new mongoose.Types.ObjectId(adminId),
          action: "UPDATE",
          changes,
          location: locationData,
        });
      } catch (logErr) {
        console.error("LocationAuditLog UPDATE failed:", logErr);
      }
    }

    await revalidatePath("/admin/location");

    return NextResponse.json({
      success: true,
      message: "Location updated successfully",
      data: locationData,
    });
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update location",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a location
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    // Handle empty request body gracefully
    let adminId = null;
    try {
      const body = await request.json();
      adminId = body.adminId;
    } catch (jsonError) {
      // Request body is empty or invalid JSON, continue without adminId
      console.error("No adminId provided in DELETE request body");
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Location ID is required" },
        { status: 400 }
      );
    }

    const existingLocation = await Location.findById(id).lean();

    if (!existingLocation) {
      return NextResponse.json(
        { success: false, message: "Location not found" },
        { status: 404 }
      );
    }

    await Location.findByIdAndDelete(id);

    // Only create audit log if adminId is provided
    if (adminId) {
      // Prepare changes object (all fields from existing value to null)
      const changes = {};
      for (const key in existingLocation) {
        if (
          key !== "_id" &&
          key !== "createdAt" &&
          key !== "updatedAt" &&
          key !== "__v"
        ) {
          changes[key] = { from: existingLocation[key], to: null };
        }
      }

      try {
        await LocationAuditLog.create({
          adminId: new mongoose.Types.ObjectId(adminId),
          action: "DELETE",
          changes,
          location: existingLocation,
        });
      } catch (logErr) {
        console.error("LocationAuditLog DELETE failed:", logErr);
      }
    }

    revalidateTag("locations");

    return NextResponse.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting location:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete location",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

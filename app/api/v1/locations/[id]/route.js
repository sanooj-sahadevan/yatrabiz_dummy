import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Location from "@/models/Location";
import LocationAuditLog from "@/models/LocationAuditLog";
// import { revalidateTag } from "next/cache";
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

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

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
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
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

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const { name, code, adminId } = await request.json();

    if (!id || !name || !code || !adminId) {
      return NextResponse.json(
        { success: false, message: "ID, name, code, and adminId are required" },
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

    const duplicate = await Location.findOne({
      code: code.toUpperCase(),
      _id: { $ne: id },
    });
    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "Location with this code already exists" },
        { status: 400 }
      );
    }

    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      { name: name.trim(), code: code.toUpperCase().trim() },
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

    // await revalidateTag("locations");

    return NextResponse.json({
      success: true,
      message: "Location updated successfully",
      data: locationData,
    });
  } catch (error) {
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

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    let adminId = null;
    try {
      const body = await request.json();
      adminId = body.adminId;
    } catch (err) {
      console.warn("No adminId provided in DELETE request body");
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

    if (adminId) {
      const changes = {};
      for (const key in existingLocation) {
        if (!["_id", "createdAt", "updatedAt", "__v"].includes(key)) {
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

    // await revalidateTag("locations");

    return NextResponse.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
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

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Airline from "@/models/Airline";
import AirlineAuditLog from "@/models/AirlineAuditLog";
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

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      code,
      contactEmail,
      contactPhone,
      isActive,
      adminId,
      headerImageBase64,
    } = body;

    // Validate required fields
    if (!name || !code || !adminId) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, code, and adminId are required",
        },
        { status: 400 }
      );
    }

    // Check if airline exists
    const existingAirline = await Airline.findById(id).lean();
    if (!existingAirline) {
      return NextResponse.json(
        { success: false, message: "Airline not found" },
        { status: 404 }
      );
    }

    // Check if another airline with same name or code already exists
    const duplicateAirline = await Airline.findOne({
      _id: { $ne: id },
      $or: [{ name }, { code: code.toUpperCase() }],
    });

    if (duplicateAirline) {
      return NextResponse.json(
        {
          success: false,
          message: "Airline with this name or code already exists",
        },
        { status: 400 }
      );
    }

    const updateFields = {
      name,
      code,
      contactEmail,
      contactPhone,
      isActive: isActive !== undefined ? isActive : existingAirline.isActive,
    };
    if (typeof headerImageBase64 === "string") {
      updateFields.headerImageBase64 = headerImageBase64;
    }

    const updatedAirline = await Airline.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    const airlineData = updatedAirline.toObject();
    delete airlineData.__v;

    const changes = getChanges(existingAirline, airlineData);

    if (Object.keys(changes).length > 0 && adminId) {
      try {
        await AirlineAuditLog.create({
          adminId: new mongoose.Types.ObjectId(adminId),
          action: "UPDATE",
          changes,
          airline: airlineData,
        });
      } catch (logErr) {
        console.error("AirlineAuditLog UPDATE failed:", logErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Airline updated successfully",
      data: airlineData,
    });
  } catch (error) {
    console.error("Error updating airline:", error);

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
      { success: false, message: "Failed to update airline" },
      { status: 500 }
    );
  }
}

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

    // Check if airline exists
    const existingAirline = await Airline.findById(id).lean();
    if (!existingAirline) {
      return NextResponse.json(
        { success: false, message: "Airline not found" },
        { status: 404 }
      );
    }

    await Airline.findByIdAndDelete(id);

    // Only create audit log if adminId is provided
    if (adminId) {
      // Prepare changes object (all fields from existing value to null)
      const changes = {};
      for (const key in existingAirline) {
        if (
          key !== "_id" &&
          key !== "createdAt" &&
          key !== "updatedAt" &&
          key !== "__v"
        ) {
          changes[key] = { from: existingAirline[key], to: null };
        }
      }

      try {
        await AirlineAuditLog.create({
          adminId: new mongoose.Types.ObjectId(adminId),
          action: "DELETE",
          changes,
          airline: existingAirline,
        });
      } catch (logErr) {
        console.error("AirlineAuditLog DELETE failed:", logErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Airline deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting airline:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete airline" },
      { status: 500 }
    );
  }
}

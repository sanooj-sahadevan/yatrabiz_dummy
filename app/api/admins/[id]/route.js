import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose"; 
import Admin from "@/models/Admin";
import AuditLog from "@/models/AdminAuditLog";
import { NextResponse } from "next/server";

function getChanges(oldData, newData) {
  const changes = {};
  for (const key in newData) {
    if (key === "password") continue;
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

    const { id } = params;
    const updates = await request.json();
    const { performedBy, ...adminUpdates } = updates;

    if (!performedBy || typeof performedBy !== "string") {
      return NextResponse.json(
        { message: "Invalid performedBy" },
        { status: 400 }
      );
    }

    const existingAdmin = await Admin.findById(id).lean();
    if (!existingAdmin) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    // Update admin
    const updatedAdminDoc = await Admin.findByIdAndUpdate(id, adminUpdates, {
      new: true,
    });

    if (!updatedAdminDoc) {
      return NextResponse.json({ message: "Update failed" }, { status: 400 });
    }

    const updatedAdmin = updatedAdminDoc.toObject();
    delete updatedAdmin.password;

    const changes = getChanges(existingAdmin, updatedAdmin);

    if (Object.keys(changes).length > 0) {
      try {
        await AuditLog.create({
          entity: "Admin",
          entityId: updatedAdmin._id,
          changedBy: performedBy,
          action: "UPDATE",
          changes,
          person: updatedAdmin,
        });
      } catch (logErr) {
        console.error("AuditLog UPDATE failed:", logErr);
      }
    }

    return NextResponse.json({ message: "Admin updated", data: updatedAdmin });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}



export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = params;
    const { performedBy } = await request.json();

    if (!performedBy || typeof performedBy !== "string") {
      return NextResponse.json({ message: "Invalid performedBy" }, { status: 400 });
    }

    const existingAdmin = await Admin.findById(id).lean();
    if (!existingAdmin) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    const deleted = await Admin.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Delete failed" }, { status: 400 });
    }

    // Prepare changes object (excluding password)
    const changes = {};
    for (const key in existingAdmin) {
      if (key === "password") continue;
      changes[key] = { from: existingAdmin[key], to: null };
    }

    try {
      await AuditLog.create({
        entity: "Admin",
        entityId: new mongoose.Types.ObjectId(id), // ensure mongoose imported
        changedBy: performedBy,
        action: "DELETE",
        changes,
        person: existingAdmin, // already plain object from lean()
      });
    } catch (logErr) {
      console.error("AuditLog DELETE failed:", logErr);
    }

    return NextResponse.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

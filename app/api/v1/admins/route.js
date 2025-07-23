import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Admin from "@/models/Admin";
import AuditLog from "@/models/AdminAuditLog";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";
import { VALID_ADMIN_ROLES } from "@/constants/adminRoles";

async function getAdminFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken");
  return token;
}

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

export async function GET() {
  try {
    await connectToDatabase();

    const token = await getAdminFromRequest();
    if (!token || !token.value) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const admins = await Admin.find({}, { password: 0 });

    return NextResponse.json({ message: "Admins fetched", data: admins }, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { name, email, password, role, performedBy } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Name, email, and password are required" }, { status: 400 });
    }

    // Validate role if provided
    if (role && !VALID_ADMIN_ROLES.includes(role)) {
      return NextResponse.json({ message: `Invalid role. Must be one of: ${VALID_ADMIN_ROLES.join(", ")}` }, { status: 400 });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json({ message: "Admin with this email exists" }, { status: 400 });
    }

    const admin = new Admin({
      name,
      email,
      password,
      role: role || "viewer",
    });

    await admin.save();

    const adminData = admin.toObject();
    delete adminData.password;
    const cleanedAdminData = JSON.parse(JSON.stringify(adminData));

    // Log creation changes (all fields from null to new value)
    const changes = {};
    for (const key in cleanedAdminData) {
      changes[key] = { from: null, to: cleanedAdminData[key] };
    }

    try {
      await AuditLog.create({
        entity: "Admin",
        entityId: new mongoose.Types.ObjectId(admin._id),
        changedBy: performedBy,
        action: "CREATE",
        changes,
        person: cleanedAdminData,
      });
    } catch (logErr) {
      console.error("AuditLog CREATE failed:", logErr);
    }

    return NextResponse.json({ message: "Admin created", data: cleanedAdminData }, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}



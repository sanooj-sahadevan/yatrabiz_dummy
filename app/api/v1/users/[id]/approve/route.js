import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req, context) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    user.status = "approved";
    user.approvedAt = new Date();
    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    return NextResponse.json({ message: "User approved successfully", data: userObj }, { status: 200 });
  } catch (error) {
    console.error("Error approving user:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
} 
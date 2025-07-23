import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

export async function PATCH(req, context) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { message: "Name and email are required." },
        { status: 400 }
      );
    }

    // Find user by id
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Update fields
    user.name = name;
    user.email = email.trim();
    await user.save();

    // Exclude password from response
    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json(
      { message: "User updated successfully", data: userObj },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req, context) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ message: "Old and new passwords are required." }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Check old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return NextResponse.json({ message: "Old password is incorrect." }, { status: 401 });
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json({ message: "Password changed successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

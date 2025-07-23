import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Admin from "@/models/Admin";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request) {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    const { emailOrName, password, type = "user" } = await request.json();
    if (!emailOrName || !password) {
      return NextResponse.json(
        { success: false, message: "Email/Name and password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const UserModel = type === "admin" ? Admin : User;

    let user;
    user = await UserModel.findOne({
      $or: [{ email: emailOrName.toLowerCase() }, { name: emailOrName }],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (type !== "admin") {
      if (user.status === "pending") {
        return NextResponse.json(
          {
            success: false,
            message: "Your account is pending admin approval.",
          },
          { status: 403 }
        );
      }
      if (user.status === "rejected") {
        return NextResponse.json(
          {
            success: false,
            message: "Your account has been rejected. Please contact support.",
          },
          { status: 403 }
        );
      }
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { email: user.email, role: user.role, id: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        email: user.email,
        role: user.role,
        name: user.name,
        id: user._id,
      },
    });

    response.cookies.set({
      name: type === "admin" ? "adminToken" : "userToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during login" },
      { status: 500 }
    );
  }
}

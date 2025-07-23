import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request) {
  try {
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    const {
      email,
      password,
      name,
      phoneNumber,
      panCardNumber,
      aadhaarNumber,
      gstOrUdyog,
      gstNumber,
      udyogNumber,
    } = await request.json();

    if (
      !email ||
      !password ||
      !name ||
      !phoneNumber ||
      !panCardNumber ||
      !aadhaarNumber
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, email, password, phone number, PAN card number, and Aadhaar card number are required",
        },
        { status: 400 }
      );
    }

    if (gstOrUdyog === "gst" && !gstNumber) {
      return NextResponse.json(
        { success: false, message: "GST number is required" },
        { status: 400 }
      );
    }
    if (gstOrUdyog === "udyog" && !udyogNumber) {
      return NextResponse.json(
        { success: false, message: "Udyog number is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUserByEmail = await User.findOne({
      email: email.toLowerCase(),
    });
    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    const existingUserByName = await User.findOne({ name: name.trim() });
    if (existingUserByName) {
      return NextResponse.json(
        { success: false, message: "Name already taken" },
        { status: 409 }
      );
    }

    const existingUserByPhone = await User.findOne({
      phoneNumber: phoneNumber.trim(),
    });
    if (existingUserByPhone) {
      return NextResponse.json(
        { success: false, message: "Phone number already registered" },
        { status: 409 }
      );
    }

    const existingUserByPAN = await User.findOne({
      panCardNumber: panCardNumber.toUpperCase(),
    });
    if (existingUserByPAN) {
      return NextResponse.json(
        { success: false, message: "PAN card number already registered" },
        { status: 409 }
      );
    }

    const existingUserByAadhaar = await User.findOne({
      aadhaarNumber: aadhaarNumber.trim(),
    });
    if (existingUserByAadhaar) {
      return NextResponse.json(
        { success: false, message: "Aadhaar card number already registered" },
        { status: 409 }
      );
    }
    if (gstOrUdyog === "gst" && gstNumber) {
      const existingUserByGST = await User.findOne({
        gstNumber: gstNumber.toUpperCase(),
      });
      if (existingUserByGST) {
        return NextResponse.json(
          { success: false, message: "GST number already registered" },
          { status: 409 }
        );
      }
    }
    if (gstOrUdyog === "udyog" && udyogNumber) {
      const existingUserByUdyog = await User.findOne({
        udyogNumber: udyogNumber.trim(),
      });
      if (existingUserByUdyog) {
        return NextResponse.json(
          { success: false, message: "Udyog number already registered" },
          { status: 409 }
        );
      }
    }

    const userData = {
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      phoneNumber: phoneNumber.trim(),
      panCardNumber: panCardNumber.toUpperCase(),
      aadhaarNumber: aadhaarNumber.trim(),
      gstNumber: gstOrUdyog === "gst" ? gstNumber.toUpperCase() : undefined,
      udyogNumber: gstOrUdyog === "udyog" ? udyogNumber.trim() : undefined,
    };

    const newUser = new User(userData);
    await newUser.save();

    return NextResponse.json({
      success: true,
      message:
        "Registration successful. Your account is pending admin approval.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during registration" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function GET(req) {
  try {
    const adminToken = req.cookies.get("adminToken")?.value;
    const userToken = req.cookies.get("userToken")?.value;
    
    let token = adminToken || userToken;
    let tokenType = adminToken ? "admin" : "user";

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token found" },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({
      success: true,
      user: {
        name: payload.name,
        email: payload.email,
        role: payload.role,
        id: payload.id,
        type: tokenType
      },
    });
  } catch (error) {
    console.error("JWT verification error:", error);
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

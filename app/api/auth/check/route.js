import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function GET(request) {
  try {
    // Check for both admin and user tokens
    const adminToken = request.cookies.get("adminToken")?.value;
    const userToken = request.cookies.get("userToken")?.value;
    
    let token = adminToken || userToken;
    let tokenType = adminToken ? "admin" : "user";

    if (!token) {
      return new NextResponse(null, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: payload.id,
          email: payload.email,
          name: payload.name,
          role: payload.role,
          type: tokenType
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth check failed:", error);
    return new NextResponse(null, { status: 401 });
  }
}

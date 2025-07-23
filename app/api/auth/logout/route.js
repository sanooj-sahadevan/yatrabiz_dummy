import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { type = 'admin' } = await request.json();
    
    // Create the response
    const response = NextResponse.json({ 
      success: true,
      message: "Logged out successfully"
    });

    // Clear the appropriate token cookie
    const tokenName = type === 'admin' ? 'adminToken' : 'userToken';
    
    response.cookies.set({
      name: tokenName,
      value: "",
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: "/"
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "An error occurred during logout" 
      },
      { status: 500 }
    );
  }
}

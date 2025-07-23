import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  const adminToken = request.cookies.get("adminToken")?.value;
  const userToken = request.cookies.get("userToken")?.value;

  const verifyToken = async (token) => {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      return payload;
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  };

  // Public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path === "/admin" ||
    path === "/admin/logout" ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/v1/auth") ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon.ico") ||
    path === "/about" ||
    path === "/contact";

  // Protected admin paths
  const isProtectedAdminPath =
    path.startsWith("/admin") &&
    path !== "/admin" &&
    path !== "/admin/logout" &&
    !path.startsWith("/api");

  // Protected user paths that require authentication
  const isProtectedUserPath = 
    path.startsWith("/user") ||
    path.startsWith("/profile") ||
    path.startsWith("/bookings") ||
    path === "/my-bookings" ||
    path === "/flights" ||
    path === "/tickets" ||
    path.startsWith("/tickets/");

  // Handle admin authentication
  if (isProtectedAdminPath) {
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    const verified = await verifyToken(adminToken);
    if (!verified) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Check role-based access for staff users
    if (verified.role === "staff" || verified.role === "supplier") {
      const restrictedRoutes = [
        "/admin/dashboard",
        "/admin/admins", 
        "/admin/agents",
        "/admin/ledger",
        "/admin/audit"
      ];
      
      if (restrictedRoutes.includes(path)) {
        return NextResponse.redirect(new URL("/admin/tickets", request.url));
      }
    }
  }

  // Handle user authentication for protected user paths
  if (isProtectedUserPath) {
    if (!userToken) {
      const url = new URL("/", request.url);
      url.searchParams.set("reason", "login-required");
      return NextResponse.redirect(url);
    }

    const verified = await verifyToken(userToken);
    if (!verified) {
      const url = new URL("/", request.url);
      url.searchParams.set("reason", "login-required");
      return NextResponse.redirect(url);
    }
  }

  // Handle redirects for authenticated admins
  if (path === "/" && adminToken) {
    const verified = await verifyToken(adminToken);
    if (verified) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  if (path === "/admin" && adminToken) {
    const verified = await verifyToken(adminToken);
    if (verified) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }


  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

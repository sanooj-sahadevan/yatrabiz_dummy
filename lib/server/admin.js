function getApiUrl(path) {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}${path}`;
  }
  return path;
}

import { cookies } from "next/headers"; 
import { API_ENDPOINTS } from "@/constants/api";

export async function getAdminSession() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("adminToken");

  if (!sessionCookie) return null;

  try {
    const res = await fetch(getApiUrl(API_ENDPOINTS.AUTH.SESSION), {
      headers: {
        cookie: `adminToken=${sessionCookie.value}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.success) return null;

    return data.user;
  } catch (err) {
    console.error("Failed to fetch admin session:", err);
    return null;
  }
}

export async function getAdmins() {
  try {
    const res = await fetch(getApiUrl(API_ENDPOINTS.ADMIN.LIST), {
      cache: "no-store",
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.message || "Failed to fetch admins");
    }

    const result = await res.json();
    return result.data || [];
  } catch (err) {
    console.error("Error fetching admins:", err);
    return [];
  }
}

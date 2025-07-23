function getApiUrl(path) {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}${path}`;
  }
  return path;
}

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function getBookingRequest() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("adminToken")?.value || "";
    const cookieString = adminToken ? `adminToken=${adminToken}` : "";

    const res = await fetch(
      getApiUrl('/api/v1/bookings'),
      {
  cache: "no-store",
    headers: {
      Accept: "application/json",
    },
      }
    );

    if (!res.ok) {
      const result = await res.json();
      throw new Error(
        result.message || result.error || "Failed to fetch Booking Request"
      );
    }

    const result = await res.json();
    return result || [];
  } catch (err) {
    console.error("Error fetching Booking Request:", err);
    throw err;
  }
}

// Function to revalidate booking request cache
export async function revalidateBookingRequest() {
  revalidateTag("bookingRequest");
}

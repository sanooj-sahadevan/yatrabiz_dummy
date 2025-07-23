import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

function getApiUrl(path) {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}${path}`;
  }
  return path;
}

export async function getBookingRequest() {
  try {
    const cookieStore = await cookies(); // ✅ Correct: now using `await`
    const adminToken = cookieStore.get("adminToken")?.value || "";
    const cookieString = adminToken ? `adminToken=${adminToken}` : "";

    const res = await fetch(getApiUrl("/api/v1/bookings"), {
      next: {
        revalidate: 0,
        tags: ["bookingRequest"],
      },
      headers: {
        Accept: "application/json",
        ...(cookieString && { Cookie: cookieString }),
      },
    });

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

export async function revalidateBookingRequest() {
  revalidateTag("bookingRequest");
}

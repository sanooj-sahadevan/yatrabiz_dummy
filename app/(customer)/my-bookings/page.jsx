import { cookies } from "next/headers";
import { API_ENDPOINTS } from "@/constants/api";
import MyBookingsClient from "@/components/clientList/MyBookingsClient";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL;
}

async function getBookingsSSR() {
  const cookieStore = await cookies();
  const userToken = cookieStore.get("userToken")?.value;
  if (!userToken) return [];
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}${API_ENDPOINTS.BOOKING.LIST}`, {
    headers: { Cookie: `userToken=${userToken}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return await res.json();
}

export default async function MyBookingsPage() {
  const bookings = await getBookingsSSR();
  return <MyBookingsClient initialBookings={bookings} />;
}

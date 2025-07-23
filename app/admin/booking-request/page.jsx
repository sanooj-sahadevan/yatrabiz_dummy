export const dynamic = "force-dynamic";
import ToastNotifications from "@/components/common/toastNotifications/toastNotifications";
import { getBookingRequest } from "@/lib/server/getBookingRequest";
import { getAdminSessionSSR } from "@/lib/server/getAdminSessionSSR";
import BookingRequestClientTable from "@/components/clientList/bookingRequestClientTable";
import { cookies } from "next/headers";

export default async function BookingRequestList() {
  try {
    const bookingRequest = await getBookingRequest();

    const cookieStore = await cookies();
    const adminToken = cookieStore.get("adminToken")?.value || "";
    const cookieString = adminToken ? `adminToken=${adminToken}` : "";
    const { admin: currentAdmin, error } = await getAdminSessionSSR(
      cookieString
    );
    return (
      <>
        <ToastNotifications />
        <div className="p-6 min-h-screen">
          <BookingRequestClientTable
            data={bookingRequest}
            adminRole={currentAdmin}
          />
        </div>
      </>
    );
  } catch (error) {
    return (
      <div className="text-red-500 p-6">
        {error.message || "Failed to load booking request data."}
      </div>
    );
  }
}

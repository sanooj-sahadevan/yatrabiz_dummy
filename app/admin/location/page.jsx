// app/(admin)/locations/page.jsx
export const dynamic = "force-dynamic"; // 👈 force SSR on every request

import ToastNotifications from "@/components/common/toastNotifications/toastNotifications";
import LocationListClient from "@/components/clientList/locationListClient";
import { getLocation } from "@/lib/server/getLocation";
import { LOCATION_COLUMNS } from "@/constants/tableColumns";

export default async function LocationList() {
  try {
    const location = await getLocation();
    return (
      <>
        <ToastNotifications />
        <div className="p-6 min-h-screen">
          <LocationListClient
            location={location}
            columns={LOCATION_COLUMNS}
          />
        </div>
      </>
    );
  } catch (error) {
    return <div className="text-red-500 p-6">{error.message}</div>;
  }
}

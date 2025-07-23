export const dynamic = "force-dynamic"; // ✅ force fresh SSR, disables cache

import ToastNotifications from "@/components/common/toastNotifications/toastNotifications";
import LocationListClient from "@/components/clientList/locationListClient";
import { getLocation } from "@/lib/server/getLocation"; // use fetch

import { LOCATION_COLUMNS } from "@/constants/tableColumns";

export default async function LocationList() {
  try {
    const location = await getLocation(); 
    return (
      <>
        <ToastNotifications />
        <div className="p-6 min-h-screen">
          <LocationListClient location={location} columns={LOCATION_COLUMNS} />
        </div>
      </>
    );
  } catch (error) {
    return <div className="text-red-500 p-6">{error.message}</div>;
  }
}

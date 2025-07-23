export const dynamic = "force-dynamic";
import ToastNotifications from "@/components/common/toastNotifications/toastNotifications";
import AirlinesListClient from "@/components/clientList/airlinesListClient";
import { getAirlines } from "@/lib/server/getAirlines";
import { AIRLINES_COLUMNS } from "@/constants/tableColumns";

export default async function AirlinesList() {
  let airlines = [];

  try {
    airlines = await getAirlines();
  } catch (error) {
    return <div className="text-red-500 p-6">{error.message}</div>;
  }

  return (
    <>
      <ToastNotifications />
      <div className="p-6 min-h-screen">
        <AirlinesListClient airlines={airlines} columns={AIRLINES_COLUMNS} />
      </div>
    </>
  );
}

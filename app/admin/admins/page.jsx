import { cookies } from "next/headers";
import { getAdmins } from "@/lib/server/getAdmins";
import { ADMIN_COLUMNS } from "@/constants/tableColumns";
import AdminListClient from "@/components/clientList/adminListClient";
import ToastNotifications from "@/components/common/toastNotifications/toastNotifications";

export default async function AdminList() {
  let admins = [];

  try {
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();
    admins = await getAdmins(cookieString);
  } catch (error) {
    return <div className="text-red-500 p-6">{error.message}</div>;
  }

  return (
    <>
      <ToastNotifications />
      <div className="p-6 min-h-screen">
        <AdminListClient admins={admins} columns={ADMIN_COLUMNS} />
      </div>
    </>
  );
}

import { getUsers } from "@/lib/server/getUsers";
import AGTable from "@/components/admin/table/AGGrid";
import { USER_COLUMNS } from "@/constants/tableColumns";

export default async function UserList() {
  let users = [];

  try {
    users = await getUsers();
  } catch (error) {
    return <div className="text-red-500 p-6">{error.message}</div>;
  }

  return (
    <>
      <div className="p-6 min-h-screen">
        <AGTable data={users} columns={USER_COLUMNS} title="Agents" />
      </div>
    </>
  );
}

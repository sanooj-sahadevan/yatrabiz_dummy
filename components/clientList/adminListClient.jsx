"use client";

import { useState } from "react";
import { useAdminSession } from "@/hooks/useAdminSession";
import Table from "@/components/admin/table/AGGrid";
import AddAdminModal from "@/components/admin/modals/addAdminModal";
import EditAdminModal from "@/components/admin/modals/editAdminModal";
import { API_ENDPOINTS } from "@/constants/api";
import { useAdmin } from "@/hooks/useAdmin";

export default function AdminListClient({ admins: initialAdmins, columns }) {
  const [showModal, setShowModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);

  const {
    admin: currentAdmin,
    loading: adminLoading,
    error: adminError,
  } = useAdminSession();

  const {
    data: admins,
    loading: adminsLoading,
    error: adminsError,
    refetch,
    deleteData,
  } = useAdmin(API_ENDPOINTS.ADMIN.LIST, "Admins", currentAdmin, initialAdmins);

  const handleSuccess = () => {
    setShowModal(false);
    setEditAdmin(null);
    refetch();
  };

  const handleEditClick = (formData) => {
    const adminId = formData.get("id");
    const adminToEdit = admins.find((a) => a._id === adminId);
    if (adminToEdit) setEditAdmin(adminToEdit);
  };

  const handleDeleteClick = async (formData) => {
    const adminId = formData.get("id");
    const adminToDelete = admins.find((a) => a._id === adminId);
    if (!adminToDelete || !confirm(`Delete ${adminToDelete.name}?`)) return;

    try {
      await deleteData(adminId, {
        performedBy: {
          id: currentAdmin?._id,
          name: currentAdmin?.name,
          role: currentAdmin?.role,
        },
        deletedAdmin: {
          id: adminToDelete._id,
          name: adminToDelete.name,
        },
      });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const isLoading = adminsLoading || adminLoading;
  const error = adminsError || adminError;

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : (
        <>
          <Table
            data={admins}
            title="Admins"
            columns={columns}
            onAddClick={() => setShowModal(true)}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            adminRole={currentAdmin}
            tableContext="admins"
          />
          {showModal && (
            <AddAdminModal
              currentAdmin={currentAdmin}
              onClose={() => setShowModal(false)}
              onSuccess={handleSuccess}
            />
          )}
          {editAdmin && (
            <EditAdminModal
              currentAdmin={currentAdmin}
              admin={editAdmin}
              onClose={() => setEditAdmin(null)}
              onSuccess={handleSuccess}
            />
          )}
        </>
      )}
    </>
  );
}

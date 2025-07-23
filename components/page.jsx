"use client";
import { useState } from "react";
import Table from "@/components/admin/table/table";
import AddAdminModal from "@/components/admin/modals/addAdminModal";
import EditAdminModal from "@/components/admin/modals/editAdminModal";
import { toast } from "react-toastify";

export default function AdminListClient({ admins: initialAdmins, admin }) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [showModal, setShowModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);

  const refetchAdmins = async () => {
    try {
      const res = await fetch("/api/v1/admins", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch admins");
      const data = await res.json();
      setAdmins(data.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to refetch admins");
    }
  };

  const handleSuccess = () => {
    setShowModal(false);
    setEditAdmin(null);
    refetchAdmins();
  };

  const handleEditClick = (admin) => setEditAdmin(admin);

  const handleDeleteClick = async (adminToDelete) => {
    if (!confirm(`Are you sure you want to delete ${adminToDelete.name}?`))
      return;
    try {
      const res = await fetch(`/api/admins/${adminToDelete._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || "Failed to delete admin");
      }
      toast.success("Admin deleted successfully");
      refetchAdmins();
    } catch (err) {
      toast.error(err.message || "Failed to delete admin");
    }
  };

  return (
    <>
      <Table
        data={admins}
        title="Admins"
        onAddClick={() => setShowModal(true)}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        adminRole={admin?.role}
      />
      {showModal && (
        <AddAdminModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
      {editAdmin && (
        <EditAdminModal
          admin={editAdmin}
          onClose={() => setEditAdmin(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

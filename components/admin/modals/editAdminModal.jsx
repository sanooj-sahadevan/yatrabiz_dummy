"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { API_ENDPOINTS } from "@/constants/api";
import { toast } from "react-toastify";
import ModalWrapper from "@/components/common/modalWrapper/modalWrapper";
import { ADMIN_ROLE_PERMISSIONS } from "@/constants/adminRoles";

export default function EditAdminModal({ onClose, onSuccess, admin, currentAdmin }) {
  const [formData, setFormData] = useState({ ...admin });
  const { putData } = useAdmin(API_ENDPOINTS.ADMIN.LIST, "Admin", currentAdmin);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = formData.name.trim() !== "" && formData.email.trim() !== "";

  useEffect(() => {
    const permissions = ADMIN_ROLE_PERMISSIONS[formData.role] || ["manage_bookings"];
    setFormData((prev) => ({
      ...prev,
      permissions,
    }));
  }, [formData.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await putData(admin._id, formData);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={true}
      onClose={onClose}
      title="Edit Admin"
      showCloseButton={true}
      closeOnOutsideClick={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          tabIndex={2}
          type="text"
          placeholder="Name"
          className="w-full border px-3 py-2 rounded text-black"
          value={formData.name}
          required
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          tabIndex={3}
          type="email"
          placeholder="Email"
          className="w-full border px-3 py-2 rounded text-black"
          value={formData.email}
          required
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />
        <select
          tabIndex={4}
          className="w-full border px-3 py-2 rounded text-black"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="super_admin">Super Admin</option>
          <option value="staff">Staff</option>
          <option value="supplier">Supplier</option>
          {/* <option value="editor">Editor</option> */}
          <option value="viewer">Viewer</option>
        </select>

        <div className="flex justify-between gap-2 pt-2">
          <button
            type="button"
            tabIndex={6}
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-400"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            tabIndex={5}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

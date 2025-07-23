"use client";

import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/constants/api";
import { useAdmin } from "@/hooks/useAdmin";
import ModalWrapper from "@/components/common/modalWrapper/modalWrapper";

export default function AddAdminModal({ onClose, onSuccess, currentAdmin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "viewer",
  });

  const { postData, loading } = useAdmin(
    API_ENDPOINTS.ADMIN.LIST,
    "Admin",
    currentAdmin
  );

  const canSubmit =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.password.trim() !== "" &&
    formData.password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await postData(formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to add admin:", err);
    }
  };

  return (
    <ModalWrapper
      isOpen={true}
      onClose={onClose}
      title="Add New Admin"
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
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          tabIndex={4}
          type="password"
          placeholder="Password"
          className="w-full border px-3 py-2 rounded text-black"
          value={formData.password}
          required
          minLength={6}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <p className="text-sm -mt-4 text-gray-500">Minimum 6 characters</p>
        <select
          tabIndex={5}
          className="w-full border px-3 py-2 rounded text-black"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="super_admin">Super Admin</option>
          <option value="staff">Staff</option>
          <option value="supplier">Supplier</option>
          <option value="viewer">Viewer</option>
        </select>

        <div className="flex justify-between gap-2 pt-2">
          <button
            type="button"
            tabIndex={7}
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            tabIndex={6}
            disabled={!canSubmit || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add Admin"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

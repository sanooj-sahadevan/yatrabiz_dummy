"use client";

import { useState } from "react";
import ModalWrapper from "@/components/common/modalWrapper/modalWrapper";
import { useLocations } from "@/hooks/useLocations";
import { toast } from "react-toastify";

export default function AddLocationModal({ currentAdmin, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createData } = useLocations();

  const canSubmit =
    formData.name.trim() !== "" && formData.code.trim().length === 3;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await createData(formData, currentAdmin.id);

      toast.success("Location added successfully");
      onSuccess();
    } catch (error) {
      toast.error(error.message || "Failed to add location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={true}
      onClose={onClose}
      title="Add New Location"
      showCloseButton={true}
      closeOnOutsideClick={true}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="px-4 py-4">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-black mb-1"
            >
              Location Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="Enter location name"
              required
              tabIndex={2}
            />
          </div>

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-black mb-1"
            >
              Location Code *
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase text-black"
              placeholder="Enter 3-letter code (e.g., DEL)"
              maxLength={3}
              required
              tabIndex={3}
            />
            <p className="text-xs text-black mt-1">
              Enter a 3-letter location code (e.g., DEL for Delhi, BOM for
              Mumbai)
            </p>
          </div>
        </div>

        <div className="flex justify-between gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-400"
            disabled={loading}
            tabIndex={5}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            tabIndex={4}
          >
            {loading ? "Adding..." : "Add Location"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}


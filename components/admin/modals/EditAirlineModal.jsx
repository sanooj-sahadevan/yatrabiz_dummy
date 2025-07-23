"use client";

import { useState, useEffect } from "react";
import ModalWrapper from "@/components/common/modalWrapper/modalWrapper";
import { useAirlines } from "@/hooks/useAirlines";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function EditAirlineModal({
  currentAdmin,
  airline,
  onClose,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    contactEmail: "",
    contactPhone: "",
    headerImageBase64: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { updateData } = useAirlines();

  const canSubmit =
    formData.name.trim() !== "" && formData.code.trim();

  useEffect(() => {
    if (airline) {
      setFormData({
        name: airline.name || "",
        code: airline.code || "",
        contactEmail: airline.contactEmail || "",
        contactPhone: airline.contactPhone || "",
        headerImageBase64: airline.headerImageBase64 || "",
        isActive: airline.isActive !== undefined ? airline.isActive : true,
      });
    }
  }, [airline]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Only allow jpg/jpeg
    if (!file.type.match(/^image\/(jpeg|jpg)$/)) {
      setError("Only JPG/JPEG images are allowed.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        headerImageBase64: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await updateData(airline._id, formData, currentAdmin?.id);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={true}
      onClose={onClose}
      title="Edit Airline"
      showCloseButton={true}
      closeOnOutsideClick={true}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="px-4 py-4 bg-white text-black">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-black">
              Airline Name *
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter airline name"
              required
              tabIndex={1}
              className="bg-white text-black border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code" className="text-black">
              Airline Code *
            </Label>
            <Input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="Enter 3-letter code (e.g., AIA)"
              maxLength={3}
              required
              tabIndex={2}
              className="uppercase bg-white text-black border-gray-300"
            />
            <p className="text-xs text-gray-600">
              Enter a 3-letter airline code (e.g., AIA for Air India, JET for
              Jet Airways)
            </p>
          </div>

       

          <div className="space-y-2">
            <Label htmlFor="headerImage" className="text-black">
              Header Image (Base64)
            </Label>
            <Input
              type="file"
              id="headerImage"
              name="headerImage"
              accept="image/jpeg,image/jpg"
              onChange={handleImageChange}
              tabIndex={4}
              className="bg-white text-black"
            />
            {formData.headerImageBase64 && (
              <img src={formData.headerImageBase64} alt="Header Preview" className="mt-2 max-h-24 rounded" />
            )}
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between gap-2 pt-2">
            <button
              type="button"
              tabIndex={8}
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-400"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              tabIndex={7}
              disabled={isSubmitting || !canSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Updating..." : "Update Airline"}
            </button>
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
}

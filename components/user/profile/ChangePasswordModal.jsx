"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import ModalWrapper from "@/components/common/modalWrapper/modalWrapper";
import { Label } from "@/components/ui/label";
import PasswordField from "@/components/common/form/passwordField";
import { useFormValidation } from "@/hooks/useFormValidation";

export function ChangePasswordModal({ isOpen, onClose, user }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validators = {
    oldPassword: (val) => (val ? "" : "Old password is required"),
    newPassword: (val) =>
      !val
        ? "New password is required"
        : val.length < 6
        ? "New password must be at least 6 characters"
        : "",
    confirmPassword: (val) =>
      val !== values.newPassword ? "Passwords don't match" : "",
  };

  const {
    values,
    errors,
    handleChange,
    validateAll,
    resetForm,
    setValues,
    setErrors,
  } = useFormValidation(
    { oldPassword: "", newPassword: "", confirmPassword: "" },
    validators
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/users/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to change password.");
      }
      toast.success("Password changed successfully!");
      resetForm();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to change password.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Change Password">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="oldPassword">Old Password</Label>
          <PasswordField
            name="oldPassword"
            placeholder="Old Password"
            disabled={isSubmitting}
            label=""
            error={errors.oldPassword}
            value={values.oldPassword}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <PasswordField
            name="newPassword"
            placeholder="New Password"
            disabled={isSubmitting}
            label=""
            error={errors.newPassword}
            value={values.newPassword}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <PasswordField
            name="confirmPassword"
            placeholder="Confirm New Password"
            disabled={isSubmitting}
            label=""
            error={errors.confirmPassword}
            value={values.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            tabIndex={5}
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            tabIndex={6}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

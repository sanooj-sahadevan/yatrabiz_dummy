"use client";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFormValidation } from "@/hooks/useFormValidation";
import { FORM_LABELS } from "@/constants/labels";
import ModalWrapper from "@/components/common/modalWrapper/modalWrapper";
import InputField from "@/components/common/form/inputField";
import PasswordField from "@/components/common/form/passwordField";

export default function AdminLoginModal({ isOpen }) {
  const { login: handleLogin, isLoading, error, setError } = useAuth("admin");

  const validators = {
    email: (val) => (!val ? "Email or name is required" : ""),
    password: (val) => (!val ? "Password is required" : ""),
  };

  const { values, errors, handleChange, validateAll, resetForm } =
    useFormValidation({ email: "", password: "" }, validators);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setError("");
    }
  }, [isOpen, resetForm, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    await handleLogin(values);
  };

  return (
    <ModalWrapper isOpen={isOpen}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {FORM_LABELS.adminLoginTitle}
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          {FORM_LABELS.adminLoginSubtitle}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded text-sm text-center mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          name="email"
          type="text"
          value={values.email}
          onChange={handleChange}
          placeholder="Enter your email or name"
          disabled={isLoading}
          label={FORM_LABELS.emailOrName}
          error={errors.email}
        />

        <PasswordField
          name="password"
          value={values.password}
          onChange={handleChange}
          placeholder="Enter your password"
          disabled={isLoading}
          label={FORM_LABELS.password}
          error={errors.password}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing in..." : FORM_LABELS.submit}
        </button>
      </form>
    </ModalWrapper>
  );
}

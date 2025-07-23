"use client";
import { useState, useEffect } from "react";
import ModalWrapper from "@/components/common/modalWrapper/modalWrapper";
import InputField from "@/components/common/form/inputField";
import PasswordField from "@/components/common/form/passwordField";
import { useAuth } from "@/hooks/useAuth";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useRegistrationForm } from "@/hooks/useRegistrationForm";
import { FORM_LABELS } from "@/constants/labels";
import emailjs from "emailjs-com";

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { login, register, isLoading } = useAuth("user");

  const [isRegistering, setIsRegistering] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [pendingApprovalMessage, setPendingApprovalMessage] = useState("");

  const loginForm = useFormValidation(
    { email: "", password: "" },
    {
      email: (val) => (!val ? "Email or name is required" : ""),
      password: (val) => (!val ? "Password is required" : ""),
    }
  );

  const registrationForm = useRegistrationForm();

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (isRegistering) {
      if (!registrationForm.validateAll()) return;
      const result = await register(registrationForm.values);
      if (result) {
        if (result.pendingApproval) {
          setIsRegistering(false);
          registrationForm.resetForm();
          loginForm.resetForm();
          setPendingApprovalMessage(
            result.message ||
              "Registration successful. Your account is pending admin approval.",
          );
        } else {
          setIsRegistering(false);
          registrationForm.resetForm();
          loginForm.resetForm({ email: result.email, password: "" });
          onLoginSuccess(result);
          onClose();
        }
      }
    } else {
      if (!loginForm.validateAll()) return;
      const user = await login(loginForm.values);
      if (user) {
        onLoginSuccess(user);
        onClose();
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotStatus(null);
    try {
      const res = await fetch("/api/v1/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        const { user_name, password, time, email } = data;

        try {
          await emailjs.send(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
            {
              user_name,
              password,
              time,
              email,
            },
            process.env.NEXT_PUBLIC_EMAILJS_USER_ID
          );
          setForgotStatus({
            success: true,
            message:
              "Check your email and use that temporary password to log in.",
          });
        } catch (err) {
          setForgotStatus({
            success: false,
            message: "Failed to send email via EmailJS.",
          });
        }
      } else {
        setForgotStatus({
          success: false,
          message: data.message || "Failed to send temporary password.",
        });
      }
    } catch (err) {
      setForgotStatus({
        success: false,
        message: "An error occurred. Please try again.",
      });
    }
    setForgotLoading(false);
  };

  useEffect(() => {
    if (!isOpen) {
      loginForm.resetForm();
      registrationForm.resetForm();
      setIsRegistering(false);
      setPendingApprovalMessage("");
    }
  }, [isOpen]);

  const isRegisterFormIncomplete =
    !registrationForm.values.firstName ||
    !registrationForm.values.lastName ||
    !registrationForm.values.email ||
    !registrationForm.values.phoneNumber ||
    !registrationForm.values.password ||
    !registrationForm.values.confirmPassword ||
    !registrationForm.values.aadhaarNumber ||
    !registrationForm.values.panCardNumber ||
    !registrationForm.values.gstOrUdyog ||
    (registrationForm.values.gstOrUdyog === "gst" &&
      !registrationForm.values.gstNumber) ||
    (registrationForm.values.gstOrUdyog === "udyog" &&
      !registrationForm.values.udyogNumber);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isRegistering ? "Create Account" : "Welcome Back"}
      showCloseButton={true}
      closeOnOutsideClick={true}
      maxWidth={isRegistering ? "max-w-2xl" : "max-w-md"}
    >
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 mt-1">
          {isRegistering
            ? "Join us to book your flights"
            : "Sign in to your account to continue"}
        </p>
      </div>

      {pendingApprovalMessage && (
        <div className="text-center text-background font-medium my-2">
          {pendingApprovalMessage}
        </div>
      )}

      <form onSubmit={handleFormSubmit}>
        {isRegistering ? (
          <div className="max-h-[400px] overflow-y-auto px-1 space-y-3 scrollbar-hide">
            <div className="grid grid-cols-2 gap-3">
              <InputField
                name="firstName"
                type="text"
                label="First Name"
                value={registrationForm.values.firstName}
                onChange={registrationForm.handleChange}
                error={registrationForm.errors.firstName}
                disabled={isLoading}
              />
              <InputField
                name="lastName"
                type="text"
                label="Last Name"
                value={registrationForm.values.lastName}
                onChange={registrationForm.handleChange}
                error={registrationForm.errors.lastName}
                disabled={isLoading}
              />
              <InputField
                name="email"
                type="email"
                label="Email"
                value={registrationForm.values.email}
                onChange={registrationForm.handleChange}
                error={registrationForm.errors.email}
                disabled={isLoading}
              />
              <InputField
                name="phoneNumber"
                type="text"
                label="Phone Number"
                maxLength={10}
                value={registrationForm.values.phoneNumber}
                onChange={registrationForm.handleChange}
                error={registrationForm.errors.phoneNumber}
                disabled={isLoading}
              />
              <PasswordField
                name="password"
                label="Password"
                value={registrationForm.values.password}
                onChange={registrationForm.handleChange}
                error={registrationForm.errors.password}
                disabled={isLoading}
              />
              <PasswordField
                name="confirmPassword"
                label="Confirm Password"
                value={registrationForm.values.confirmPassword}
                onChange={registrationForm.handleChange}
                error={registrationForm.errors.confirmPassword}
                disabled={isLoading}
              />
              <InputField
                name="aadhaarNumber"
                type="text"
                label="Aadhaar Number"
                maxLength={12}
                placeholder="123456789012"
                value={registrationForm.values.aadhaarNumber}
                onChange={registrationForm.handleChange}
                error={registrationForm.errors.aadhaarNumber}
                disabled={isLoading}
              />
              <InputField
                name="panCardNumber"
                type="text"
                label="PAN Number"
                maxLength={10}
                placeholder="ABCDE1234F"
                value={registrationForm.values.panCardNumber}
                onChange={registrationForm.handleChange}
                error={registrationForm.errors.panCardNumber}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center gap-6 justify-start text-sm text-gray-700 focus-none">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gstOrUdyog"
                  value="gst"
                  checked={registrationForm.values.gstOrUdyog === "gst"}
                  onChange={registrationForm.handleChange}
                  disabled={isLoading}
                  className="mr-2"
                />
                GST
              </label>
              <label className="flex items-center focus-none">
                <input
                  type="radio"
                  name="gstOrUdyog"
                  value="udyog"
                  checked={registrationForm.values.gstOrUdyog === "udyog"}
                  onChange={registrationForm.handleChange}
                  disabled={isLoading}
                  className="mr-2"
                />
                Udyog
              </label>
            </div>

            {registrationForm.values.gstOrUdyog === "gst" ? (
              <InputField
                name="gstNumber"
                type="text"
                label="GST Number"
                placeholder="22AAAAA0000A1Z5"
                value={registrationForm.values.gstNumber}
                onChange={registrationForm.handleChange}
                error={registrationForm.errors.gstNumber}
                disabled={isLoading}
                className="!focus:outline-none !focus:ring-0 !focus:border-gray-300 !focus:shadow-none"
              />
            ) : (
              <InputField
                name="udyogNumber"
                type="text"
                label="Udyog Number"
                value={registrationForm.values.udyogNumber}
                onChange={registrationForm.handleChange}
                error={registrationForm.errors.udyogNumber}
                disabled={isLoading}
                className="!focus:outline-none !focus:ring-0 !focus:border-gray-300 !focus:shadow-none"
              />
            )}

            <button
              type="submit"
              disabled={isLoading || isRegisterFormIncomplete}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-gray-600 mt-2">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        ) : (
          <>
            <InputField
              name="email"
              type="text"
              label={FORM_LABELS.emailOrName}
              value={loginForm.values.email}
              onChange={loginForm.handleChange}
              error={loginForm.errors.email}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            <PasswordField
              name="password"
              label="Password"
              placeholder="Enter your password"
              value={loginForm.values.password}
              onChange={loginForm.handleChange}
              error={loginForm.errors.password}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={
                isLoading || !loginForm.values.email || !loginForm.values.password
              }
              className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-2">
              <span className="text-sm text-gray-600">
                Don't have an account?
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </button>
              </span>
              <span className="hidden sm:inline-block mx-2 text-gray-400">
                |
              </span>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium focus:outline-none"
              >
                Forgot Password?
              </button>
            </div>
          </>
        )}
      </form>

      {showForgotModal && (
        <ModalWrapper
          isOpen={showForgotModal}
          onClose={() => {
            setShowForgotModal(false);
            setForgotEmail("");
            setForgotStatus(null);
          }}
          title="Forgot Password"
          showCloseButton={true}
          closeOnOutsideClick={true}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <InputField
              name="forgotEmail"
              type="email"
              label="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              disabled={forgotLoading}
            />
            <button
              type="submit"
              disabled={forgotLoading || !forgotEmail}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {forgotLoading ? "Sending..." : "Send Temporary Password"}
            </button>
            {forgotStatus && (
              <div
                className={`text-center text-sm ${
                  forgotStatus.success ? "text-green-600" : "text-red-600"
                }`}
              >
                {forgotStatus.message}
              </div>
            )}
          </form>
        </ModalWrapper>
      )}
    </ModalWrapper>
  );
}

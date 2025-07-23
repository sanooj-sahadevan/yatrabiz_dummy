import { useFormValidation } from "./useFormValidation";
import { FORM_VALIDATION_MESSAGES } from "@/constants/messages";

export function useRegistrationForm() {
  const validators = {
    firstName: (val) =>
      val.trim() ? "" : FORM_VALIDATION_MESSAGES.FIRST_NAME_REQUIRED,
    lastName: (val) =>
      val.trim() ? "" : FORM_VALIDATION_MESSAGES.LAST_NAME_REQUIRED,
    email: (val) => {
      if (!val.trim()) return FORM_VALIDATION_MESSAGES.EMAIL_REQUIRED;
      if (!/\S+@\S+\.\S+/.test(val))
        return FORM_VALIDATION_MESSAGES.INVALID_EMAIL;
      return "";
    },
    password: (val) => {
      if (!val) return FORM_VALIDATION_MESSAGES.PASSWORD_REQUIRED;
      if (val.length < 6)
        return FORM_VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH;
      return "";
    },
    confirmPassword: (val, allValues) => {
      if (!val) return "Please confirm your password";
      if (!allValues || !allValues.password) return "";
      if (val !== allValues.password) return "Passwords do not match";
      return "";
    },
    phoneNumber: (val) => {
      if (!val.trim()) return FORM_VALIDATION_MESSAGES.PHONE_NUMBER_REQUIRED;
      if (!/^\d{10}$/.test(val))
        return FORM_VALIDATION_MESSAGES.INVALID_PHONE_NUMBER;
      return "";
    },
    panCardNumber: (val) => {
      if (!val.trim()) return "PAN card number is required";
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val.toUpperCase()))
        return "Please enter a valid PAN card number (e.g., ABCDE1234F)";
      return "";
    },
    aadhaarNumber: (val) => {
      if (!val.trim()) return "Aadhaar card number is required";
      if (!/^[0-9]{12}$/.test(val))
        return "Please enter a valid 12-digit Aadhaar number";
      return "";
    },
    gstOrUdyog: (val) => {
      // This is the toggle, no validation needed
      return "";
    },
    gstNumber: (val, allValues) => {
      if (!allValues || allValues.gstOrUdyog !== "gst") return "";
      if (!val.trim()) return "GST number is required";
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val.toUpperCase())) {
        return "Please enter a valid GST number";
      }
      return "";
    },
    udyogNumber: (val, allValues) => {
      if (!allValues || allValues.gstOrUdyog !== "udyog") return "";
      if (!val.trim()) return "Udyog number is required";
      return "";
    },
  };

  const {
    values,
    errors,
    handleChange: originalHandleChange,
    validateAll,
    resetForm,
  } = useFormValidation(
    {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      aadhaarNumber: "",
      panCardNumber: "",
      gstOrUdyog: "gst", // default is GST
      gstNumber: "",
      udyogNumber: "",
    },
    validators
  );

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const finalValue = type === "checkbox" ? e.target.checked : (typeof value === "string" ? value.trim() : value);
    originalHandleChange({
      target: { name, value: finalValue },
    });
  };

  return {
    values,
    errors,
    handleChange,
    validateAll,
    resetForm,
  };
} 
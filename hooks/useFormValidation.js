// hooks/useFormValidation.js
import { useState } from "react";

export function useFormValidation(initialState = {}, validators = {}) {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    const validator = validators[name];
    if (validator) {
      const error = validator(value, { ...values, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateAll = () => {
    const newErrors = {};
    for (const key in validators) {
      const error = validators[key](values[key], values);
      if (error) newErrors[key] = error;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setValues(initialState);
    setErrors({});
  };

  return {
    values,
    errors,
    handleChange,
    validateAll,
    resetForm,
    setValues,
    setErrors,
  };
}

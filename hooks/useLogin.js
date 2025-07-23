import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/constants/api";

export const useLogin = (type = "admin") => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.success) {
        localStorage.setItem("adminUser", JSON.stringify(data.user));
        router.push(type === "admin" ? "/admin/dashboard" : "/dashboard");
        return true;
      }

      throw new Error(data.message || "Login failed");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleLogin,
    isLoading,
    error,
    setError,
  };
};

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { API_ENDPOINTS, COOKIE_NAMES } from "@/constants/api";
import { authService } from "@/lib/api/services/auth";

export const useAuth = (type = "user") => {
  const [user, setUserState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const parseToken = (token) => {
    try {
      if (!token || typeof token !== "string") {
        return null;
      }

      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (err) {
      console.error("Invalid token", err);
      return null;
    }
  };

  // LOGIN
  const login = async (formData) => {
    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrName: formData.email.trim(),
          password: formData.password,
          type,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      if (data.success) {
        localStorage.setItem("authUser", JSON.stringify(data.user));
        setUserState(data.user);
        toast.success("Logged in successfully!");

        if (type === "admin") {
          router.push("/admin/dashboard");
          window.location.reload();
        }
        return data.user;
      }

      throw new Error(data.message || "Login failed");
    } catch (err) {
      toast.error(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // REGISTER
  const register = async (formData) => {
    if (type !== "user") {
      toast.error("Registration is not available for this user type.");
      return null;
    }

    setIsLoading(true);

    try {
      const { firstName, lastName, confirmPassword, ...rest } = formData;
      const name = `${firstName} ${lastName}`.trim();

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rest, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      if (data.success) {
        toast.info(
          data.message || "Registration successful. Pending admin approval.",
        );
        return { pendingApproval: true, message: data.message };
      } else {
        throw new Error(data.message );
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(
        err.message,
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      await authService.logout(type);
      setUserState(null);
      localStorage.removeItem("authUser");
      router.push("/");
      toast.success("Logged out successfully!");
      window.location.reload();
    } catch (err) {
      console.error("Logout error", err);
      toast.error("An error occurred during logout.");
    }
  };

  useEffect(() => {
    setIsInitializing(true);

    const tokenName =
      type === "admin" ? COOKIE_NAMES.ADMIN_TOKEN : COOKIE_NAMES.USER_TOKEN;
    const token = getCookie(tokenName);

    if (token) {
      const payload = parseToken(token);
      if (payload?.email) {
        const userData = {
          email: payload.email,
          role: payload.role,
          name: payload.name,
          id: payload.id,
        };
        setUserState(userData);
        localStorage.setItem("authUser", JSON.stringify(userData));
      } else {
        setUserState(null);
        localStorage.removeItem("authUser");
      }
    } else {
      const storedUser = localStorage.getItem("authUser");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUserState(userData);
        } catch (err) {
          console.error("Error parsing stored user data:", err);
          localStorage.removeItem("authUser");
          setUserState(null);
        }
      } else {
        setUserState(null);
      }
    }

    setIsInitializing(false);
  }, [type]);

  const setUser = (user) => {
    setUserState(user);
    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("authUser");
    }
  };

  return {
    user,
    login,
    register,
    logout,
    isLoading,
    isInitializing,
    setUser,
  };
};

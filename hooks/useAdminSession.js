
'use client'
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/constants/api";

export const useAdminSession = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_ENDPOINTS.AUTH.SESSION, {
          method: "GET",
          credentials: "include", 
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setAdmin(data.user);
        } else {
          setError(data.message || "Failed to fetch admin info");
        }
      } catch (err) {
        console.error("Failed to fetch admin info:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminInfo();
  }, []);

  return {
    admin,
    loading,
    error,
  };
};

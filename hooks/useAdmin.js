"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { fetchAdmins, postAdmin, putAdmin, deleteAdmin } from "@/lib/apiClient";

// Cache for storing API responses
const cache = new Map();
const CACHE_DURATION = 60000;

export const useAdmin = (
  endpoint,
  resourceName = "Data",
  currentAdmin = null
) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(
    async (force = false) => {
      try {
        const cachedData = cache.get(endpoint);
        const now = Date.now();

        if (
          !force &&
          cachedData &&
          now - cachedData.timestamp < CACHE_DURATION
        ) {
          setData(cachedData.data);
          setLoading(false);
          return;
        }

        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        // Use the new fetchAdmins function
        const result = await fetchAdmins(endpoint);
        const newData = result.data || [];

        // Update cache
        cache.set(endpoint, {
          data: newData,
          timestamp: now,
        });

        setData(newData);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(`Error fetching ${resourceName}:`, err);
        setError(err.message);
        toast.error(err.message || `Failed to load ${resourceName}`);
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [endpoint, resourceName]
  );

  const postData = useCallback(
    async (newData) => {
      try {
        setLoading(true);
        setError(null);

        if (!currentAdmin) {
          throw new Error("Admin session not found");
        }

        const payload = {
          ...newData,
          performedBy: currentAdmin.email,
        };

        // Use the new postAdmin function
        const result = await postAdmin(endpoint, payload);

        cache.delete(endpoint);
        await fetchData(true);

        toast.success(`${resourceName} created successfully`);
        return result;
      } catch (err) {
        console.error(`Error creating ${resourceName}:`, err);
        setError(err.message);
        toast.error(err.message || `Failed to create ${resourceName}`);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, resourceName, fetchData, currentAdmin]
  );

  const putData = useCallback(
    async (id, updatedData) => {
      try {
        setLoading(true);
        setError(null);

        if (!currentAdmin) {
          throw new Error("Admin session not found");
        }

        const payload = {
          ...updatedData,
          performedBy: currentAdmin.email,
        };

        // Use the new putAdmin function
        const result = await putAdmin(id, payload);

        cache.delete(endpoint);
        await fetchData(true);

        toast.success(`${resourceName} updated successfully`);
        return result;
      } catch (err) {
        console.error(`Error updating ${resourceName}:`, err);
        setError(err.message);
        toast.error(err.message || `Failed to update ${resourceName}`);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, resourceName, fetchData, currentAdmin]
  );

  const deleteData = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);

        if (!currentAdmin || !currentAdmin.email) {
          throw new Error("Admin session not found or invalid");
        }
        // Use the new deleteAdmin function
        const result = await deleteAdmin(id, { performedBy: currentAdmin.email });

        cache.delete(endpoint);
        await fetchData(true);

        toast.success(`${resourceName} deleted successfully`);
        return result;
      } catch (err) {
        console.error(`Error deleting ${resourceName}:`, err);
        setError(err.message);
        toast.error(err.message || `Failed to delete ${resourceName}`);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, resourceName, fetchData, currentAdmin]
  );

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    postData,
    putData,
    deleteData,
  };
};

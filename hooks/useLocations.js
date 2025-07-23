"use client";

import { useState, useEffect } from "react";
import { fetchLocations, postLocation, putLocation, deleteLocation } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api";

export function useLocations(initialData = []) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchLocations(API_ENDPOINTS.LOCATION.LIST);
      setData(result.data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
    }
  };

  const createData = async (locationData, adminId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await postLocation(API_ENDPOINTS.LOCATION.CREATE, { ...locationData, adminId });
      return result;
    } catch (err) {
      setError(err.message);
      console.error("Error creating location:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (id, locationData, adminId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await putLocation(API_ENDPOINTS.LOCATION.UPDATE(id), { ...locationData, adminId });
      return result;
    } catch (err) {
      setError(err.message);
      console.error("Error updating location:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async (id, adminId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await deleteLocation(API_ENDPOINTS.LOCATION.DELETE(id), { adminId });
      return result;
    } catch (err) {
      setError(err.message);
      console.error("Error deleting location:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData.length === 0) {
      fetchData();
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    createData,
    updateData,
    deleteData,
  };
}

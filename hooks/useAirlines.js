"use client";

import { useState, useEffect } from "react";
import { fetchAirlines, postAirline, putAirline, deleteAirline } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api";

export function useAirlines(initialData = []) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAirlines(API_ENDPOINTS.AIRLINE.LIST);
      setData(result.data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching airlines:", err);
    } finally {
      setLoading(false);
    }
  };

  const createData = async (airlineData, adminId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await postAirline(API_ENDPOINTS.AIRLINE.CREATE, { ...airlineData, adminId });
      return result;
    } catch (err) {
      setError(err.message);
      console.error("Error creating airline:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (id, airlineData, adminId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await putAirline(API_ENDPOINTS.AIRLINE.UPDATE(id), { ...airlineData, adminId });
      return result;
    } catch (err) {
      setError(err.message);
      console.error("Error updating airline:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async (id, adminId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await deleteAirline(API_ENDPOINTS.AIRLINE.DELETE(id), { adminId });
      return result;
    } catch (err) {
      setError(err.message);
      console.error("Error deleting airline:", err);
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
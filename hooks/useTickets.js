"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { validateTicketCalculations } from "@/utils/ticketCalculations";
import { formatDate } from "@/utils/formatters";
import {
  fetchTickets,
  postTicket,
  putTicket,
  deleteTicket,
} from "@/lib/apiClient";

const cache = new Map();
const CACHE_DURATION = 60000;

export const useTickets = (
  endpoint,
  resourceName = "Tickets",
  currentAdmin = null,
  initialTickets = [],
  initialTotal = 0,
  initialPage = 1,
  initialLimit = 3,
  initialTotalPages = 1
) => {
  const [data, setData] = useState(initialTickets);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [hasMore, setHasMore] = useState(true);
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(
    async (force = false, customPage = page, customLimit = limit) => {
      const cacheKey = `${endpoint}?page=${customPage}&limit=${customLimit}`;
      if (!force && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        setData(cached.data);
        setTotal(cached.total);
        setTotalPages(cached.totalPages);
        setHasMore(cached.page < cached.totalPages);
        setLoading(false);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const result = await fetchTickets(
          endpoint,
          customPage,
          customLimit,
          abortControllerRef.current.signal
        );

        const newData = result.data || [];
        setData((prevData) =>
          customPage === 1 ? newData : [...prevData, ...newData]
        );
        setTotal(result.total || 0);
        setPage(result.page || 1);
        setLimit(result.limit);
        setTotalPages(result.totalPages || 1);
        setHasMore((result.page || 1) < (result.totalPages || 1));

        cache.set(cacheKey, {
          data: customPage === 1 ? newData : [...data, ...newData],
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          timestamp: Date.now(),
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          toast.error(err.message || `Failed to load ${resourceName}`);
        }
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [endpoint, resourceName, data]
  );

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchData(false, page + 1, limit);
    }
  };

  const postData = useCallback(
    async (newData) => {
      try {
        setLoading(true);
        setError(null);

        if (!currentAdmin) {
          throw new Error("Admin session not found");
        }

        const validation = validateTicketCalculations(newData);
        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
        }

        const formattedData = {
          ...newData,
          dateOfJourney: newData.dateOfJourney
            ? formatDate(newData.dateOfJourney, "default")
            : null,
          purchaseDate: newData.purchaseDate
            ? formatDate(newData.purchaseDate, "default")
            : null,
          dateOfNameSubmission: newData.dateOfNameSubmission
            ? formatDate(newData.dateOfNameSubmission, "default")
            : null,
          outstandingDate: newData.outstandingDate
            ? formatDate(newData.outstandingDate, "default")
            : null,
        };

        const payload = {
          ...formattedData,
          performedBy: currentAdmin.email,
          adminId: currentAdmin.id,
        };

        const result = await postTicket(endpoint, payload);

        cache.delete(endpoint);
        await fetchData(true);

        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, resourceName, fetchData, currentAdmin]
  );

  const putData = useCallback(
    async (_id, updatedData) => {
      try {
        setLoading(true);
        setError(null);

        if (!currentAdmin) {
          throw new Error("Admin session not found");
        }

        const payload = {
          _id,
          ...updatedData,
          performedBy: currentAdmin.email,
          adminId: currentAdmin.id,
        };

        const result = await putTicket(_id, payload);

        cache.delete(endpoint);
        await fetchData(true);

        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, resourceName, fetchData, currentAdmin]
  );

  const deleteData = useCallback(
    async (_id, extraData = {}) => {
      try {
        setLoading(true);
        setError(null);

        if (!currentAdmin || !currentAdmin.email) {
          throw new Error("Admin session not found or invalid");
        }

        const payload = {
          _id,
          performedBy: currentAdmin.email,
          adminId: currentAdmin.id,
          ...extraData,
        };

        const result = await deleteTicket(_id, payload);

        cache.delete(endpoint);
        await fetchData(true);

        return result;
      } catch (err) {
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
    fetchData(false, page, limit);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, page, limit]);

  return {
    data,
    loading,
    error,
    page,
    limit,
    total,
    totalPages,
    setPage,
    setLimit,
    refetch: () => fetchData(true, 1, limit),
    loadMore,
    hasMore,
    postData,
    putData,
    deleteData,
  };
};

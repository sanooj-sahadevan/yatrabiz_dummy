export async function fetchTickets(endpoint, page = 1, limit, signal) {
  const url = `${endpoint}?page=${page}&limit=${limit}`;
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch tickets");
  }

  return result;
}

export async function postTicket(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store", // 🆕 Ensures SSR doesn’t cache mutation response
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create ticket");
  }
  return result;
}

export async function putTicket(id, payload) {
  const updateEndpoint = `/api/v1/tickets/${id}`;
  const response = await fetch(updateEndpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store", // 🆕 Forcing fresh response
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to update ticket");
  }
  return result;
}

export async function deleteTicket(id, payload) {
  try {
    const response = await fetch(`/api/v1/tickets/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      next: {
        revalidate: 0, // optional: force no-cache behavior (App Router)
        tags: ["tickets"], // helpful if you want SSR to refetch
      },
      cache: "no-store", // ✅ ensures no client caching
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to delete ticket");
    }

    return result;
  } catch (error) {
    console.error("Client deleteTicket() error:", error);
    throw error;
  }
}

export async function fetchAdminAudit() {
  const res = await fetch("/api/v1/admin-audit");
  if (!res.ok) throw new Error("Failed to fetch admin audit");
  return res.json();
}
export async function fetchAirlineAudit() {
  const res = await fetch("/api/v1/airline-audit");
  if (!res.ok) throw new Error("Failed to fetch airline audit");
  return res.json();
}
export async function fetchLocationAudit() {
  const res = await fetch("/api/v1/location-audit");
  if (!res.ok) throw new Error("Failed to fetch location audit");
  return res.json();
}
export async function fetchTicketAudit() {
  const res = await fetch("/api/v1/ticket-audit");
  if (!res.ok) throw new Error("Failed to fetch ticket audit");
  return res.json();
}
export async function fetchBookingRequestAudit() {
  const res = await fetch("/api/v1/booking-request-audit");
  if (!res.ok) throw new Error("Failed to fetch booking request audit");
  return res.json();
}
export async function fetchSearchHistory() {
  const res = await fetch("/api/v1/search-history");
  if (!res.ok) throw new Error("Failed to fetch search history");
  return res.json();
}
export async function fetchPassengerNameEditAuditLog() {
  const res = await fetch("/api/v1/bookings/passenger-name-edit-audit-log");
  if (!res.ok) throw new Error("Failed to fetch passenger name edit audit log");
  return res.json();
}

// Dashboard analytics API fetchers
export async function fetchMonthlyBookings() {
  const res = await fetch("/api/v1/analytics/monthly-bookings");
  if (!res.ok) throw new Error("Failed to fetch monthly bookings");
  return res.json();
}
export async function fetchTopDestinations() {
  const res = await fetch("/api/v1/analytics/top-destinations");
  if (!res.ok) throw new Error("Failed to fetch top destinations");
  return res.json();
}
export async function fetchTopSources() {
  const res = await fetch("/api/v1/analytics/top-sources");
  if (!res.ok) throw new Error("Failed to fetch top sources");
  return res.json();
}
export async function fetchTopCustomers() {
  const res = await fetch("/api/v1/analytics/top-customers");
  if (!res.ok) throw new Error("Failed to fetch top customers");
  return res.json();
}
export async function fetchLedgerSummary() {
  const res = await fetch("/api/v1/analytics/ledger-summary");
  if (!res.ok) throw new Error("Failed to fetch ledger summary");
  return res.json();
}
export async function fetchAirlineMarketShare() {
  const res = await fetch("/api/v1/analytics/airline-market-share");
  if (!res.ok) throw new Error("Failed to fetch airline market share");
  return res.json();
}

// Ledger API fetchers
export async function fetchLedgerById(endpoint) {
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error("Failed to fetch ledger");
  return res.json();
}

// Admin API fetchers
export async function fetchAdmins(endpoint) {
  const response = await fetch(endpoint, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.message || "Failed to fetch admins");
  }
  return response.json();
}

export async function postAdmin(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create admin");
  }
  return result;
}

export async function putAdmin(id, payload) {
  const updateEndpoint = `/api/v1/admins/${id}`;
  const response = await fetch(updateEndpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to update admin");
  }
  return result;
}

export async function deleteAdmin(id, payload) {
  const deleteEndpoint = `/api/v1/admins/${id}`;
  const response = await fetch(deleteEndpoint, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to delete admin");
  }
  return result;
}

// Airline API fetchers
export async function fetchAirlines(endpoint) {
  const response = await fetch(endpoint, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.message || "Failed to fetch airlines");
  }
  return response.json();
}
export async function postAirline(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create airline");
  }
  return result;
}
export async function putAirline(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to update airline");
  }
  return result;
}
export async function deleteAirline(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to delete airline");
  }
  return result;
}

export async function fetchLocations(endpoint) {
  const response = await fetch(endpoint, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.message || "Failed to fetch locations");
  }
  return response.json();
}
export async function postLocation(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create location");
  }
  return result;
}
export async function putLocation(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to update location");
  }
  return result;
}
export async function deleteLocation(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to delete location");
  }
  return result;
}

// Bookings API fetcher
export async function fetchBookings(endpoint) {
  const response = await fetch(endpoint, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || "Failed to fetch bookings");
  }
  return response.json();
}

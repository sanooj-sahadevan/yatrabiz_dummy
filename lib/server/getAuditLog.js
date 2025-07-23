function getApiUrl(path) {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}${path}`;
  }
  return path;
}

export async function getAuditLog() {
  try {
    const fetchOptions = {
      next: {
        revalidate: 0,
        tags: ["auditlog"],
      },
      headers: {
        Accept: "application/json",
      },
    };

    // Fetch all 4 audit types in parallel
    const [adminRes, airlineRes, locationRes, ticketRes] = await Promise.all([
      fetch(getApiUrl('/api/v1/admin-audit'), fetchOptions),
      fetch(getApiUrl('/api/v1/airline-audit'), fetchOptions),
      fetch(getApiUrl('/api/v1/location-audit'), fetchOptions),
      fetch(getApiUrl('/api/v1/ticket-audit'), fetchOptions),
    ]);

    // Check if all requests were successful
    const responses = [
      { name: "admin", response: adminRes },
      { name: "airline", response: airlineRes },
      { name: "location", response: locationRes },
      { name: "ticket", response: ticketRes },
    ];

    const results = {};
    const errors = [];

    for (const { name, response } of responses) {
      if (!response.ok) {
        const errorResult = await response.json();
        errors.push(
          `${name} audit: ${errorResult.message || "Failed to fetch"}`
        );
        results[name] = [];
      } else {
        const result = await response.json();
        results[name] = result.data || [];
      }
    }

    // If there were any errors, log them but still return available data
    if (errors.length > 0) {
      console.warn("Some audit logs failed to fetch:", errors);
    }

    // Combine all audit logs and sort by timestamp
    const allAuditLogs = [
      ...results.admin.map((log) => ({ ...log, type: "admin" })),
      ...results.airline.map((log) => ({ ...log, type: "airline" })),
      ...results.location.map((log) => ({ ...log, type: "location" })),
      ...results.ticket.map((log) => ({ ...log, type: "ticket" })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt || b.updatedAt) -
        new Date(a.createdAt || a.updatedAt)
    );

    return {
      admin: results.admin,
      airline: results.airline,
      location: results.location,
      ticket: results.ticket,
      all: allAuditLogs,
      errors: errors.length > 0 ? errors : null,
    };
  } catch (err) {
    console.error("Error fetching AuditLog:", err);
    throw err;
  }
}

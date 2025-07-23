function getApiUrl(path) {
  return process.env.NEXT_PUBLIC_BASE_URL
    ? `${process.env.NEXT_PUBLIC_BASE_URL}${path}`
    : path;
}

export async function getAirlines() {
  const response = await fetch(getApiUrl("/api/v1/airlines"), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch airlines");
  }

  return result.data || [];
}

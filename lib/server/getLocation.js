function getApiUrl(path) {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}${path}`;
  }
  return path;
}

export async function getLocation() {
  const res = await fetch(getApiUrl('/api/v1/locations'), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const result = await res.json();
    throw new Error(result.message || "Failed to fetch locations");
  }

  const result = await res.json();
  return result.data || [];
}

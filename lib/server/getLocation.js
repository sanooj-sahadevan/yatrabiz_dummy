export function getApiUrl(path) {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}${path}`;
  }
  return path;
}

export async function getLocation() {
  try {
    const res = await fetch(getApiUrl('/api/v1/locations'), {
      next: {
        revalidate: 0,              // For SSR fallback
        tags: ['locations'],        // ✅ Use tag here
      },
      headers: {
        Accept: "application/json",
      },
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result.data || [];
  } catch (err) {
    console.error("Error fetching locations:", err);
    throw err;
  }
}

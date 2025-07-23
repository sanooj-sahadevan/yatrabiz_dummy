function getApiUrl(path) {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}${path}`;
  }
  return path;
}

export async function getAdmins(cookies) {
  try {
    const res = await fetch(getApiUrl("/api/v1/admins"), {
      headers: {
        Accept: "application/json",
        Cookie: cookies || "",
      },
      credentials: "include",
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.message || "Failed to fetch admins");
    }

    const result = await res.json();
    return result.data || [];
  } catch (err) {
    console.error("Error fetching admins:", err);
    throw err;
  }
}

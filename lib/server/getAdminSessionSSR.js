import { API_ENDPOINTS } from "@/constants/api";

export async function getAdminSessionSSR(cookies) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}${API_ENDPOINTS.AUTH.SESSION}`,
      {
        method: "GET",
        headers: {
          Cookie: cookies || "",
        },
        credentials: "include",
      }
    );

    const data = await res.json();

    if (res.ok && data.success) {
      return {
        admin: data.user,
        error: null,
      };
    } else {
      return {
        admin: null,
        error: data.message || "Failed to fetch admin info",
      };
    }
  } catch (err) {
    console.error("Failed to fetch admin info (SSR):", err);
    return {
      admin: null,
      error: "Something went wrong",
    };
  }
}

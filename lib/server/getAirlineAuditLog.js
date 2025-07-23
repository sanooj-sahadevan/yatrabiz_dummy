function getApiUrl(path) {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}${path}`;
  }
  return path;
}

export async function getAirlineAuditLog() {
  try {
    const res = await fetch(getApiUrl('/api/v1/airline-audit'), {
      next: {
        revalidate: 0,
        tags: ['airlineauditlog'],
      },
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.message || 'Failed to fetch Airline Audit Log');
    }

    const result = await res.json();
    
    return result.data || []; 
  } catch (err) {
    console.error('Error fetching AirlineAuditLog:', err);
    throw err;
  }
} 
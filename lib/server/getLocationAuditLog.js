function getApiUrl(path) {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}${path}`;
  }
  return path;
}

export async function getLocationAuditLog() {
  try {
    const res = await fetch(getApiUrl('/api/v1/location-audit'), {
      next: {
        revalidate: 0,
        tags: ['locationauditlog'],
      },
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.message || 'Failed to fetch Location Audit Log');
    }

    const result = await res.json();
    
    return result.data || []; 
  } catch (err) {
    console.error('Error fetching LocationAuditLog:', err);
    throw err;
  }
} 
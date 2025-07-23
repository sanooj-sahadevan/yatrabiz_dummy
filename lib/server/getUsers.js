function getApiUrl(path) {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}${path}`;
  }
  return path;
}

export async function getUsers() {
    try {
      const res = await fetch(getApiUrl('/api/v1/users'), {
        next: {
          revalidate: 3,
          tags: ['users'] 
        },
        headers: {
          'Accept': 'application/json',
        }
      });
  
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || 'Failed to fetch users');
      }
  
      const result = await res.json();
      return result.data || [];
    } catch (err) {
      console.error('Error fetching users:', err);
      throw err;
    }
  }
  export async function revalidateUsers() {
  try {
    await fetch('/api/revalidate?tag=users', { method: 'POST' });
  } catch (error) {
    console.error('Error revalidating users:', error);
  }
}
  

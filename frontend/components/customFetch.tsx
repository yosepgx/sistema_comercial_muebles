export async function customFetch(ct:string | null, url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('access-token');
    const headers = {
        ...(options.headers || {}),
        ...(token && { 'Authorization': `Token ${token}` }),
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
        ...options,
        headers,
    });
   
    return response;
}
export async function customFetch(token:string | null, url: string, options: RequestInit = {}) {
    
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
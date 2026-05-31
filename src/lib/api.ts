const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function apiFetch<T = any>(
    path: string,
    options: RequestInit = {}
): Promise<{ data: T; ok: boolean; status: number }> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    }

    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json'
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    })

    // Handle 401 — redirect to login
    if (res.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/cueva-de-reparacion/login'
        return { data: null as T, ok: false, status: 401 }
    }

    let data: T
    try {
        data = await res.json()
    } catch {
        data = null as T
    }

    return { data, ok: res.ok, status: res.status }
}

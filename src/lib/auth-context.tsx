'use client'
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { apiFetch } from './api'

interface User {
    id: string
    email: string
    name?: string
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => ({ ok: false }),
    logout: () => { },
    isAuthenticated: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // Check token on mount
    useEffect(() => {
        const token = localStorage.getItem('token')
        const stored = localStorage.getItem('user')

        if (token && stored) {
            try {
                setUser(JSON.parse(stored))
            } catch {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
            }
        }
        setLoading(false)
    }, [])

    const login = useCallback(async (email: string, password: string) => {
        const { data, ok } = await apiFetch<{ token: string; id: string; email: string; name?: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        })

        if (ok && data?.token) {
            const userData: User = {
                id: data.id,
                email: data.email,
                name: data.name,
            }
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(userData))
            setUser(userData)
            return { ok: true }
        }

        return { ok: false, error: (data as any)?.error || 'Email o contraseña incorrectos' }
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        window.location.href = '/LaForja/login'
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}

'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function Home() {
    const router = useRouter()
    const { isAuthenticated, loading } = useAuth()

    useEffect(() => {
        if (loading) return
        if (isAuthenticated) {
            router.replace('/dashboard')
        } else {
            router.replace('/login')
        }
    }, [isAuthenticated, loading, router])

    return null
}

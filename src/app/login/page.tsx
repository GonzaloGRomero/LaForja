'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wrench, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [email, setEmail] = useState('admin@taller.local')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')
        const result = await login(email, password)
        setLoading(false)
        if (result.ok) {
            router.push('/dashboard')
        } else {
            setError(result.error || 'Email o contraseña incorrectos')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 mb-4">
                        <Wrench className="w-8 h-8 text-brand-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Taller de Reparaciones</h1>
                    <p className="text-slate-400 text-sm mt-1">Inicia sesión para continuar</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="card space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="label">Email</label>
                        <input id="email" type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                    </div>
                    <div>
                        <label className="label">Contraseña</label>
                        <input id="password" type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                    </div>
                    <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Ingresando...</> : 'Ingresar'}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-600 mt-4">
                    Sistema self-hosted · Solo para uso personal
                </p>
            </div>
        </div>
    )
}

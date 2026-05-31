'use client'
import { useState, useEffect } from 'react'
import { Wrench, Package, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Pendiente',
    IN_PROGRESS: 'En proceso',
    DONE: 'Terminado',
    DELIVERED: 'Entregado',
}

const STATUS_CLASSES: Record<string, string> = {
    PENDING: 'badge-pending',
    IN_PROGRESS: 'badge-progress',
    DONE: 'badge-done',
    DELIVERED: 'badge-delivered',
}

interface Repair {
    id: string; clientName: string; problemDescription: string; status: string; updatedAt: string
}
interface Part {
    id: string; name: string; category: string; stock: number
}

export default function DashboardPage() {
    const [repairs, setRepairs] = useState<Repair[]>([])
    const [parts, setParts] = useState<Part[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const [repairsRes, partsRes] = await Promise.all([
                apiFetch<{ repairs: Repair[] }>('/cdr/repairs?limit=100'),
                apiFetch<Part[]>('/cdr/parts'),
            ])
            setRepairs(repairsRes.data?.repairs || [])
            setParts(partsRes.data || [])
            setLoading(false)
        }
        load()
    }, [])

    if (loading) return <div className="flex items-center justify-center h-full text-slate-500">Cargando...</div>

    const counts = { PENDING: 0, IN_PROGRESS: 0, DONE: 0, DELIVERED: 0 }
    repairs.forEach(r => {
        if (r.status in counts) counts[r.status as keyof typeof counts]++
    })
    const total = repairs.length
    const lowStock = parts.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 5)
    const recentRepairs = repairs.slice(0, 5)

    const stats = [
        { label: 'Total Reparaciones', value: total, icon: Wrench, color: 'text-brand-400', bg: 'bg-brand-500/10' },
        { label: 'En proceso', value: counts.IN_PROGRESS, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Pendientes', value: counts.PENDING, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Tipos de piezas', value: parts.length, icon: Package, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    ]

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 text-sm mt-0.5">Resumen del taller</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="card flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{value}</p>
                            <p className="text-xs text-slate-400">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                {/* Recent Repairs */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-white">Reparaciones recientes</h2>
                        <Link href="/repairs" className="text-xs text-brand-400 hover:text-brand-300">Ver todas →</Link>
                    </div>
                    {recentRepairs.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-6">No hay reparaciones aún</p>
                    ) : (
                        <div className="space-y-2">
                            {recentRepairs.map(r => (
                                <Link key={r.id} href={`/repairs/detail?id=${r.id}`}
                                    className="flex items-center justify-between p-3 rounded-lg bg-surface-900 hover:bg-surface-700 transition-colors">
                                    <div>
                                        <p className="text-sm font-medium text-white">{r.clientName}</p>
                                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{r.problemDescription}</p>
                                    </div>
                                    <span className={STATUS_CLASSES[r.status] || 'badge-pending'}>
                                        {STATUS_LABELS[r.status] || r.status}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Low Stock Alert */}
                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <h2 className="font-semibold text-white">Stock bajo</h2>
                    </div>
                    {lowStock.length === 0 ? (
                        <div className="flex items-center gap-2 text-green-400 text-sm py-6 justify-center">
                            <CheckCircle className="w-4 h-4" /> Todo el inventario está OK
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {lowStock.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-900">
                                    <div>
                                        <p className="text-sm font-medium text-white">{p.name}</p>
                                        <p className="text-xs text-slate-400">{p.category}</p>
                                    </div>
                                    <span className={`text-sm font-bold ${p.stock === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                                        {p.stock} uds.
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    <Link href="/inventory" className="block mt-4 text-center text-xs text-brand-400 hover:text-brand-300">
                        Gestionar inventario →
                    </Link>
                </div>
            </div>
        </div>
    )
}

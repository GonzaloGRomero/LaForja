'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'
import { apiFetch } from '@/lib/api'

const STATUS_OPTIONS = [
    { value: '', label: 'Todos' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'IN_PROGRESS', label: 'En proceso' },
    { value: 'DONE', label: 'Terminado' },
    { value: 'DELIVERED', label: 'Entregado' },
]
const STATUS_CLASSES: Record<string, string> = {
    PENDING: 'badge-pending', IN_PROGRESS: 'badge-progress',
    DONE: 'badge-done', DELIVERED: 'badge-delivered',
}

interface Repair {
    id: string; clientName: string; clientContact?: string
    problemDescription: string; status: string; updatedAt: string
    _count?: { media: number; notes: number }
}

export default function RepairsPage() {
    const [repairs, setRepairs] = useState<Repair[]>([])
    const [total, setTotal] = useState(0)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams({ search, status })
        const { data } = await apiFetch<{ repairs: Repair[]; total: number }>(`/cdr/repairs?${params}`)
        setRepairs(data?.repairs || [])
        setTotal(data?.total || 0)
        setLoading(false)
    }, [search, status])

    useEffect(() => { load() }, [load])

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Reparaciones</h1>
                    <p className="text-slate-400 text-sm">{total} en total</p>
                </div>
                <Link href="/repairs/new" className="btn-primary">
                    <Plus className="w-4 h-4" /> Nueva reparación
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input className="input pl-9" placeholder="Buscar por cliente o problema..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select className="input pl-9 pr-3 w-44" value={status} onChange={e => setStatus(e.target.value)}>
                        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-16 text-slate-500">Cargando...</div>
            ) : repairs.length === 0 ? (
                <div className="card text-center py-16">
                    <p className="text-slate-400 mb-4">No hay reparaciones</p>
                    <Link href="/repairs/new" className="btn-primary inline-flex"><Plus className="w-4 h-4" />Crear primera reparación</Link>
                </div>
            ) : (
                <div className="space-y-2">
                    {repairs.map(r => (
                        <Link key={r.id} href={`/repairs/detail?id=${r.id}`}
                            className="card flex items-center gap-4 hover:border-brand-500/20 hover:bg-surface-700 transition-all duration-150 cursor-pointer">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-semibold text-white text-sm">{r.clientName}</span>
                                    {r.clientContact && <span className="text-xs text-slate-500">· {r.clientContact}</span>}
                                </div>
                                <p className="text-xs text-slate-400 truncate">{r.problemDescription}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <span className={STATUS_CLASSES[r.status] || 'badge-pending'}>
                                    {STATUS_OPTIONS.find(o => o.value === r.status)?.label || r.status}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {new Date(r.updatedAt).toLocaleDateString('es-ES')}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

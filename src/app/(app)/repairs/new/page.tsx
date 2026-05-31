'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'IN_PROGRESS', label: 'En proceso' },
    { value: 'DONE', label: 'Terminado' },
    { value: 'DELIVERED', label: 'Entregado' },
]

export default function NewRepairPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        clientName: '', clientContact: '', problemDescription: '', diagnosis: '', status: 'PENDING',
    })

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        const { data, ok } = await apiFetch('/cdr/repairs', {
            method: 'POST',
            body: JSON.stringify(form),
        })
        setLoading(false)
        if (ok) router.push(`/repairs/detail?id=${data.id}`)
    }

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-5">
            <div className="flex items-center gap-3">
                <Link href="/repairs" className="btn-secondary py-1.5 px-2.5"><ArrowLeft className="w-4 h-4" /></Link>
                <h1 className="text-xl font-bold text-white">Nueva reparación</h1>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Cliente *</label>
                        <input className="input" value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="Nombre del cliente" required />
                    </div>
                    <div>
                        <label className="label">Contacto</label>
                        <input className="input" value={form.clientContact} onChange={e => set('clientContact', e.target.value)} placeholder="Teléfono o email" />
                    </div>
                </div>

                <div>
                    <label className="label">Descripción del problema *</label>
                    <textarea className="input min-h-[80px] resize-y" value={form.problemDescription} onChange={e => set('problemDescription', e.target.value)} placeholder="¿Cuál es el problema?" required />
                </div>

                <div>
                    <label className="label">Diagnóstico técnico</label>
                    <textarea className="input min-h-[80px] resize-y" value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} placeholder="Diagnóstico inicial..." />
                </div>

                <div>
                    <label className="label">Estado inicial</label>
                    <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : 'Crear reparación'}
                    </button>
                    <Link href="/repairs" className="btn-secondary">Cancelar</Link>
                </div>
            </form>
        </div>
    )
}

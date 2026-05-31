'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Image, FileVideo, Loader2, Save } from 'lucide-react'
import { apiFetch } from '@/lib/api'

const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'IN_PROGRESS', label: 'En proceso' },
    { value: 'DONE', label: 'Terminado' },
    { value: 'DELIVERED', label: 'Entregado' },
]
const STATUS_CLASSES: Record<string, string> = {
    PENDING: 'badge-pending', IN_PROGRESS: 'badge-progress', DONE: 'badge-done', DELIVERED: 'badge-delivered',
}

export default function RepairDetailPage() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const router = useRouter()
    const [repair, setRepair] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [noteContent, setNoteContent] = useState('')
    const [MDEditor, setMDEditor] = useState<any>(null)
    const [parts, setParts] = useState<any[]>([])
    const [selectedPart, setSelectedPart] = useState('')
    const [qty, setQty] = useState(1)
    const [mediaUploading, setMediaUploading] = useState(false)
    const [statusChanging, setStatusChanging] = useState(false)

    useEffect(() => {
        import('@uiw/react-md-editor').then(m => setMDEditor(() => m.default))
    }, [])

    async function loadRepair() {
        if (!id) { router.push('/repairs'); return }
        const { data, ok } = await apiFetch(`/cdr/repairs/${id}`)
        if (!ok) { router.push('/repairs'); return }
        setRepair(data)
        const notesRes = await apiFetch(`/cdr/repairs/${id}/notes`)
        if (notesRes.ok && Array.isArray(notesRes.data) && notesRes.data.length > 0) {
            setNoteContent(notesRes.data[0].content || '')
        }
        setLoading(false)
    }

    async function loadParts() {
        const { data } = await apiFetch<any[]>('/cdr/parts')
        setParts(data || [])
    }

    useEffect(() => { if (id) { loadRepair(); loadParts() } }, [id])

    async function saveNote() {
        setSaving(true)
        await apiFetch(`/cdr/repairs/${id}/notes`, {
            method: 'PUT',
            body: JSON.stringify({ content: noteContent }),
        })
        setSaving(false)
    }

    async function addPart() {
        if (!selectedPart) return
        const { ok, data } = await apiFetch(`/cdr/repairs/${id}/parts`, {
            method: 'POST',
            body: JSON.stringify({ partId: selectedPart, quantity: qty }),
        })
        if (ok) loadRepair()
        else alert((data as any)?.error || 'Error al agregar pieza')
    }

    async function removePart(partId: string) {
        await apiFetch(`/cdr/repairs/${id}/parts/${partId}`, { method: 'DELETE' })
        loadRepair()
    }

    async function uploadMedia(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setMediaUploading(true)
        const fd = new FormData(); fd.append('file', file)
        await apiFetch(`/cdr/repairs/${id}/media`, { method: 'POST', body: fd })
        setMediaUploading(false)
        loadRepair()
    }

    async function deleteMedia(mediaId: string) {
        await apiFetch(`/cdr/repairs/${id}/media/${mediaId}`, { method: 'DELETE' })
        loadRepair()
    }

    async function changeStatus(newStatus: string) {
        setStatusChanging(true)
        await apiFetch(`/cdr/repairs/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus }),
        })
        setStatusChanging(false)
        loadRepair()
    }

    if (!id) return null
    if (loading) return <div className="flex items-center justify-center h-full text-slate-500">Cargando...</div>
    if (!repair) return null

    const usedPartIds = new Set(repair.parts?.map((rp: any) => rp.partId))
    const availableParts = parts.filter(p => !usedPartIds.has(p.id))

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/repairs" className="btn-secondary py-1.5 px-2.5"><ArrowLeft className="w-4 h-4" /></Link>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-white">{repair.clientName}</h1>
                    {repair.clientContact && <p className="text-xs text-slate-400">{repair.clientContact}</p>}
                </div>
                <div className="flex items-center gap-2">
                    {statusChanging ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : null}
                    <select className="input w-auto text-xs py-1.5" value={repair.status} onChange={e => changeStatus(e.target.value)}>
                        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <span className={STATUS_CLASSES[repair.status] || 'badge-pending'}>
                        {STATUS_OPTIONS.find(o => o.value === repair.status)?.label}
                    </span>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                <div className="card space-y-3">
                    <h2 className="font-semibold text-white text-sm">Detalles</h2>
                    <div>
                        <p className="text-xs text-slate-500">Problema</p>
                        <p className="text-sm text-slate-200">{repair.problemDescription}</p>
                    </div>
                    {repair.diagnosis && (
                        <div>
                            <p className="text-xs text-slate-500">Diagnóstico</p>
                            <p className="text-sm text-slate-200">{repair.diagnosis}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-xs text-slate-500">Creado</p>
                        <p className="text-sm text-slate-400">{new Date(repair.createdAt).toLocaleString('es-ES')}</p>
                    </div>
                </div>

                <div className="card space-y-2">
                    <h2 className="font-semibold text-white text-sm">Historial de estados</h2>
                    {repair.history?.length === 0 ? <p className="text-slate-500 text-xs">Sin historial</p> : (
                        <div className="space-y-1 max-h-[200px] overflow-y-auto">
                            {repair.history?.map((h: any) => (
                                <div key={h.id} className="flex items-center gap-2 text-xs text-slate-400 py-1 border-b border-white/5">
                                    <span className="text-slate-500">{new Date(h.changedAt).toLocaleDateString('es-ES')}</span>
                                    {h.oldStatus && <><span className={STATUS_CLASSES[h.oldStatus]}>{h.oldStatus}</span><span>→</span></>}
                                    <span className={STATUS_CLASSES[h.newStatus]}>{h.newStatus}</span>
                                    {h.note && <span className="text-slate-500 ml-auto">{h.note}</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Piezas */}
            <div className="card space-y-3">
                <h2 className="font-semibold text-white text-sm">Piezas utilizadas</h2>
                {repair.parts?.length > 0 && (
                    <div className="space-y-1">
                        {repair.parts.map((rp: any) => (
                            <div key={rp.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-900 text-sm">
                                <span className="text-slate-200">{rp.part.name}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-400 text-xs">{rp.quantity} uds.</span>
                                    <button onClick={() => removePart(rp.partId)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-2">
                    <select className="input flex-1 text-xs" value={selectedPart} onChange={e => setSelectedPart(e.target.value)}>
                        <option value="">Seleccionar pieza...</option>
                        {availableParts.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (stock: {p.stock})</option>
                        ))}
                    </select>
                    <input type="number" min={1} className="input w-20 text-xs" value={qty} onChange={e => setQty(+e.target.value)} />
                    <button onClick={addPart} className="btn-secondary py-1.5 px-3 text-xs" disabled={!selectedPart}>
                        <Plus className="w-3.5 h-3.5" /> Agregar
                    </button>
                </div>
            </div>

            {/* Notas Markdown */}
            <div className="card space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-white text-sm">Notas técnicas</h2>
                    <button onClick={saveNote} className="btn-secondary py-1.5 px-3 text-xs" disabled={saving}>
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
                {MDEditor ? (
                    <MDEditor
                        value={noteContent}
                        onChange={(v: string) => setNoteContent(v || '')}
                        height={250}
                        data-color-mode="dark"
                    />
                ) : (
                    <textarea className="input min-h-[200px] font-mono text-xs"
                        value={noteContent} onChange={e => setNoteContent(e.target.value)}
                        placeholder="Escribe notas técnicas en markdown..." />
                )}
            </div>

            {/* Multimedia */}
            <div className="card space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-white text-sm">Multimedia</h2>
                    <label className="btn-secondary py-1.5 px-3 text-xs cursor-pointer">
                        {mediaUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Subir archivo
                        <input type="file" accept="image/*,video/*" className="hidden" onChange={uploadMedia} />
                    </label>
                </div>
                {repair.media?.length === 0 ? (
                    <p className="text-slate-500 text-xs text-center py-4">No hay archivos subidos</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {repair.media?.map((m: any) => (
                            <div key={m.id} className="relative group rounded-lg overflow-hidden bg-surface-900 aspect-square">
                                {m.type === 'VIDEO' ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-1">
                                        <FileVideo className="w-8 h-8 text-brand-400" />
                                        <span className="text-xs text-slate-400 truncate px-1 max-w-full">{m.filename}</span>
                                    </div>
                                ) : (
                                    <img src={m.url} alt={m.filename} className="w-full h-full object-cover" />
                                )}
                                <button
                                    onClick={() => deleteMedia(m.id)}
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 rounded p-0.5">
                                    <Trash2 className="w-3 h-3 text-white" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

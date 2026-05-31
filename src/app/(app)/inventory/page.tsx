'use client'
import { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, X, Loader2, Save } from 'lucide-react'
import { apiFetch } from '@/lib/api'

interface Part {
    id: string; name: string; category: string; stock: number; price: number; description?: string; isDefault: boolean
}

const EMPTY = { name: '', category: '', stock: 0, price: 0, description: '' }

export default function InventoryPage() {
    const [parts, setParts] = useState<Part[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [form, setForm] = useState(EMPTY)
    const [saving, setSaving] = useState(false)

    async function load() {
        setLoading(true)
        const { data } = await apiFetch<Part[]>(`/cdr/parts?search=${search}`)
        setParts(data || [])
        setLoading(false)
    }

    useEffect(() => { load() }, [search])

    function startEdit(p: Part) {
        setEditId(p.id); setForm({ name: p.name, category: p.category, stock: p.stock, price: p.price, description: p.description || '' })
        setShowForm(true)
    }

    function startNew() { setEditId(null); setForm(EMPTY); setShowForm(true) }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault(); setSaving(true)
        const path = editId ? `/cdr/parts/${editId}` : '/cdr/parts'
        const method = editId ? 'PUT' : 'POST'
        await apiFetch(path, { method, body: JSON.stringify(form) })
        setSaving(false); setShowForm(false); load()
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Eliminar esta pieza?')) return
        await apiFetch(`/cdr/parts/${id}`, { method: 'DELETE' })
        load()
    }

    const categories = [...new Set(parts.map(p => p.category))]
    const grouped = categories.map(cat => ({ cat, items: parts.filter(p => p.category === cat) }))

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Inventario</h1>
                    <p className="text-slate-400 text-sm">{parts.length} piezas en total</p>
                </div>
                <button onClick={startNew} className="btn-primary"><Plus className="w-4 h-4" /> Nueva pieza</button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input className="input pl-9" placeholder="Buscar piezas..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Form modal inline */}
            {showForm && (
                <form onSubmit={handleSave} className="card border-brand-500/20 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-white">{editId ? 'Editar pieza' : 'Nueva pieza'}</h2>
                        <button type="button" onClick={() => setShowForm(false)}><X className="w-4 h-4 text-slate-400 hover:text-white" /></button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                        <div><label className="label">Nombre *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                        <div><label className="label">Categoría *</label>
                            <input className="input" list="cats" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required />
                            <datalist id="cats">{categories.map(c => <option key={c} value={c} />)}</datalist>
                        </div>
                        <div><label className="label">Stock</label><input type="number" min={0} className="input" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: +e.target.value }))} /></div>
                        <div><label className="label">Precio (USD)</label><input type="number" min={0} step={0.01} className="input" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} /></div>
                    </div>
                    <div><label className="label">Descripción</label><input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
                    </div>
                </form>
            )}

            {/* Parts grouped by category */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Cargando...</div>
            ) : (
                <div className="space-y-4">
                    {grouped.map(({ cat, items }) => (
                        <div key={cat} className="card p-0 overflow-hidden">
                            <div className="px-4 py-3 bg-surface-700 border-b border-white/5">
                                <h3 className="text-sm font-semibold text-slate-200">{cat}</h3>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/5 text-xs text-slate-500">
                                        <th className="text-left px-4 py-2">Nombre</th>
                                        <th className="text-center px-3 py-2">Stock</th>
                                        <th className="text-right px-3 py-2">Precio</th>
                                        <th className="px-3 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(p => (
                                        <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-surface-700/50 transition-colors">
                                            <td className="px-4 py-2.5 text-slate-200">{p.name}</td>
                                            <td className="px-3 py-2.5 text-center">
                                                <span className={`font-mono font-bold ${p.stock === 0 ? 'text-red-400' : p.stock <= 5 ? 'text-amber-400' : 'text-green-400'}`}>
                                                    {p.stock}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-right text-slate-400">${p.price.toFixed(2)}</td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => startEdit(p)} className="p-1.5 rounded hover:bg-surface-600 text-slate-400 hover:text-white transition-colors">
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

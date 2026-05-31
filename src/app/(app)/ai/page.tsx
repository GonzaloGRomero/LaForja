'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Cpu, Upload, Loader2, AlertTriangle, CheckCircle, Plus, Trash2, Info } from 'lucide-react'
import { apiFetch } from '@/lib/api'

interface AIComponent {
    type: string; name: string; quantity: number; confidence: number
}

export default function AIPage() {
    const [image, setImage] = useState<string | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [components, setComponents] = useState<AIComponent[]>([])
    const [message, setMessage] = useState('')
    const [available, setAvailable] = useState<boolean | null>(null)
    const [analyzed, setAnalyzed] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return
        setAnalyzed(false); setSaved(false); setComponents([]); setMessage('')
        const reader = new FileReader()
        reader.onload = (e) => {
            const base64 = e.target?.result as string
            setImage(base64)
            setPreview(base64)
        }
        reader.readAsDataURL(file)
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, accept: { 'image/*': [] }, maxFiles: 1,
    })

    async function analyze() {
        if (!image) return
        setLoading(true); setAnalyzed(false); setMessage('')
        // AI endpoint not yet implemented in API REST - show message
        setAvailable(false)
        setMessage('El módulo de IA aún no está configurado en la API REST. Puedes agregar componentes manualmente.')
        setComponents([])
        setLoading(false)
        setAnalyzed(true)
    }

    function updateComponent(i: number, key: keyof AIComponent, value: string | number) {
        setComponents(cs => cs.map((c, idx) => idx === i ? { ...c, [key]: value } : c))
    }

    function removeComponent(i: number) {
        setComponents(cs => cs.filter((_, idx) => idx !== i))
    }

    function addEmpty() {
        setComponents(cs => [...cs, { type: 'otro', name: '', quantity: 1, confidence: 1 }])
    }

    async function saveToInventory() {
        setSaving(true)
        const valid = components.filter(c => c.name.trim())
        for (const c of valid) {
            await apiFetch('/cdr/parts', {
                method: 'POST',
                body: JSON.stringify({ name: c.name, category: c.type, stock: c.quantity, price: 0 }),
            })
        }
        setSaving(false); setSaved(true)
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-5">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">IA · Reconocimiento de componentes</h1>
                    <p className="text-slate-400 text-sm">Sube una imagen y detecta componentes electrónicos automáticamente</p>
                </div>
            </div>

            {/* API notice */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-brand-500/10 border border-brand-500/20 text-sm text-brand-300">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                    El módulo de IA se activará cuando se configure el endpoint en la API REST.
                    Mientras tanto, puedes agregar componentes manualmente.
                </span>
            </div>

            {/* Upload zone */}
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
        ${isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 bg-surface-800 hover:border-brand-500/50 hover:bg-surface-700'}`}>
                <input {...getInputProps()} />
                {preview ? (
                    <div>
                        <img src={preview} alt="Preview" className="max-h-60 mx-auto rounded-lg object-contain mb-3" />
                        <p className="text-xs text-slate-400">Haz clic o arrastra para cambiar la imagen</p>
                    </div>
                ) : (
                    <div>
                        <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-300 font-medium">{isDragActive ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz clic'}</p>
                        <p className="text-slate-500 text-xs mt-1">PNG, JPG, WebP • Máx. 10 MB</p>
                    </div>
                )}
            </div>

            {image && !analyzed && (
                <button onClick={analyze} className="btn-primary" disabled={loading}>
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Analizando con IA...</> : <><Cpu className="w-4 h-4" />Analizar imagen</>}
                </button>
            )}

            {/* Error / mensaje */}
            {analyzed && message && (
                <div className={`flex items-start gap-2 p-3 rounded-lg text-sm border ${available === false
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                        : 'bg-red-500/10 border-red-500/20 text-red-300'
                    }`}>
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">{available === false ? 'IA no configurada' : 'Error en el análisis'}</p>
                        <p className="mt-0.5 opacity-80">{message}</p>
                        {available === false && (
                            <p className="mt-1 opacity-70 text-xs">
                                Puedes agregar componentes manualmente usando el botón de abajo.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Results */}
            {analyzed && (
                <div className="card space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-white text-sm">
                            {components.length > 0 ? `${components.length} componente(s) detectado(s)` : 'No se detectaron componentes'}
                        </h2>
                        <button onClick={addEmpty} className="btn-secondary py-1.5 px-3 text-xs">
                            <Plus className="w-3.5 h-3.5" /> Agregar manual
                        </button>
                    </div>

                    {components.length > 0 ? (
                        <>
                            <p className="text-xs text-slate-400">Puedes editar los resultados antes de guardar.</p>
                            <div className="space-y-2">
                                {components.map((c, i) => (
                                    <div key={i} className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg bg-surface-900">
                                        <div className="col-span-4">
                                            <label className="label">Nombre</label>
                                            <input className="input text-xs" value={c.name} onChange={e => updateComponent(i, 'name', e.target.value)} />
                                        </div>
                                        <div className="col-span-3">
                                            <label className="label">Tipo</label>
                                            <input className="input text-xs" value={c.type} onChange={e => updateComponent(i, 'type', e.target.value)} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="label">Cantidad</label>
                                            <input type="number" min={1} className="input text-xs" value={c.quantity} onChange={e => updateComponent(i, 'quantity', +e.target.value)} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="label">Confianza</label>
                                            <p className="text-sm font-mono text-brand-400">{(c.confidence * 100).toFixed(0)}%</p>
                                        </div>
                                        <div className="col-span-1 pt-4">
                                            <button onClick={() => removeComponent(i)} className="text-slate-500 hover:text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {saved ? (
                                <div className="flex items-center gap-2 text-green-400 text-sm">
                                    <CheckCircle className="w-4 h-4" /> Componentes guardados en inventario
                                </div>
                            ) : (
                                <button onClick={saveToInventory} className="btn-primary" disabled={saving}>
                                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : 'Guardar en inventario'}
                                </button>
                            )}
                        </>
                    ) : (
                        <p className="text-slate-500 text-sm text-center py-4">
                            No se detectaron componentes. Usa &quot;Agregar manual&quot; para ingresar piezas.
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

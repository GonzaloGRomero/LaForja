'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { LayoutDashboard, Wrench, Package, Cpu, LogOut, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/repairs', icon: Wrench, label: 'Reparaciones' },
    { href: '/inventory', icon: Package, label: 'Inventario' },
    { href: '/ai', icon: Cpu, label: 'IA · Componentes' },
]

export function Sidebar() {
    const pathname = usePathname()
    const { logout } = useAuth()

    return (
        <aside className="w-60 flex-shrink-0 bg-surface-900 border-r border-white/5 flex flex-col h-screen">
            {/* Logo */}
            <div className="p-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-brand-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white leading-tight">Taller</p>
                        <p className="text-xs text-slate-500">Reparaciones</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-1">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const active = pathname.startsWith(href)
                    return (
                        <Link key={href} href={href}
                            className={clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                                active
                                    ? 'bg-brand-600/15 text-brand-400 border border-brand-500/20'
                                    : 'text-slate-400 hover:bg-surface-700 hover:text-slate-200'
                            )}>
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1">{label}</span>
                            {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-white/5">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150">
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </aside>
    )
}

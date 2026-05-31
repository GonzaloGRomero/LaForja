import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

export const metadata: Metadata = {
    title: 'Taller de Reparaciones',
    description: 'Gestión profesional de reparaciones de electrodomésticos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    )
}

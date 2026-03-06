"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const navItems = [
    { href: '/', label: '🚀 Simulator', color: 'cyan' },
    { href: '/players', label: '👤 Players', color: 'cyan' },
    { href: '/versus', label: '⚔️ Versus Mode', color: 'rose' },
    { href: '/stadiums', label: '🏟️ Stadiums', color: 'emerald' },
    { href: '/simulations', label: '🎲 Monte Carlo', color: 'fuchsia' },
    { href: '/live', label: '🔴 Live Stream', color: 'red' },
]

const colorMap: Record<string, { active: string, gradient: string }> = {
    cyan: { active: 'from-cyan-500/10 border-l-2 border-cyan-400', gradient: 'before:from-cyan-900/15' },
    rose: { active: 'from-rose-500/10 border-l-2 border-rose-400', gradient: 'before:from-rose-900/15' },
    emerald: { active: 'from-emerald-500/10 border-l-2 border-emerald-400', gradient: 'before:from-emerald-900/15' },
    fuchsia: { active: 'from-fuchsia-500/10 border-l-2 border-fuchsia-400', gradient: 'before:from-fuchsia-900/15' },
    red: { active: 'from-red-500/10 border-l-2 border-red-500', gradient: 'before:from-red-900/15' },
}

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    const currentNav = navItems.find(n => n.href === pathname) || navItems[0]
    const gradientClass = colorMap[currentNav.color]?.gradient || colorMap.cyan.gradient

    return (
        <div className="flex h-screen w-full bg-[#050B14] text-slate-200 font-sans">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:relative z-40 lg:z-20
                w-64 h-full border-r border-slate-800/50 bg-[#02060C] p-4 flex flex-col space-y-6 shrink-0 
                shadow-[4px_0_24px_rgba(0,0,0,0.6)]
                transition-transform duration-300 ease-in-out
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-black text-cyan-400">CRIC<span className="text-white">PRO</span></h1>
                    <button
                        className="lg:hidden text-slate-400 hover:text-white"
                        onClick={() => setMobileOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="flex flex-col space-y-2">
                    {navItems.map(item => {
                        const isActive = pathname === item.href
                        const colors = colorMap[item.color] || colorMap.cyan
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${isActive
                                        ? `bg-gradient-to-r ${colors.active} text-white rounded-r-md`
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                    }`}
                            >
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Main content */}
            <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative isolate before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${gradientClass} before:via-[#050B14]/80 before:to-[#050B14] bg-[url('/carbon-fibre.png')]`}>
                {/* Mobile hamburger */}
                <button
                    className="lg:hidden fixed top-4 left-4 z-50 bg-[#131b2f] border border-slate-700 p-2 rounded-lg text-slate-300 hover:text-white shadow-xl"
                    onClick={() => setMobileOpen(true)}
                    style={{ display: mobileOpen ? 'none' : 'block' }}
                >
                    <Menu className="w-5 h-5" />
                </button>
                {children}
            </div>
        </div>
    )
}

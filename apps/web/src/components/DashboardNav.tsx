'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/assistants', label: 'Assistants', icon: '🤖' },
  { href: '/dashboard/demo', label: 'Widget Demo', icon: '💬' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Resonance
          </span>
        </Link>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname?.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 rounded-lg p-4 border border-cyan-500/20">
          <p className="text-sm text-slate-300 mb-2">Current Plan</p>
          <p className="font-semibold text-cyan-400">Pro Trial</p>
          <p className="text-xs text-slate-500 mt-1">14 days remaining</p>
        </div>
      </div>
    </aside>
  )
}

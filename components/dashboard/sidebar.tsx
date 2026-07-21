'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  Search,
  AlertTriangle,
  Network,
  BarChart3,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react'

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Investigation',
    href: '/dashboard/investigation',
    icon: Search,
  },
  {
    name: 'Leak Detection',
    href: '/dashboard/leaks',
    icon: AlertTriangle,
  },
  {
    name: 'OSINT',
    href: '/dashboard/osint',
    icon: Network,
  },
  {
    name: 'Relationship Graph',
    href: '/dashboard/graph',
    icon: BarChart3,
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <span className="text-lg font-bold text-sidebar-foreground">DIS</span>
        </Link>
        <p className="text-xs text-sidebar-accent-foreground mt-1">
          Investigation System
        </p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Settings & Logout */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
            pathname === '/dashboard/settings'
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </Link>

        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}

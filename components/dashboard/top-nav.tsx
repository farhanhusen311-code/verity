'use client'

import { useState } from 'react'
import { Bell, Settings, User, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { getInitials } from '@/utils/cn'

interface TopNavProps {
  userName?: string
  userEmail?: string
  onMenuClick?: () => void
}

export function TopNav({ userName = 'Admin User', userEmail = 'admin@investigation.com', onMenuClick }: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left Side - Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                onMenuClick?.()
                setMenuOpen(!menuOpen)
              }}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>

            {/* Divider */}
            <div className="hidden sm:block h-6 w-px bg-border" />

            {/* User Avatar Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    {getInitials(userName)}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">{userName}</span>
                  <span className="text-xs text-muted-foreground">{userEmail}</span>
                </div>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4 border-b border-border/50">
                  <p className="text-sm font-medium text-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>

                <div className="p-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-md transition-colors text-sm">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-md transition-colors text-sm">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-border/50 my-2" />
                  <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors text-sm">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

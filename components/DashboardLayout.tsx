'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { Navbar } from './Navbar'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { user, userRole } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    {
      name: 'Browse Rooms',
      href: '/',
      icon: '🔍',
      show: true,
    },
    {
      name: 'My Rooms',
      href: '/my-rooms',
      icon: '🏠',
      show: userRole === 'owner',
    },
    {
      name: 'Add Room',
      href: '/add-room',
      icon: '➕',
      show: userRole === 'owner',
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: '💬',
      show: !!user,
    },
  ].filter(item => item.show)

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'transparent' }}>
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } fixed left-0 top-22 h-[calc(100vh-5rem)] transition-all duration-300 z-40 hidden lg:block backdrop-blur-md`}
          style={{ backgroundColor: 'rgba(240, 242, 255, 0.1)', borderRight: '1px solid rgba(209, 213, 255, 0.1)' }}
        >
          <div className="p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-end mb-4 p-2 rounded-lg transition-colors"
              style={{ color: '#1e319e' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e4ff07'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span>{sidebarOpen ? '←' : '→'}</span>
            </button>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'text-white font-semibold shadow-md'
                        : ''
                    }`}
                    style={isActive ? { backgroundColor: '#1e319e' } : { color: '#1e319e' }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#e0e4ff'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {sidebarOpen && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          }`}
        >
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 shadow-lg backdrop-blur-md" style={{ backgroundColor: 'rgba(30, 49, 158, 0.85)', borderTop: '1px solid rgba(23, 42, 122, 0.7)' }}>
        <nav className="flex justify-around items-center p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive ? 'text-white bg-white/20' : 'text-white/80'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}


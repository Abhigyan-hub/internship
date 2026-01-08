'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, userRole, loading, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 shadow-soft backdrop-blur-md" style={{ backgroundColor: 'rgba(30, 49, 158, 0.85)', borderBottom: '1px solid rgba(23, 42, 122, 0.7)' }}>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Link 
              href="/" 
              className="flex items-center space-x-2 group"
            >
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors border border-white/20">
                <span className="text-lg">🏠</span>
              </div>
              <span className="text-xl font-bold text-white">
                Room Finder
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            {!loading && (
              <>
                {user ? (
                  <>
                    <span className="px-3 py-1.5 text-xs sm:text-sm bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium border border-white/30">
                      {userRole === 'owner' ? '🏠 Owner' : '🔍 Finder'}
                    </span>
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-semibold text-sm border border-white/30">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 text-sm font-medium text-white hover:bg-white/20 rounded-lg transition-all"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth"
                      className="px-4 py-2 text-sm font-medium text-white hover:bg-white/20 rounded-lg transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth"
                      className="px-4 py-2.5 text-sm font-semibold bg-white rounded-lg hover:bg-gray-50 transition-all shadow-md"
                      style={{ color: '#1e319e' }}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}


'use client'

import { useAuth } from './AuthProvider'
import { useState } from 'react'

export function RoleSwitcher() {
  const { user, userRole, updateUserRole, loading } = useAuth()
  const [switching, setSwitching] = useState(false)

  if (!user || loading) {
    return null
  }

  const handleRoleSwitch = async (newRole: 'owner' | 'finder') => {
    if (newRole === userRole || switching) return

    setSwitching(true)
    try {
      await updateUserRole(newRole)
    } catch (error) {
      console.error('Failed to switch role:', error)
      alert('Failed to switch role. Please try again.')
    } finally {
      setSwitching(false)
    }
  }

  // If user has no role set, default to 'finder'
  const currentRole = userRole || 'finder'

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 border border-gray-100">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            Switch Your Role
          </h2>
          <p className="text-xs text-gray-600">
            Toggle between Room Owner and Room Finder modes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleRoleSwitch('owner')}
            disabled={switching}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              currentRole === 'owner'
                ? 'bg-primary-600 text-white shadow-soft'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${switching ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {switching && currentRole !== 'owner' ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Switching...
              </span>
            ) : (
              '🏠 Owner'
            )}
          </button>
          <button
            onClick={() => handleRoleSwitch('finder')}
            disabled={switching}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              currentRole === 'finder'
                ? 'bg-primary-600 text-white shadow-soft'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${switching ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {switching && currentRole !== 'finder' ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Switching...
              </span>
            ) : (
              '🔍 Finder'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}


'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/supabase-admin'

type UserRole = 'owner' | 'finder' | null

interface AuthContextType {
  user: User | null
  userRole: UserRole
  isAdminUser: boolean
  loading: boolean
  signOut: () => Promise<void>
  updateUserRole: (role: 'owner' | 'finder') => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  isAdminUser: false,
  loading: true,
  signOut: async () => {},
  updateUserRole: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAdminStatus = async (userEmail: string | undefined) => {
    if (!userEmail) {
      setIsAdminUser(false)
      return
    }
    const admin = await isAdmin(userEmail)
    setIsAdminUser(admin)
  }

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const role = (session.user.user_metadata?.user_role as UserRole) || null
        setUserRole(role)
        await checkAdminStatus(session.user.email)
      } else {
        setIsAdminUser(false)
      }
      setLoading(false)
    })

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const role = (session.user.user_metadata?.user_role as UserRole) || null
        setUserRole(role)
        await checkAdminStatus(session.user.email)
      } else {
        setUserRole(null)
        setIsAdminUser(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
  }

  const updateUserRole = async (role: 'owner' | 'finder') => {
    if (!user) return

    const { data, error } = await supabase.auth.updateUser({
      data: { user_role: role },
    })

    if (error) {
      console.error('Error updating user role:', error)
      throw error
    }

    if (data?.user) {
      setUser(data.user)
      setUserRole(role)
      // Refresh session to ensure all components get the update
      await supabase.auth.refreshSession()
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, userRole, isAdminUser, loading, signOut, updateUserRole }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)


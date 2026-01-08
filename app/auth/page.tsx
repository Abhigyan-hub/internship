'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/Navbar'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [userRole, setUserRole] = useState<'owner' | 'finder'>('finder')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              user_role: userRole,
            },
          },
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        })
        if (error) throw error
        setMessage('Check your email for the OTP link!')
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-card p-8 sm:p-10 border border-gray-100">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white hover:border-gray-300 text-sm"
                placeholder="your@email.com"
              />
            </div>
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setUserRole('owner')}
                    className={`px-6 py-4 rounded-2xl border-2 transition-all ${
                      userRole === 'owner'
                        ? 'border-black bg-black text-white font-bold shadow-soft-lg scale-105'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:scale-105'
                    }`}
                  >
                    🏠 Room Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRole('finder')}
                    className={`px-6 py-4 rounded-2xl border-2 transition-all ${
                      userRole === 'finder'
                        ? 'border-primary-600 bg-primary-600 text-white font-bold shadow-soft-lg scale-105'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:scale-105'
                    }`}
                  >
                    🔍 Room Finder
                  </button>
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 font-semibold"
            >
              {loading
                ? 'Loading...'
                : isSignUp
                ? 'Sign Up'
                : 'Send Magic Link'}
            </button>
          </form>
          {message && (
            <div
              className={`mt-4 p-3 rounded-lg ${
                message.includes('error') || message.includes('Error')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {message}
            </div>
          )}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-600 hover:text-primary-700"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}


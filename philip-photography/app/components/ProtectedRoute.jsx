'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/src/contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const router = useRouter()
  const { loading, isAuthenticated, isAdmin } = useAuth()
  const isDev = process.env.NODE_ENV === 'development'

  useEffect(() => {
    // In development, allow access without auth to avoid redirect loops while testing admin UI
    if (isDev) return
    if (loading) return
    if (!isAuthenticated || !isAdmin) {
      router.replace('/')
    }
  }, [loading, isAuthenticated, isAdmin, router, isDev])

  // In development, bypass auth for local testing
  if (isDev) {
    return children
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] transition-colors duration-[var(--t-base)] flex items-center justify-center p-2 sm:p-4 pt-20 sm:pt-24">
        <div className="text-center max-w-xs sm:max-w-sm mx-auto">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-[rgb(var(--primary))] animate-spin" />
          </div>
          <p className="text-sm sm:text-base text-[rgb(var(--fg-muted))]">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If unauthorized, redirect effect will run; render nothing so admin UI never flashes.
  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return children
}












'use client'

import { useEffect } from 'react'
import { initTheme } from '../theme'

export function ThemeProvider({ children }) {
  useEffect(() => {
    // Theme is already applied by blocking script in layout.jsx
    // This just ensures system preference changes are tracked
    initTheme()
  }, [])

  return <>{children}</>
}





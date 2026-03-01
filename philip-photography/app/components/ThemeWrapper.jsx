'use client'

import { useTheme } from '@/src/contexts/ThemeContext'
import SplitLanding from './SplitLanding'
import styles from './SplitLanding.module.css'

export default function ThemeWrapper({ children }) {
  const { isLandingOpen, forceLandingOpen } = useTheme()

  // Wait for theme to be initialized (mounted)
  // But SplitLanding handles its own state via context too.
  // We just need to wrap children.
  
  return (
    <>
      <SplitLanding />
      <div className={`${styles.mainContent} ${!isLandingOpen ? styles.mainContentActive : ''} ${forceLandingOpen ? styles.forceHidden : ''}`}>
        {children}
      </div>
    </>
  )
}

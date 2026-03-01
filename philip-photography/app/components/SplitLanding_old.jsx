'use client'

import styles from './SplitLanding.module.css'
import { useTheme, THEMES } from '@/src/contexts/ThemeContext'

export default function SplitLanding() {
  const { isLandingOpen, forceLandingOpen, setTheme } = useTheme()

  // If theme is selected (landing closed), add a class to slide up
  // We use inline style or a conditional class for the container
  const containerClass = `${styles.splitContainer} ${!isLandingOpen ? styles.hidden : ''} ${forceLandingOpen ? styles.forceOpen : ''}`

  return (
    <div className={containerClass}>
      {/* Introduction Overlay */}
      <div className={styles.introOverlay}>
        <img
          src="/DarkmodeLogo.svg"
          alt="JP Morada logo"
          className={styles.introLogo}
        />
        <h1>John Philip Morada</h1>
        <p className={styles.introKicker}>Photography Portfolio</p>
        <div className={styles.introMeta}>
          <span className={styles.metaTopics}>Wildlife • Night Sky • Landscapes</span>
        </div>
      </div>

      {/* Tutorial hint (separate from the intro meta pill) */}
      <div className={styles.tutorialDock} aria-label="How to enter: pick a style">
        <span className={styles.tutorial}>
          <span className={styles.stepBadge} aria-hidden="true">1</span>
          <span className={styles.stepText}>Pick a style</span>
          <span className={styles.stepArrow} aria-hidden="true">→</span>
          <span className={styles.stepBadge} aria-hidden="true">2</span>
          <span className={styles.stepText}>Enter</span>
        </span>
      </div>

      <div 
        className={`${styles.splitPanel} ${styles.birdlife}`} 
        onClick={() => setTheme(THEMES.BIRDLIFE)}
      >
        <div className={styles.panelContent}>
          <h2>Birdlife</h2>
          <p>Capturing the freedom of the skies</p>
          <div className={styles.panelDetails} aria-hidden="true">
            <span className={styles.detailChip}>Wildlife</span>
            <span className={styles.detailChip}>Fieldcraft</span>
            <span className={styles.detailChip}>Conservation</span>
          </div>
        </div>
      </div>
      <div 
        className={`${styles.splitPanel} ${styles.astro}`} 
        onClick={() => setTheme(THEMES.ASTRO)}
      >
        <div className={styles.panelContent}>
          <h2>Astro</h2>
          <p>Exploring the infinite cosmos</p>
          <div className={styles.panelDetails} aria-hidden="true">
            <span className={styles.detailChip}>Long exposure</span>
            <span className={styles.detailChip}>Tracking</span>
            <span className={styles.detailChip}>Deep sky</span>
          </div>
        </div>
      </div>
      <div 
        className={`${styles.splitPanel} ${styles.landscape}`} 
        onClick={() => setTheme(THEMES.LANDSCAPE)}
      >
        <div className={styles.panelContent}>
          <h2>Landscape</h2>
          <p>The raw beauty of earth</p>
          <div className={styles.panelDetails} aria-hidden="true">
            <span className={styles.detailChip}>Golden hour</span>
            <span className={styles.detailChip}>Weather</span>
            <span className={styles.detailChip}>Print-ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}

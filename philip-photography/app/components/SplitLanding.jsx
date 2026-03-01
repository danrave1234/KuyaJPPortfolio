'use client'

import { useState, useEffect } from 'react'
import styles from './SplitLanding.module.css'
import { useTheme, THEMES } from '@/src/contexts/ThemeContext'

export default function SplitLanding() {
  const { isLandingOpen, forceLandingOpen, setTheme } = useTheme()

  // Determine container classes
  const containerClass = `
    ${styles.splitContainer} 
    ${!isLandingOpen ? styles.hidden : ''} 
    ${forceLandingOpen ? styles.forceOpen : ''}
  `

  const handlePanelClick = (theme) => {
    setTheme(theme)
  }

  const handleButtonClick = (e, theme) => {
    e.stopPropagation() // Prevent bubbling to panel click
    setTheme(theme)
  }

  return (
    <div className={containerClass}>
      
      {/* Introduction Overlay */}
      <div className={styles.introOverlay}>
        <img
          src="/DarkmodeLogo.svg"
          alt="JP Morada logo"
          className={styles.logo}
        />
        <h1 className={styles.mainTitle}>John Philip Morada</h1>
        <p className={styles.subTitle}>Photography Portfolio</p>
      </div>

      {/* Tutorial Hint - Hidden when expanded to clear view */}
      <div className={styles.tutorialHint}>
        Select your journey
      </div>

      {/* Birdlife Panel */}
      <div 
        className={`
          ${styles.panel} 
          ${styles.birdlife}
        `}
        onClick={() => handlePanelClick(THEMES.BIRDLIFE)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setTheme(THEMES.BIRDLIFE)}
        role="button"
        tabIndex={0}
        aria-label="Select Birdlife Theme"
      >
        <div className={styles.panelBg} />
        <div className={styles.panelContent}>
          <h2 className={styles.panelTitle}>Birdlife</h2>
          <p className={styles.panelDescription}>
            Capturing the freedom of the skies. 
            Experience the raw beauty of avian life in motion.
          </p>
          <button 
            className={styles.exploreBtn} 
            tabIndex={-1}
            onClick={(e) => handleButtonClick(e, THEMES.BIRDLIFE)}
          >
            Explore Gallery
          </button>
        </div>
      </div>

      {/* Astro Panel */}
      <div 
        className={`
          ${styles.panel} 
          ${styles.astro}
        `}
        onClick={() => handlePanelClick(THEMES.ASTRO)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setTheme(THEMES.ASTRO)}
        role="button"
        tabIndex={0}
        aria-label="Select Astro Theme"
      >
        <div className={styles.panelBg} />
        <div className={styles.panelContent}>
          <h2 className={styles.panelTitle}>Astro</h2>
          <p className={styles.panelDescription}>
            Exploring the infinite cosmos. 
            Journey into the depths of the night sky and beyond.
          </p>
          <button 
            className={styles.exploreBtn} 
            tabIndex={-1}
            onClick={(e) => handleButtonClick(e, THEMES.ASTRO)}
          >
            Explore Gallery
          </button>
        </div>
      </div>

      {/* Landscape Panel */}
      <div 
        className={`
          ${styles.panel} 
          ${styles.landscape}
        `}
        onClick={() => handlePanelClick(THEMES.LANDSCAPE)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setTheme(THEMES.LANDSCAPE)}
        role="button"
        tabIndex={0}
        aria-label="Select Landscape Theme"
      >
        <div className={styles.panelBg} />
        <div className={styles.panelContent}>
          <h2 className={styles.panelTitle}>Landscape</h2>
          <p className={styles.panelDescription}>
            The raw beauty of earth. 
            Discover breathtaking vistas and nature's finest moments.
          </p>
          <button 
            className={styles.exploreBtn} 
            tabIndex={-1}
            onClick={(e) => handleButtonClick(e, THEMES.LANDSCAPE)}
          >
            Explore Gallery
          </button>
        </div>
      </div>

    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { useScroll } from '@/src/contexts/ScrollContext'

export default function ScrollSnapContainer({ children, onActiveSectionChange, onScroll }) {
  const scrollContainerRef = useRef(null)
  const [activeSection, setActiveSection] = useState('home')
  const { setScrollY } = useScroll()

  useEffect(() => {
    // Prevent body scrolling when scroll snapping container is active
    const originalOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      // Restore original overflow when component unmounts
      document.body.style.overflow = originalOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
    }
  }, [])

  useEffect(() => {
    const observerOptions = {
      root: null,
      threshold: 0.5,
      rootMargin: '-100px 0px 0px 0px', // adjust for fixed header height
    }

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id || 'home'
          setActiveSection(sectionId)
          if (onActiveSectionChange) {
            onActiveSectionChange(sectionId)
          }
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)
    const sections = document.querySelectorAll('section[id]')
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [onActiveSectionChange])

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const handleScroll = (e) => {
      const scrollY = e.target.scrollTop

      // Update our central scroll state
      setScrollY(scrollY)

      // Call the onScroll callback if provided
      if (onScroll) {
        onScroll(scrollY)
      }
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [onScroll, setScrollY])

  return (
    <main className="overflow-x-hidden">
      <div
        ref={scrollContainerRef}
        className="h-dvh overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth"
      >
        {children}
      </div>
    </main>
  )
}












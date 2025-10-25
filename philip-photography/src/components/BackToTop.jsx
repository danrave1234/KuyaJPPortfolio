import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronUp } from 'lucide-react'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const toggleVisibility = () => {
      // Check for custom scroll container first (Home page)
      const scrollContainer = document.querySelector('.snap-y.snap-mandatory')
      let scrollY = 0
      
      if (scrollContainer) {
        // Use custom container scroll position
        scrollY = scrollContainer.scrollTop
      } else {
        // Use window scroll position for other pages
        scrollY = window.scrollY
      }
      
      if (scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // Listen to both window scroll and custom container scroll
    window.addEventListener('scroll', toggleVisibility, { passive: true })
    
    const scrollContainer = document.querySelector('.snap-y.snap-mandatory')
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', toggleVisibility, { passive: true })
    }

    // Initial check
    toggleVisibility()

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', toggleVisibility)
      }
    }
  }, [])

  // Reset visibility when route changes, but be smart about Gallery scroll restoration
  useEffect(() => {
    const isGalleryRoute = location.pathname === '/gallery'
    
    if (isGalleryRoute) {
      // For Gallery, check if we have a saved scroll position (indicating modal close)
      const savedScroll = sessionStorage.getItem('gallery-scrollY')
      if (savedScroll && parseInt(savedScroll) > 0) {
        // We're restoring scroll position, don't reset visibility immediately
        // Let the scroll restoration complete first
        const timer = setTimeout(() => {
          setIsVisible(false)
        }, 200)
        return () => clearTimeout(timer)
      } else {
        // No saved scroll, safe to reset immediately
        setIsVisible(false)
      }
    } else {
      // For other routes, reset immediately
      setIsVisible(false)
    }
  }, [location.pathname])

  const scrollToTop = () => {
    // First try to find the custom scroll container
    const scrollContainer = document.querySelector('.snap-y.snap-mandatory')
    
    if (scrollContainer) {
      // Scroll the custom container
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    } else {
      // Fallback to window scroll for other pages
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[rgb(var(--primary))] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[rgb(var(--primary))]/25 back-to-top-mobile"
      aria-label="Back to top"
    >
      <ChevronUp size={20} />
    </button>
  )
}

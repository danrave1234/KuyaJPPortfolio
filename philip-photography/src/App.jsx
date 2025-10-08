import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useLayoutEffect, useState, useRef } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import BackToTop from './components/BackToTop.jsx'
import Home from './pages/Home.jsx'
import Gallery from './pages/Gallery.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Admin from './pages/Admin.jsx'

// Component to scroll to top on route change
function ScrollToTop({ onRouteChange }) {
  const { pathname } = useLocation()

  // Ensure the browser doesn't try to restore scroll position automatically
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useLayoutEffect(() => {
    // Force scroll position to the very top on every route change
    const reset = () => {
      // Reset all common scroll roots
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
    // Run immediately and again on next frame to cover late paints
    reset()
    requestAnimationFrame(reset)

    // Notify parent about route change
    if (typeof onRouteChange === 'function') {
      onRouteChange(pathname)
    }
  }, [pathname])

  return null
}

// Main scroll container component for scroll snapping
function ScrollSnapContainer({ children, onActiveSectionChange, onScroll }) {
  const scrollContainerRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile devices and set viewport height
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                            window.innerWidth <= 768 ||
                            ('ontouchstart' in window) ||
                            (navigator.maxTouchPoints > 0)
      setIsMobile(isMobileDevice)
    }

    const setViewportHeight = () => {
      if (isMobile) {
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
      }
    }

    checkMobile()
    setViewportHeight()
    
    window.addEventListener('resize', () => {
      checkMobile()
      setViewportHeight()
    })
    
    // Handle orientation change on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(setViewportHeight, 100)
    })

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('orientationchange', setViewportHeight)
    }
  }, [isMobile])

  useEffect(() => {
    // Only prevent body scrolling on desktop
    if (!isMobile) {
      const originalOverflow = document.body.style.overflow
      const originalHtmlOverflow = document.documentElement.style.overflow
      
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'

      return () => {
        // Restore original overflow when component unmounts
        document.body.style.overflow = originalOverflow
        document.documentElement.style.overflow = originalHtmlOverflow
      }
    }
  }, [isMobile])

  useEffect(() => {
    const observerOptions = {
      root: null,
      threshold: 0.5,
      rootMargin: '-100px 0px 0px 0px', // adjust for fixed header height
    }

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onActiveSectionChange(entry.target.id)
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

    let scrollTimeout
    let isScrolling = false

    const handleScroll = (e) => {
      // Emit scroll event to window for header detection
      const scrollY = e.target.scrollTop
      window.scrollY = scrollY
      window.dispatchEvent(new Event('scroll'))
      
      // Call the onScroll callback if provided
      if (onScroll) {
        onScroll(scrollY)
      }

      // On mobile, add more aggressive snapping behavior after scroll stops
      if (isMobile) {
        isScrolling = true
        clearTimeout(scrollTimeout)
        
        scrollTimeout = setTimeout(() => {
          isScrolling = false
          const containerHeight = scrollContainer.clientHeight
          const scrollTop = scrollContainer.scrollTop
          const currentSection = Math.round(scrollTop / containerHeight)
          const targetScrollTop = currentSection * containerHeight
          
          // More aggressive snapping - snap if within 40% of section height
          const threshold = containerHeight * 0.4
          if (Math.abs(scrollTop - targetScrollTop) < threshold) {
            scrollContainer.scrollTo({
              top: targetScrollTop,
              behavior: 'smooth'
            })
          }
        }, 100) // Faster response - wait only 100ms after scroll stops
      }
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    
    // Add touch event listeners for more immediate snapping on mobile
    if (isMobile) {
      const handleTouchEnd = () => {
        // Immediate snap check on touch end
        setTimeout(() => {
          const containerHeight = scrollContainer.clientHeight
          const scrollTop = scrollContainer.scrollTop
          const currentSection = Math.round(scrollTop / containerHeight)
          const targetScrollTop = currentSection * containerHeight
          
          // Very aggressive snapping - snap if within 50% of section height
          const threshold = containerHeight * 0.5
          if (Math.abs(scrollTop - targetScrollTop) < threshold) {
            scrollContainer.scrollTo({
              top: targetScrollTop,
              behavior: 'smooth'
            })
          }
        }, 50) // Very fast response
      }
      
      scrollContainer.addEventListener('touchend', handleTouchEnd, { passive: true })
      
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll)
        scrollContainer.removeEventListener('touchend', handleTouchEnd)
        clearTimeout(scrollTimeout)
      }
    }
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [onScroll, isMobile])

  return (
    <main className="overflow-x-hidden">
      <div 
        ref={scrollContainerRef}
        className={`h-screen overflow-y-auto overflow-x-hidden ${
          isMobile 
            ? 'scroll-container-mobile' 
            : 'scroll-container-desktop'
        }`}
        style={{
          // Allow natural scroll behavior on mobile for URL bar hiding
          ...(isMobile && {
            height: 'calc(var(--vh, 1vh) * 100)', // Use CSS custom property for better mobile support
          })
        }}
      >
        {children}
      </div>
    </main>
  )
}

function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [scrolled, setScrolled] = useState(false)

  const handleScroll = (scrollY) => {
    setScrolled(scrollY > 10)
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop onRouteChange={(path) => {
          // Ensure navbar returns to transparent state when landing on Home at top
          if (path === '/') {
            setScrolled(false)
          }
        }} />
        <Navbar activeSection={activeSection} scrolled={scrolled} />
        <Routes>
          <Route path="/" element={
            <ScrollSnapContainer onActiveSectionChange={setActiveSection} onScroll={handleScroll}>
              <Home />
            </ScrollSnapContainer>
          } />
          <Route path="/gallery" element={
            <>
              <Gallery />
              <Footer />
            </>
          } />
          <Route path="/about" element={
            <>
              <About />
              <Footer />
            </>
          } />
          <Route path="/contact" element={
            <>
              <Contact />
              <Footer />
            </>
          } />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <BackToTop />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

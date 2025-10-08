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

  useEffect(() => {
    // Prevent body scrolling when scroll snapping container is active
    const originalOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow
    
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    
    // Also set position fixed to prevent mobile browser URL bar issues
    const originalBodyPosition = document.body.style.position
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'

    return () => {
      // Restore original styles when component unmounts
      document.body.style.overflow = originalOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.position = originalBodyPosition
      document.body.style.width = ''
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

    let ticking = false
    
    const handleScroll = (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Emit scroll event to window for header detection
          const scrollY = e.target.scrollTop
          window.scrollY = scrollY
          window.dispatchEvent(new Event('scroll'))
          
          // Call the onScroll callback if provided
          if (onScroll) {
            onScroll(scrollY)
          }
          
          ticking = false
        })
        ticking = true
      }
    }

    // Also listen for window resize events to handle URL bar changes
    const handleResize = () => {
      if (onScroll) {
        // Use requestAnimationFrame to ensure proper timing
        requestAnimationFrame(() => {
          onScroll(scrollContainer.scrollTop)
        })
      }
    }

    // Initial scroll state check
    const initialScrollCheck = () => {
      if (onScroll) {
        onScroll(scrollContainer.scrollTop)
      }
    }
    
    // Run initial check after a short delay to ensure proper initialization
    const initialTimeout = setTimeout(initialScrollCheck, 100)

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
    
    return () => {
      clearTimeout(initialTimeout)
      scrollContainer.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [onScroll])

  return (
    <main className="overflow-x-hidden">
      <div 
        ref={scrollContainerRef}
        className="h-screen overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth"
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
    // Use a smaller threshold and add some tolerance for mobile browser quirks
    setScrolled(scrollY > 5)
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop onRouteChange={(path) => {
          // Ensure navbar returns to transparent state when landing on Home at top
          if (path === '/') {
            setScrolled(false)
            // Also reset scroll position to ensure clean state
            setTimeout(() => setScrolled(false), 100)
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

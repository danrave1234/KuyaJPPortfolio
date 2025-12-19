import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useLayoutEffect, useState, useRef } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { analytics } from './firebase/config'
import { logEvent } from 'firebase/analytics'
import { initializeAnalytics, trackPageView } from './services/analytics'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import BackToTop from './components/BackToTop.jsx'
import Home from './page-components/Home.jsx'
import Gallery from './page-components/Gallery.jsx'
import About from './page-components/About.jsx'
import Contact from './page-components/Contact.jsx'
import Services from './page-components/Services.jsx'
import Admin from './page-components/Admin.jsx'
import NotFound from './page-components/NotFound.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Component to control scroll on route change
function ScrollToTop({ onRouteChange }) {
  const location = useLocation()
  const { pathname, state } = location

  // Ensure the browser doesn't try to restore scroll position automatically
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useLayoutEffect(() => {
    const isGalleryRoute = pathname === '/gallery' || pathname.startsWith('/gallery/')
    const savedScroll = (() => {
      // Prefer state passed via navigation
      if (state && typeof state.scrollPosition === 'number') return state.scrollPosition
      const fromSession = sessionStorage.getItem('gallery-scrollY')
      return fromSession ? parseInt(fromSession, 10) : null
    })()

    // For gallery routes, restore stored scroll if requested/available
    if (isGalleryRoute) {
      // If we navigated back to /gallery after closing modal, try to restore
      const shouldRestore = state?.restoreScroll || (pathname === '/gallery' && savedScroll != null)
      if (shouldRestore && savedScroll != null && !Number.isNaN(savedScroll)) {
        // Restore on next frame to ensure layout is ready
        requestAnimationFrame(() => {
          window.scrollTo({ top: savedScroll, left: 0, behavior: 'auto' })
        })
      }
    } else {
      // Non-gallery routes: force scroll to top as before
      const reset = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      }
      reset()
      requestAnimationFrame(reset)
    }

    // Track page views with Google Analytics
    if (analytics) {
      logEvent(analytics, 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: pathname
      })
    }

    // Track page views with custom analytics
    const pageName = pathname === '/' ? 'Home' : 
                    pathname.replace('/', '').charAt(0).toUpperCase() + 
                    pathname.slice(2);
    trackPageView(pageName, { path: pathname });

    // Notify parent about route change
    if (typeof onRouteChange === 'function') {
      onRouteChange(pathname)
    }
    }, [pathname, state])

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

    const handleScroll = (e) => {
      // Emit scroll event to window for header detection
      const scrollY = e.target.scrollTop
      window.scrollY = scrollY
      window.dispatchEvent(new Event('scroll'))
      
      // Call the onScroll callback if provided
      if (onScroll) {
        onScroll(scrollY)
      }
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
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

  // Initialize analytics on app start
  useEffect(() => {
    initializeAnalytics()
  }, [])

  const handleScroll = (scrollY) => {
    setScrolled(scrollY > 10)
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
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
          <Route path="/gallery/:imageSlug" element={
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
          <Route path="/services" element={
            <>
              <Services />
              <Footer />
            </>
          } />
          <Route path="/contact" element={
            <>
              <Contact />
              <Footer />
            </>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
          </Routes>
          <BackToTop />
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

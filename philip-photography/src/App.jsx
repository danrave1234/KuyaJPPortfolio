import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
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
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll to top when pathname changes with smooth behavior
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
  }, [pathname])

  return null
}

// Main scroll container component for scroll snapping
function ScrollSnapContainer({ children, onActiveSectionChange }) {
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

  return (
    <main className="">
      <div className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth">
        {children}
      </div>
    </main>
  )
}

function App() {
  const [activeSection, setActiveSection] = useState('home')

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar activeSection={activeSection} />
        <Routes>
          <Route path="/" element={
            <ScrollSnapContainer onActiveSectionChange={setActiveSection}>
              <Home />
            </ScrollSnapContainer>
          } />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <BackToTop />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

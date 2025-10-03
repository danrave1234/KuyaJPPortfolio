import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <Footer />
        <BackToTop />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import BackToTop from './components/BackToTop.jsx'
import Home from './pages/Home.jsx'
import Gallery from './pages/Gallery.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Admin from './pages/Admin.jsx'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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

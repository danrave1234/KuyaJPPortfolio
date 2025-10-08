import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toggleTheme } from '../theme.js'
import { Moon, Sun, Menu, X } from 'lucide-react'

export default function Navbar({ activeSection = 'home', scrolled = false }) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [localScrolled, setLocalScrolled] = useState(false)
  const location = useLocation()

  // Handle scroll detection for non-home pages
  useEffect(() => {
    if (location.pathname !== '/') {
      const onScroll = () => setLocalScrolled(window.scrollY > 10)
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    } else {
      setLocalScrolled(false)
    }
  }, [location.pathname])

  // Use local scroll state for non-home pages, parent scroll state for home page
  const isScrolled = location.pathname === '/' ? scrolled : localScrolled

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  
  const isHomePage = location.pathname === '/'
  const showBackground = isScrolled || !isHomePage
  const showBorder = isScrolled || !isHomePage

  // Get current page name for mobile menu indicator
  const getCurrentPageName = () => {
    switch (location.pathname) {
      case '/':
        return 'Home'
      case '/gallery':
        return 'Gallery'
      case '/about':
        return 'About'
      case '/contact':
        return 'Contact'
      default:
        return 'Menu'
    }
  }
  
  const linkBase = (isActive) =>
    `relative px-3 py-2 text-sm font-semibold ${showBackground ? 'text-[rgb(var(--fg))]' : 'text-white drop-shadow-lg'} transition-colors duration-300 opacity-90 hover:opacity-100 after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:h-0.5 after:w-full after:bg-current after:transition-transform after:duration-300 after:origin-center ${isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}`;

  const mobileLinkBase = (isActive) =>
    `block px-6 py-4 text-base font-semibold transition-all duration-300 rounded-2xl mx-2 my-1 ${showBackground ? 'text-[rgb(var(--fg))]' : 'text-white'} hover:bg-gradient-to-r hover:from-[rgb(var(--primary))]/10 hover:to-[rgb(var(--primary))]/5 hover:shadow-md hover:scale-[1.02] ${isActive ? 'bg-gradient-to-r from-[rgb(var(--primary))]/20 to-[rgb(var(--primary))]/10 shadow-lg scale-[1.02]' : ''}`;
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-20 transition-all duration-300 ${
      showBackground 
        ? 'bg-[rgb(var(--bg))]/95 shadow-sm backdrop-blur-md border-b border-gray-200 dark:border-gray-800' 
        : 'bg-transparent backdrop-blur-0 border-b border-transparent'
    }`}>
      <nav className="container-responsive h-14 md:h-16 flex items-center justify-between">
        {/* Logo */}
        <div>
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={isDark ? "/DarkmodeLogo.svg" : "/LightmodeLogo.svg"} 
              alt="Philip Photography Logo" 
              className="h-8 md:h-10 w-auto"
            />
            <span className={`font-semibold font-heading transition-colors duration-300 ${showBackground ? 'text-[rgb(var(--fg))]' : 'text-white drop-shadow-lg'}`}>
              Wing Focus
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) => linkBase(isActive)}
          >Home</NavLink>
          <NavLink
            to="/gallery"
            className={({ isActive }) => linkBase(isActive)}
          >Gallery</NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => linkBase(isActive)}
          >About</NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => linkBase(isActive)}
          >Contact</NavLink>
        </div>

        {/* Desktop Theme Toggle */}
        <div className="hidden md:flex items-center">
          <button 
            className={`p-2 rounded-md transition-colors duration-300 ${showBackground ? 'text-[rgb(var(--fg))]' : 'text-white drop-shadow-lg'} opacity-70 hover:opacity-100`}
            onClick={() => toggleTheme()}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <button 
            className={`p-2 rounded-xl transition-all duration-300 ${showBackground ? 'text-[rgb(var(--fg))] hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-white drop-shadow-lg hover:bg-white/10'} opacity-70 hover:opacity-100 hover:scale-105`}
            onClick={() => toggleTheme()}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition-all duration-300 ${showBackground ? 'text-[rgb(var(--fg))] hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-white drop-shadow-lg hover:bg-white/10'} opacity-70 hover:opacity-100 hover:scale-105 ${isMobileMenuOpen ? 'bg-[rgb(var(--primary))]/10' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            <span className="text-sm font-medium hidden sm:block">
              {getCurrentPageName()}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-14 md:top-16 left-0 right-0 bg-[rgb(var(--bg))]/98 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-2xl mobile-menu-enter rounded-b-3xl">
          <div className="container-responsive py-4">
            {/* Menu Header */}
            <div className="px-6 py-3 mb-2 border-b border-gray-200/30 dark:border-gray-700/30">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-[rgb(var(--primary))] to-[rgb(var(--primary))]/60 rounded-full"></div>
                <p className="text-sm text-[rgb(var(--muted))] font-medium">Navigation</p>
              </div>
            </div>
            
            {/* Navigation Links */}
            <div className="space-y-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) => mobileLinkBase(isActive)}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3 mobile-link-enter">
                  <div className="w-2 h-2 rounded-full bg-[rgb(var(--primary))] opacity-60 transition-all duration-300 hover:opacity-100 hover:scale-125"></div>
                  <span>Home</span>
                  <div className="ml-auto text-xs text-[rgb(var(--muted))] opacity-0 group-hover:opacity-100 transition-opacity duration-300">🏠</div>
                </div>
              </NavLink>
              <NavLink
                to="/gallery"
                className={({ isActive }) => mobileLinkBase(isActive)}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3 mobile-link-enter">
                  <div className="w-2 h-2 rounded-full bg-[rgb(var(--primary))] opacity-60 transition-all duration-300 hover:opacity-100 hover:scale-125"></div>
                  <span>Gallery</span>
                  <div className="ml-auto text-xs text-[rgb(var(--muted))] opacity-0 group-hover:opacity-100 transition-opacity duration-300">📸</div>
                </div>
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) => mobileLinkBase(isActive)}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3 mobile-link-enter">
                  <div className="w-2 h-2 rounded-full bg-[rgb(var(--primary))] opacity-60 transition-all duration-300 hover:opacity-100 hover:scale-125"></div>
                  <span>About</span>
                  <div className="ml-auto text-xs text-[rgb(var(--muted))] opacity-0 group-hover:opacity-100 transition-opacity duration-300">👤</div>
                </div>
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) => mobileLinkBase(isActive)}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3 mobile-link-enter">
                  <div className="w-2 h-2 rounded-full bg-[rgb(var(--primary))] opacity-60 transition-all duration-300 hover:opacity-100 hover:scale-125"></div>
                  <span>Contact</span>
                  <div className="ml-auto text-xs text-[rgb(var(--muted))] opacity-0 group-hover:opacity-100 transition-opacity duration-300">📧</div>
                </div>
              </NavLink>
            </div>
            
            {/* Menu Footer */}
            <div className="px-6 py-3 mt-4 border-t border-gray-200/30 dark:border-gray-700/30 rounded-b-3xl">
              <div className="flex items-center justify-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[rgb(var(--primary))] opacity-40"></div>
                <p className="text-xs text-[rgb(var(--muted))] text-center">
                  © 2024
                </p>
                <div className="w-1 h-1 rounded-full bg-[rgb(var(--primary))] opacity-40"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}



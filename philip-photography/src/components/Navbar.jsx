import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toggleTheme } from '../theme.js'
import { Moon, Sun } from 'lucide-react'

export default function Navbar() {
  const [mode, setMode] = useState(() => document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  
  const linkBase = (isActive) =>
    `relative px-3 py-2 text-sm font-semibold ${scrolled ? 'text-[rgb(var(--fg))]' : 'text-white'} transition-colors duration-300 opacity-90 hover:opacity-100 after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:h-0.5 after:w-full after:bg-current after:transition-transform after:duration-300 after:origin-center ${isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}`;

  const showBorder = scrolled || location.pathname !== '/'
  return (
    <header className={`fixed top-0 left-0 right-0 z-20 transition-all duration-300 ${scrolled ? 'bg-[rgb(var(--bg))] shadow-sm backdrop-blur-md' : 'bg-transparent backdrop-blur-0'} ${showBorder ? 'border-b ' + (scrolled ? 'border-gray-200 dark:border-gray-800' : 'border-white/20') : 'border-b border-transparent'}`}>
      <nav className="container-responsive h-16 grid grid-cols-3 items-center">
        <div className="justify-self-start">
          <Link to="/" className={`font-semibold transition-colors duration-300 ${scrolled ? 'text-[rgb(var(--fg))]' : 'text-white'}`}>Philip Photography</Link>
        </div>
        <div className="justify-self-center">
          <div className="flex items-center gap-1">
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
        </div>
        <div className="justify-self-end">
          <button 
            className={`p-2 rounded-md transition-colors duration-300 ${scrolled ? 'text-[rgb(var(--fg))]' : 'text-white'} opacity-70 hover:opacity-100 transition-opacity`}
            onClick={() => setMode(toggleTheme())}
          >
            {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>
    </header>
  )
}



'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const handleAdminAccess = () => {
    router.push('/admin')
  }

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-8 sm:mt-12 md:mt-16">
      <div className="container-responsive py-6 sm:py-8 md:py-10 text-sm text-[rgb(var(--muted))]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-2 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src={isDark ? '/DarkmodeLogo.svg' : '/LightmodeLogo.svg'}
                alt="Philip Photography Logo"
                className="h-8 w-auto"
              />
              <span className="font-bold text-lg tracking-wider text-[rgb(var(--fg))]">
                JP MORADA
              </span>
            </div>
            <p className="text-[rgb(var(--muted))] text-xs sm:text-sm">Wildlife and nature photography focused on patient observation and storytelling.</p>
          </div>

          <nav className="space-y-2 hidden md:block">
            <div className="text-[10px] uppercase tracking-[0.25em]">Navigate</div>
            <ul className="space-y-1">
              <li><button onClick={() => router.push('/')} className="hover:text-[rgb(var(--fg))] transition text-xs sm:text-sm">Home</button></li>
              <li><button onClick={() => router.push('/gallery')} className="hover:text-[rgb(var(--fg))] transition text-xs sm:text-sm">Gallery</button></li>
              <li><button onClick={() => router.push('/about')} className="hover:text-[rgb(var(--fg))] transition text-xs sm:text-sm">About</button></li>
              <li><button onClick={() => router.push('/contact')} className="hover:text-[rgb(var(--fg))] transition text-xs sm:text-sm">Contact</button></li>
            </ul>
          </nav>

          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.25em]">Contact</div>
            <ul className="space-y-1">
              <li><strong className="text-xs sm:text-sm text-[rgb(var(--fg))]">John Philip Morada Photography</strong></li>
              <li><span className="text-xs sm:text-sm">Batangas, Luzon, Philippines</span></li>
              <li><a href="tel:+639453859776" className="hover:text-[rgb(var(--fg))] transition text-xs sm:text-sm">+63 945 385 9776</a></li>
              <li><a href="mailto:jpmoradanaturegram@gmail.com" className="hover:text-[rgb(var(--fg))] transition text-xs sm:text-sm">jpmoradanaturegram@gmail.com</a></li>
              <li><span className="text-xs sm:text-sm">Serving Batangas • Metro Manila • Southern Luzon</span></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.25em]">Social</div>
            <div className="flex items-center gap-3 sm:gap-4">
              <a href="https://www.instagram.com/jpmorada_/" target="_blank" rel="noreferrer" className="flex items-center gap-1 sm:gap-2 hover:text-[rgb(var(--fg))] transition-colors duration-300" aria-label="Instagram">
                <Instagram size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="text-xs sm:text-sm hidden sm:inline">Instagram</span>
              </a>
              <a href="https://www.facebook.com/john.morada.red" target="_blank" rel="noreferrer" className="flex items-center gap-1 sm:gap-2 hover:text-[rgb(var(--fg))] transition-colors duration-300" aria-label="Facebook">
                <Facebook size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="text-xs sm:text-sm hidden sm:inline">Facebook</span>
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 sm:gap-2 hover:text-[rgb(var(--fg))] transition-colors duration-300" aria-label="X (formerly Twitter)">
                <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-xs sm:text-sm hidden sm:inline">X</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm text-center sm:text-left">© {new Date().getFullYear()} All rights reserved.</span>
          <button
            onClick={handleAdminAccess}
            className="opacity-0 hover:opacity-100 transition-opacity duration-300 text-xs text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] cursor-pointer"
            title="Admin Access"
            aria-label="Admin Access"
          >
            Admin
          </button>
        </div>
      </div>
    </footer>
  )
}





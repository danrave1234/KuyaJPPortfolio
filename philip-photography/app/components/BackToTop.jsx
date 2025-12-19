'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronUp } from 'lucide-react'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname() ?? '/'

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollContainer = document.querySelector('.snap-y.snap-mandatory')
      let scrollY = 0
      
      if (scrollContainer) {
        scrollY = scrollContainer.scrollTop
      } else {
        scrollY = window.scrollY
      }
      
      if (scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true })
    
    const scrollContainer = document.querySelector('.snap-y.snap-mandatory')
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', toggleVisibility, { passive: true })
    }

    toggleVisibility()

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', toggleVisibility)
      }
    }
  }, [])

  useEffect(() => {
    const isGalleryRoute = pathname === '/gallery'
    
    if (isGalleryRoute) {
      const savedScroll = sessionStorage.getItem('gallery-scrollY')
      if (savedScroll && parseInt(savedScroll) > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false)
        }, 200)
        return () => clearTimeout(timer)
      } else {
        setIsVisible(false)
      }
    } else {
      setIsVisible(false)
    }
  }, [pathname])

  const scrollToTop = () => {
    const scrollContainer = document.querySelector('.snap-y.snap-mandatory')
    
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    } else {
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





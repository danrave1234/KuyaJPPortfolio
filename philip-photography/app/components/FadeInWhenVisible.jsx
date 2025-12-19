'use client'

import { useEffect, useRef, useState } from 'react'

export default function FadeInWhenVisible({ children, className = "", delay = 0, threshold = 0.2 }) {
  const [isVisible, setVisible] = useState(false)
  const domRef = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true)
        }
      })
    }, { threshold })

    const currentElement = domRef.current
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    }
  }, [threshold])

  return (
    <div
      ref={domRef}
      className={`transition-all duration-[600ms] ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0 filter-none' 
          : 'opacity-0 translate-y-10 blur-sm'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}





'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { ChevronRight, User, X, ChevronLeft, ChevronRight as ChevronRightIcon, Maximize2, Minimize2, Heart, ArrowDown } from 'lucide-react'
import { getImagesFromFolder } from '../firebase/storage'
import { getFeaturedImages } from '../firebase/admin-api'
import { trackImageView, trackGalleryNavigation } from '../services/analytics'
import FadeInWhenVisible from '@/app/components/FadeInWhenVisible'

// Experience Badge Component
function ExperienceBadge() {
  const [bgColor, setBgColor] = useState('#FFFFFF')
  
  useEffect(() => {
    const updateBg = () => {
      if (typeof window !== 'undefined') {
        const isDark = document.documentElement.classList.contains('dark')
        setBgColor(isDark ? '#1F2937' : '#FFFFFF') // gray-800 in dark mode, white in light mode
      }
    }
    
    updateBg()
    
    const observer = new MutationObserver(updateBg)
    if (typeof window !== 'undefined') {
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class'] 
      })
    }
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <div 
      className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl border border-gray-400 dark:border-gray-700 hidden sm:block animate-bounce" 
      style={{ animationDuration: '3s', backgroundColor: bgColor }}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-2xl sm:text-3xl font-bold text-[rgb(var(--primary))]">10+</div>
        <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide leading-tight text-[rgb(var(--fg))] dark:text-[rgb(var(--muted-fg))] opacity-90 dark:opacity-100">
          Years of<br />Experience
        </div>
      </div>
    </div>
  )
}

// Featured Image Overlay Card Component
function FeaturedImageOverlayCard({ featuredImage }) {
  const [bgColor, setBgColor] = useState('#F8F6F2')
  
  useEffect(() => {
    const updateBg = () => {
      if (typeof window !== 'undefined') {
        const isDark = document.documentElement.classList.contains('dark')
        setBgColor(isDark ? 'rgba(0, 0, 0, 0.8)' : '#F8F6F2')
      }
    }
    
    updateBg()
    
    // Watch for theme changes
    const observer = new MutationObserver(updateBg)
    if (typeof window !== 'undefined') {
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class'] 
      })
    }
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 z-20 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100">
      <div 
        className="backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-300 dark:border-white/20 shadow-xl dark:shadow-xl transition-colors duration-300"
        style={{ backgroundColor: bgColor }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-sm sm:text-base lg:text-lg font-bold text-[rgb(var(--fg))]">{featuredImage.title}</h3>
            <p className="text-[10px] sm:text-xs text-[rgb(var(--fg))] dark:text-[rgb(var(--muted-fg))] opacity-70 dark:opacity-100">Featured Collection</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[rgb(var(--fg))] dark:bg-[rgb(var(--fg))] flex items-center justify-center text-white dark:text-[rgb(var(--bg))] flex-shrink-0">
            <Maximize2 size={12} className="sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [active, setActive] = useState(null)
  const [imageDimensions, setImageDimensions] = useState({})
  const [landscapeImages, setLandscapeImages] = useState([])
  const [firebaseImages, setFirebaseImages] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Featured images state
  const [featuredImages, setFeaturedImages] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [featuredImageDimensions, setFeaturedImageDimensions] = useState({})
  
  // Logo state for theme-aware logo
  const [logoSrc, setLogoSrc] = useState('/LightmodeLogo.svg')
  
  useEffect(() => {
    const updateLogo = () => {
      if (typeof window !== 'undefined') {
        const isDark = document.documentElement.classList.contains('dark')
        setLogoSrc(isDark ? '/DarkmodeLogo.svg' : '/LightmodeLogo.svg')
      }
    }
    
    updateLogo()
    
    // Watch for theme changes
    const observer = new MutationObserver(updateLogo)
    if (typeof window !== 'undefined') {
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class'] 
      })
    }
    
    return () => observer.disconnect()
  }, [])

  // Load images from Firebase Storage with improved caching and loading logic
  useEffect(() => {
    const loadFirebaseImages = async () => {
      try {
        // 1. Check browser cache first (sessionStorage for immediate loads)
        const sessionCache = sessionStorage.getItem('home-gallery-session')
        if (sessionCache) {
          const parsedImages = JSON.parse(sessionCache)
          setFirebaseImages(parsedImages)
          // Process cached images immediately to populate landscapeImages
          processImagesForCarousel(parsedImages)
          setLoading(false)
          return
        }

        // 2. Check localStorage cache (persistent across sessions)
        const cachedImages = localStorage.getItem('home-gallery-cache')
        const cacheTimestamp = localStorage.getItem('home-gallery-cache-timestamp')
        const now = Date.now()
        const cacheExpiry = 7 * 24 * 60 * 60 * 1000 // 7 days

        if (cachedImages && cacheTimestamp && (now - parseInt(cacheTimestamp)) < cacheExpiry) {
          const parsedImages = JSON.parse(cachedImages)
          setFirebaseImages(parsedImages)
          // Process cached images immediately to populate landscapeImages
          processImagesForCarousel(parsedImages)
          // Also store in sessionStorage for faster subsequent loads
          sessionStorage.setItem('home-gallery-session', cachedImages)
          setLoading(false)
          return
        }

        // 3. Fetch from Firebase with HTTP caching headers
        const result = await getImagesFromFolder('gallery')
        if (result.success) {
          const imagesWithIds = result.images.map((img, index) => ({
            id: index + 1,
            src: img.src,
            title: img.title || img.name,
            alt: img.alt || img.name
          }))
          
          // Store in both caches
          const imagesJson = JSON.stringify(imagesWithIds)
          localStorage.setItem('home-gallery-cache', imagesJson)
          localStorage.setItem('home-gallery-cache-timestamp', now.toString())
          sessionStorage.setItem('home-gallery-session', imagesJson)
          
          setFirebaseImages(imagesWithIds)
          // Process fresh images to populate landscapeImages
          processImagesForCarousel(imagesWithIds)
        } else {
          console.error('Failed to load Firebase images:', result.error)
        }
      } catch (error) {
        console.error('Error loading Firebase images:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFirebaseImages()
  }, [])

  // Load featured images from Firebase Storage
  useEffect(() => {
    const loadFeaturedImages = async () => {
      try {
        // Check session cache first
        const sessionCache = sessionStorage.getItem('featured-gallery-session')
        if (sessionCache) {
          const parsedImages = JSON.parse(sessionCache)
          setFeaturedImages(parsedImages)
          setFeaturedLoading(false)
          return
        }

        // Check localStorage cache
        const cachedImages = localStorage.getItem('featured-gallery-cache')
        const cacheTimestamp = localStorage.getItem('featured-gallery-cache-timestamp')
        const now = Date.now()
        const cacheExpiry = 7 * 24 * 60 * 60 * 1000 // 7 days

        if (cachedImages && cacheTimestamp && (now - parseInt(cacheTimestamp)) < cacheExpiry) {
          const parsedImages = JSON.parse(cachedImages)
          setFeaturedImages(parsedImages)
          sessionStorage.setItem('featured-gallery-session', cachedImages)
          setFeaturedLoading(false)
          return
        }

        // Fetch from Firebase using the new function
        const result = await getFeaturedImages()
        if (result.success) {
          const imagesWithIds = result.images.map((img, index) => ({
            id: index + 1,
            src: img.src,
            title: img.title || img.name,
            alt: img.alt || img.name
          }))
          
          // Store in both caches
          const imagesJson = JSON.stringify(imagesWithIds)
          localStorage.setItem('featured-gallery-cache', imagesJson)
          localStorage.setItem('featured-gallery-cache-timestamp', now.toString())
          sessionStorage.setItem('featured-gallery-session', imagesJson)
          
          setFeaturedImages(imagesWithIds)
        } else {
          console.error('Failed to load featured images:', result.error)
        }
      } catch (error) {
        console.error('Error loading featured images:', error)
      } finally {
        setFeaturedLoading(false)
      }
    }

    loadFeaturedImages()
  }, [])

  // Process images to populate landscape images for future use (optional)
  const processImagesForCarousel = (images) => {
    // Process all images at once to avoid staggered updates
    const promises = images.map((image) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          const aspectRatio = img.naturalWidth / img.naturalHeight
          if (aspectRatio > 1.2) {
            resolve(image)
          } else {
            resolve(null)
          }
        }
        img.onerror = () => resolve(null)
        img.src = image.src
      })
    })
    
    // Wait for all images to load, then update state once (for debugging/analytics)
    Promise.all(promises).then((results) => {
      const landscapeImages = results.filter(Boolean)
      setLandscapeImages(landscapeImages)
    })
  }

  // Use Firebase images instead of hardcoded array
  const allPhotographs = firebaseImages

  // Handle image load and filter for landscape images
  const handleImageLoad = (photo, naturalWidth, naturalHeight) => {
    const aspectRatio = naturalWidth / naturalHeight
    setImageDimensions(prev => ({
      ...prev,
      [photo.id]: { width: naturalWidth, height: naturalHeight, aspectRatio }
    }))
    
    // Only include landscape images (aspect ratio > 1.2)
    if (aspectRatio > 1.2) {
      setLandscapeImages(prev => {
        if (!prev.find(img => img.id === photo.id)) {
          return [...prev, photo]
        }
        return prev
      })
    }
  }

  // Handle featured image load and store dimensions
  const handleFeaturedImageLoad = (photo, naturalWidth, naturalHeight) => {
    const aspectRatio = naturalWidth / naturalHeight
    setFeaturedImageDimensions(prev => ({
      ...prev,
      [photo.id]: { width: naturalWidth, height: naturalHeight, aspectRatio }
    }))
  }

  // Get single featured image with auto-fit container
  const getFeaturedImage = () => {
    if (featuredLoading || featuredImages.length === 0) return null
    
    const image = featuredImages[0] // Only take the first image
    const dimensions = featuredImageDimensions[image.id]
    const aspectRatio = dimensions?.aspectRatio || 1
    const isPortrait = dimensions ? dimensions.aspectRatio < 1 : false
    
    return {
      ...image,
      aspectRatio,
      isPortrait
    }
  }

  // Fallback state for when no landscape images are found
  const [useAllImages, setUseAllImages] = useState(false)
  
  useEffect(() => {
    // If no landscape images are found after 3 seconds, use all images
    if (allPhotographs.length > 0 && landscapeImages.length === 0) {
      const timer = setTimeout(() => {
        setUseAllImages(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [allPhotographs.length, landscapeImages.length])
  
  // Use landscape images if available, otherwise fallback to all images
  const displayImages = landscapeImages.length > 0 ? landscapeImages : (useAllImages ? allPhotographs : [])
  
  // Debug logging
  useEffect(() => {
    console.log('Home carousel debug:', {
      allPhotographs: allPhotographs.length,
      landscapeImages: landscapeImages.length,
      useAllImages,
      displayImages: displayImages.length
    })
  }, [allPhotographs.length, landscapeImages.length, useAllImages, displayImages.length])

  // Scroll snapping is now handled by the parent ScrollSnapContainer

  return (
    <>
      {/* SEO handled by Next.js metadata API */}
      {/* Full-width hero */}
      <section id="home" className="snap-start min-h-screen relative w-full overflow-x-hidden bg-black">
        <div className="relative h-dvh overflow-hidden group">
          {/* Background Blurred Image to fill empty space */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/Hero.jpg" 
              alt="Background Blur" 
              className="w-full h-full object-cover blur-3xl scale-110 brightness-75" 
            />
            {/* Vignette to focus attention to center */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60" />
          </div>

          <div className="absolute inset-0 bg-black/20 z-10" /> {/* Darker overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
          
          {/* Edge Blending Gradients - Extend the photo naturally */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Left blending - samples dark forest tones */}
            <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-black via-black/80 to-transparent opacity-90" />
            {/* Right blending - samples dark forest tones */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-black via-black/80 to-transparent opacity-90" />
          </div>
          
          {/* Centered Image Container to ensure full height visibility */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-0">
            <img
              src="/Hero.jpg"
              alt="Photographer hero"
              className="h-full w-auto max-w-none animate-zoomIn"
              style={{ 
                animationDuration: '3s', 
                animationFillMode: 'forwards',
                objectFit: 'contain',
                objectPosition: 'center',
                maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
              }}
            />
          </div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4">
            <div className="text-center max-w-5xl mx-auto">
              <h1 className="font-heading text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold text-white drop-shadow-2xl mb-4 sm:mb-6 opacity-0 animate-heroReveal" style={{ letterSpacing: '0.05em' }}>
                John Philip Morada
              </h1>
              <div className="w-16 sm:w-24 h-0.5 sm:h-1 bg-white/80 mx-auto mb-4 sm:mb-8 rounded-full opacity-0 animate-heroReveal delay-200"></div>
              <p className="font-body text-white/90 max-w-2xl mx-auto text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-light leading-relaxed opacity-0 animate-heroReveal delay-300 tracking-wide px-2">
                Capturing the soul of Philippine wildlife,<br className="hidden sm:block" /> one frame at a time.
              </p>
              
              <div className="mt-6 sm:mt-8 lg:mt-12 opacity-0 animate-heroReveal delay-500">
                <Link 
                  href="/gallery" 
                  className="group relative inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-full text-white overflow-hidden transition-all duration-300 hover:bg-white hover:text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                  onClick={() => trackGalleryNavigation('main', 'view_gallery_link')}
                >
                  <span className="text-xs sm:text-sm lg:text-base font-medium tracking-widest uppercase">View Gallery</span>
                  <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px] transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce opacity-0 animate-heroReveal delay-700 hidden sm:flex flex-col items-center gap-2">
            <span className="text-white/50 text-[10px] uppercase tracking-[0.2em]">Explore</span>
            <ArrowDown className="text-white/50" size={20} />
          </div>
          
          {/* Testimonials Section - Bottom of Hero - Hidden on mobile */}
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 hidden lg:block z-20">
            <div className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-4 sm:gap-6">
                <FadeInWhenVisible delay={800} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img 
                        src="/Whyeth_testimonial1.jpg" 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-white text-xs font-semibold">Sarah Chen</div>
                      <div className="text-white/70 text-xs">Wildlife Enthusiast</div>
                    </div>
                  </div>
                  <div className="text-white/90 text-sm">
                    "John's patience and eye for detail captured moments I never thought possible. Absolutely stunning work."
                  </div>
                </FadeInWhenVisible>
                
                <FadeInWhenVisible delay={1000} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img 
                        src="/Whyeth_testimonial1.jpg" 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-white text-xs font-semibold">Michael Torres</div>
                      <div className="text-white/70 text-xs">Nature Photographer</div>
                    </div>
                  </div>
                  <div className="text-white/90 text-sm">
                    "The way he captures light and movement in nature is simply magical. Every photo tells a story."
                  </div>
                </FadeInWhenVisible>
                
                <FadeInWhenVisible delay={1200} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img 
                        src="/Whyeth_testimonial1.jpg" 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-white text-xs font-semibold">Dr. Elena Rodriguez</div>
                      <div className="text-white/70 text-xs">Conservation Biologist</div>
                    </div>
                  </div>
                  <div className="text-white/90 text-sm">
                    "Professional, passionate, and incredibly talented. John's work speaks for itself."
                  </div>
                </FadeInWhenVisible>
                
                <FadeInWhenVisible delay={1400} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hidden 2xl:block">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img 
                        src="/Whyeth_testimonial1.jpg" 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-white text-xs font-semibold">James Park</div>
                      <div className="text-white/70 text-xs">Ornithologist</div>
                    </div>
                  </div>
                  <div className="text-white/90 text-sm">
                    "His bird photography is exceptional. The clarity and emotion he captures is unmatched."
                  </div>
                </FadeInWhenVisible>
                
                <FadeInWhenVisible delay={1600} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hidden 2xl:block">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img 
                        src="/Whyeth_testimonial1.jpg" 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-white text-xs font-semibold">Maria Santos</div>
                      <div className="text-white/70 text-xs">Art Director</div>
                    </div>
                  </div>
                  <div className="text-white/90 text-sm">
                    "Working with John was a pleasure. His dedication to getting the perfect shot is inspiring."
                  </div>
                </FadeInWhenVisible>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction section */}
      <section id="about" className="snap-start min-h-screen flex items-center bg-[rgb(var(--bg))] relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24 xl:py-0">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[rgb(var(--primary))]/5 -skew-x-12 transform origin-top translate-x-1/2 pointer-events-none" />
        
        <div className="container-responsive w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-20 items-center">
            
            {/* Text Column */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left order-2 lg:order-1">
              <FadeInWhenVisible>
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-6 w-fit">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[rgb(var(--primary))] animate-pulse" />
                  About The Photographer
                </div>
                
                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-2 sm:mb-6 text-[rgb(var(--fg))]">
                  John Philip Morada
                </h2>
                
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[rgb(var(--muted-fg))] leading-relaxed mb-6 sm:mb-8 max-w-2xl font-light">
                  Based in the Philippines, I specialize in capturing the raw, unscripted moments of wildlife. My work is a testament to patience, waiting for the perfect interplay of light and nature's true stories.
                </p>
              </FadeInWhenVisible>

              {/* Philosophy Cards - Hidden on mobile */}
              <div className="hidden sm:grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10">
                <FadeInWhenVisible delay={200}>
                  <div className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-sm hover:shadow-lg dark:hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[rgb(var(--primary))]/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[rgb(var(--primary))] group-hover:text-white transition-colors duration-300">
                      <Heart size={16} className="sm:w-5 sm:h-5 text-[rgb(var(--primary))] group-hover:text-white" />
                    </div>
                    <h4 className="font-heading text-base sm:text-lg font-bold mb-1.5 sm:mb-2 text-[rgb(var(--fg))]">My Philosophy</h4>
                    <p className="text-xs sm:text-sm text-[rgb(var(--fg))] dark:text-[rgb(var(--muted-fg))] leading-relaxed opacity-80 dark:opacity-100">
                      I believe every image should advocate for conservation. By showing the beauty of our wildlife, I hope to inspire protection.
                    </p>
                  </div>
                </FadeInWhenVisible>

                <FadeInWhenVisible delay={400}>
                  <div className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-sm hover:shadow-lg dark:hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[rgb(var(--primary))]/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[rgb(var(--primary))] group-hover:text-white transition-colors duration-300">
                      <User size={16} className="sm:w-5 sm:h-5 text-[rgb(var(--primary))] group-hover:text-white" />
                    </div>
                    <h4 className="font-heading text-base sm:text-lg font-bold mb-1.5 sm:mb-2 text-[rgb(var(--fg))]">My Approach</h4>
                    <p className="text-xs sm:text-sm text-[rgb(var(--fg))] dark:text-[rgb(var(--muted-fg))] leading-relaxed opacity-80 dark:opacity-100">
                      Respect for the subject comes first. I use long lenses and careful fieldcraft to document without disturbing natural behavior.
                    </p>
                  </div>
                </FadeInWhenVisible>
              </div>

              <FadeInWhenVisible delay={600}>
                <Link href="/about" className="inline-flex items-center gap-2 text-[rgb(var(--primary))] font-semibold hover:gap-4 transition-all duration-300 group">
                  Read Full Bio 
                  <span className="w-8 h-[1px] bg-[rgb(var(--primary))] group-hover:w-12 transition-all duration-300" />
                  <ChevronRight size={16} />
                </Link>
              </FadeInWhenVisible>
            </div>

            {/* Image Column */}
            <div className="lg:col-span-5 relative order-1 lg:order-2 mb-6 sm:mb-8 lg:mb-0">
              <FadeInWhenVisible delay={300} className="relative z-10">
                <div className="relative aspect-[3/4] max-w-[240px] sm:max-w-md mx-auto lg:max-w-none transition-transform duration-500 ease-out">
                  <div className="absolute inset-0 bg-gray-300 dark:bg-black/20 rounded-2xl sm:rounded-3xl transform translate-x-2 translate-y-2 sm:translate-x-4 sm:translate-y-4 -z-10" />
                  <img
                    src="/KuyaJP.jpg"
                    alt="John Philip Morada"
                    className="w-full h-full object-cover rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-gray-400 dark:border-white/20"
                  />
                  
                  {/* Floating Badge */}
                  <ExperienceBadge />
                </div>
              </FadeInWhenVisible>
            </div>
            
          </div>
        </div>
      </section>

      {/* Section 3: Magazine Style Layout */}
      <section id="experience" className="snap-start min-h-screen flex flex-col items-center justify-center bg-[rgb(var(--bg))] py-12 sm:py-16 md:py-20 lg:py-0 relative">
        <div className="container-responsive w-full">
          {/* Magazine-style Editorial Header */}
          <div className="mb-6 sm:mb-8 lg:mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-16 items-start">
              {/* Left Column - Editorial Content */}
              <div className="lg:col-span-5 space-y-3 sm:space-y-6 lg:space-y-8 sticky top-20 sm:top-32">
                <FadeInWhenVisible>
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <span className="h-[1px] w-8 sm:w-12 bg-[rgb(var(--primary))]" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[rgb(var(--primary))]">Selected Works</span>
                  </div>
                  
                  <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-[rgb(var(--fg))] mb-2 sm:mb-3">
                    Moments in <span className="text-[rgb(var(--primary))] italic">Time</span>
                  </h2>
                  
                  <p className="text-[rgb(var(--muted-fg))] leading-relaxed text-xs sm:text-sm md:text-base">
                    Photography is more than just clicking a shutter; it's about anticipation. 
                    From the elusive Philippine Eagle to the vibrant sunbirds, each image represents hours of silent observation.
                  </p>
                </FadeInWhenVisible>

                {/* Stats */}
                <FadeInWhenVisible delay={200}>
                  {/* Mobile: Compact inline design */}
                  <div className="sm:hidden flex items-center justify-evenly py-3 border-y border-[rgb(var(--muted))]/20">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-[rgb(var(--fg))]">10<span className="text-[rgb(var(--primary))]">+</span></span>
                      <span className="text-[9px] text-[rgb(var(--muted-fg))] uppercase tracking-wider">Years</span>
                    </div>
                    <div className="h-4 w-px bg-[rgb(var(--muted))]/30"></div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-[rgb(var(--fg))]">500<span className="text-[rgb(var(--primary))]">+</span></span>
                      <span className="text-[9px] text-[rgb(var(--muted-fg))] uppercase tracking-wider">Species</span>
                    </div>
                  </div>
                  {/* Desktop: Original grid design */}
                  <div className="hidden sm:flex items-center justify-evenly py-4 sm:py-6 lg:py-8 border-y border-[rgb(var(--muted))]/20">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[rgb(var(--fg))] mb-1">10<span className="text-[rgb(var(--primary))]">+</span></div>
                      <div className="text-[10px] sm:text-xs text-[rgb(var(--muted-fg))] uppercase tracking-wider">Years Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[rgb(var(--fg))] mb-1">500<span className="text-[rgb(var(--primary))]">+</span></div>
                      <div className="text-[10px] sm:text-xs text-[rgb(var(--muted-fg))] uppercase tracking-wider">Species Logged</div>
                    </div>
                  </div>
                </FadeInWhenVisible>

                <FadeInWhenVisible delay={400}>
                  <div className="hidden sm:flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <Link href="/gallery" className="btn bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full hover:scale-105 transition-transform text-sm sm:text-base">
                      View All Works
                    </Link>
                    <span className="text-xs sm:text-sm text-[rgb(var(--muted-fg))] italic">Updated Monthly</span>
                  </div>
                </FadeInWhenVisible>
              </div>

              {/* Right Column - Featured Image */}
              <div className="lg:col-span-7">
                <FadeInWhenVisible delay={300}>
                {featuredLoading ? (
                  <div className="flex items-center justify-center aspect-[4/3] bg-[rgb(var(--muted))]/5 rounded-3xl border border-[rgb(var(--muted))]/20">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-[rgb(var(--primary))]/30 border-t-[rgb(var(--primary))] rounded-full animate-spin mx-auto mb-2"></div>
                      <div className="text-[rgb(var(--muted-fg))] text-sm">Loading masterpiece...</div>
                    </div>
                  </div>
                ) : featuredImages.length === 0 ? (
                  <div className="flex items-center justify-center aspect-[4/3] bg-[rgb(var(--muted))]/5 rounded-3xl border border-[rgb(var(--muted))]/20">
                    <div className="text-center">
                      <div className="text-[rgb(var(--muted-fg))] text-sm mb-2">No Featured Image</div>
                      <div className="text-[rgb(var(--muted))] text-xs">Upload an image to 'featured' folder</div>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="group cursor-pointer relative"
                    onClick={() => {
                      const featuredImage = getFeaturedImage()
                      if (featuredImage) {
                        trackImageView({
                          id: featuredImage.id,
                          title: featuredImage.title,
                          path: featuredImage.src,
                          isFeatured: true
                        }, {
                          isSeries: false,
                          seriesIndex: 0,
                          galleryType: 'featured'
                        });
                        
                        setActive({ art: { id: featuredImage.id, src: featuredImage.src, title: featuredImage.title, alt: featuredImage.alt, description: featuredImage.description }, idx: 0 })
                      }
                    }}
                  >
                    {(() => {
                      const featuredImage = getFeaturedImage()
                      if (!featuredImage) return null
                      
                      const containerClass = featuredImage.isPortrait 
                        ? 'aspect-[3/4] max-w-[180px] sm:max-w-sm mx-auto' 
                        : 'aspect-[4/3] w-full max-w-[280px] sm:max-w-none mx-auto sm:mx-0'
                      
                      return (
                        <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${containerClass}`}>
                          <div className="absolute inset-0 bg-gray-900/10 dark:bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                          <img
                            src={featuredImage.src}
                            alt={featuredImage.alt}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            onLoad={(e) => {
                              const { naturalWidth, naturalHeight } = e.target
                              handleFeaturedImageLoad(featuredImage, naturalWidth, naturalHeight)
                            }}
                          />
                          
                          {/* Floating Info Card */}
                          <FeaturedImageOverlayCard featuredImage={featuredImage} />
                        </div>
                      )
                    })()}
                  </div>
                )}
                </FadeInWhenVisible>
              </div>
            </div>
          </div>

          {/* Full Width Carousel at Bottom */}
          <FadeInWhenVisible delay={500}>
            <div className="relative w-full overflow-hidden mt-6 sm:mt-12 lg:mt-20">
                    {/* Enhanced gradient edge fades */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[rgb(var(--bg))] to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[rgb(var(--bg))] to-transparent z-10" />
                    
                    {loading || (allPhotographs.length > 0 && landscapeImages.length === 0) ? (
                      <div className="flex gap-6 justify-center">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex-shrink-0 w-64 h-40 rounded-2xl overflow-hidden bg-[rgb(var(--muted))]/10 animate-pulse" />
                        ))}
                      </div>
                    ) : displayImages.length === 0 ? (
                      <div className="flex items-center justify-center py-16">
                        <span className="text-[rgb(var(--muted-fg))]">No images found in Firebase Storage</span>
                      </div>
                    ) : (
                      <div 
                        className="flex gap-6 infinite-scroll hover:[animation-play-state:paused]"
                        style={{ 
                          width: 'max-content'
                        }}
                      >
                      {/* Repeat images 3 times for smooth loop */}
                      {[...displayImages, ...displayImages, ...displayImages].map((photo, index) => (
                        <div 
                          key={`${photo.id}-${index}`} 
                          className="flex-shrink-0 group cursor-pointer w-40 h-24 sm:w-72 sm:h-48 md:w-80 md:h-52 relative rounded-xl sm:rounded-2xl overflow-hidden"
                          onClick={() => {
                            trackImageView({
                              id: photo.id,
                              title: photo.title,
                              path: photo.src,
                              isFeatured: false
                            }, { isSeries: false, seriesIndex: 0, galleryType: 'home' });
                            setActive({ art: { id: photo.id, src: photo.src, title: photo.title, alt: photo.alt, description: photo.description }, idx: 0 })
                          }}
                        >
                          <img
                            src={photo.src}
                            alt={photo.alt}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        </div>
                      ))}
                      </div>
                    )}
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Call to Action Section - 4th Section */}
      <section id="contact" className="snap-start min-h-screen flex items-center bg-[rgb(var(--bg))] py-12 sm:py-16 md:py-20 lg:py-24 xl:py-0 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgb(var(--primary))]/5 pointer-events-none" />
        
        <div className="container-responsive w-full relative z-10">
          <FadeInWhenVisible>
            <div className="text-center max-w-4xl mx-auto px-4">
              <div className="mb-8 sm:mb-10 lg:mb-12">
                <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-4 sm:mb-6">
                  Work With Me
                </span>
                <h4 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-[rgb(var(--fg))] mb-4 sm:mb-6 lg:mb-8 leading-tight">
                  Ready to capture<br />your story?
                </h4>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-[rgb(var(--muted-fg))] max-w-2xl mx-auto leading-relaxed font-light">
                  Let's discuss your photography needs and create something extraordinary together.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <Link 
                  href="/contact" 
                  className="btn bg-[rgb(var(--primary))] text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-full text-sm sm:text-base lg:text-lg hover:scale-105 hover:shadow-xl hover:shadow-[rgb(var(--primary))]/20 transition-all duration-300"
                >
                  Get in Touch
                </Link>
                <Link 
                  href="/gallery" 
                  className="btn-outline px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-full text-sm sm:text-base lg:text-lg hover:bg-[rgb(var(--fg))] hover:text-[rgb(var(--bg))] transition-all duration-300"
                >
                  Explore Gallery
                </Link>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Footer section with comprehensive responsive spacing */}
      <footer id="footer" className="snap-start bg-[rgb(var(--bg))] border-t border-[rgb(var(--muted))]/10 min-h-screen flex items-center">
        <div className="container-responsive w-full">
          <div className="py-6 sm:py-8 md:py-10 text-sm text-[rgb(var(--muted))]">
            {/* Mobile: Single column, Desktop: Multi-column */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {/* Brand section - always visible */}
              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                <img 
                  src={logoSrc}
                  alt="Philip Photography Logo" 
                  className="h-6 w-auto mb-2"
                />
                <p className="text-[rgb(var(--muted))] text-xs sm:text-sm">Wildlife and nature photography focused on patient observation and storytelling.</p>
              </div>

              {/* Navigation - hidden on mobile, visible on tablet+ */}
              <nav className="space-y-2 hidden md:block">
                <div className="text-[10px] uppercase tracking-[0.25em]">Navigate</div>
                <ul className="space-y-1">
                  <li><button onClick={() => document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[rgb(var(--fg))] transition text-xs sm:text-sm">Home</button></li>
                  <li><button onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[rgb(var(--fg))] transition text-xs sm:text-sm">About</button></li>
                  <li><button onClick={() => document.querySelector('#experience')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[rgb(var(--fg))] transition text-xs sm:text-sm">Experience</button></li>
                  <li><button onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[rgb(var(--fg))] transition text-xs sm:text-sm">Contact</button></li>
                </ul>
              </nav>

              {/* Contact - simplified for mobile */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-[0.25em]">Contact</div>
                <ul className="space-y-1">
                  <li><a href="mailto:jpmoradanaturegram@gmail.com" className="hover:text-[rgb(var(--fg))] transition text-xs sm:text-sm">jpmoradanaturegram@gmail.com</a></li>
                  <li><a href="tel:+639453859776" className="hover:text-[rgb(var(--fg))] transition text-xs sm:text-sm">+63 945 385 9776</a></li>
                  <li><span className="text-xs sm:text-sm hidden sm:block">Based in Philippines • Available worldwide</span>
                      <span className="text-xs sm:hidden">Philippines • Worldwide</span></li>
                </ul>
              </div>

              {/* Social - simplified for mobile */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-[0.25em]">Social</div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 sm:gap-2 hover:text-[rgb(var(--fg))] transition-colors duration-300" aria-label="Instagram">
                    <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="text-xs sm:text-sm hidden sm:inline">Instagram</span>
                  </a>
                  <a href="https://www.facebook.com/john.morada.red" target="_blank" rel="noreferrer" className="flex items-center gap-1 sm:gap-2 hover:text-[rgb(var(--fg))] transition-colors duration-300" aria-label="Facebook">
                    <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
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

            {/* Footer bottom - simplified for mobile */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-center sm:text-left">© {new Date().getFullYear()} All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal for carousel images */}
      {active && (
        <ModalViewer active={active} setActive={setActive} allArtworks={landscapeImages} />
      )}
    </>
  )
}

function ModalViewer({ active, setActive, allArtworks }) {
  // Early return if active is null or invalid
  if (!active || !active.art) {
    return null
  }

  const activeRef = useRef(active)
  useEffect(() => { activeRef.current = active }, [active])
  
  // Cache to maintain updated likes across navigation
  const likesCache = useRef(new Map())
  
  // Helper function to get artwork with cached likes
  const getArtworkWithCachedLikes = (artwork) => {
    const cachedLikes = likesCache.current.get(artwork.id)
    return {
      ...artwork,
      likes: cachedLikes !== undefined ? cachedLikes : artwork.likes
    }
  }

  // Simple navigation functions - move between artworks
  const navigateLeft = () => {
    const currentActive = activeRef.current
    if (!currentActive?.art) return
    
    const currentIndex = allArtworks.findIndex(art => art.id === currentActive.art.id)
    
    if (currentIndex > 0) {
      // Navigate to previous artwork with cached likes
      const prevArt = getArtworkWithCachedLikes(allArtworks[currentIndex - 1])
      setActive({ art: prevArt, idx: 0 })
    }
  }
  
  const navigateRight = () => {
    const currentActive = activeRef.current
    if (!currentActive?.art) return
    
    const currentIndex = allArtworks.findIndex(art => art.id === currentActive.art.id)
    
    if (currentIndex < allArtworks.length - 1) {
      // Navigate to next artwork with cached likes
      const nextArt = getArtworkWithCachedLikes(allArtworks[currentIndex + 1])
      setActive({ art: nextArt, idx: 0 })
    }
  }
  
  // Helper functions to determine navigation context
  const getLeftNavigationInfo = () => {
    const currentActive = activeRef.current
    if (!currentActive?.art) return { type: 'artwork', label: 'Previous', disabled: true }
    
    const currentIndex = allArtworks.findIndex(art => art.id === currentActive.art.id)
    
    if (currentIndex > 0) {
      return { type: 'artwork', label: 'Previous', disabled: false }
    } else {
      return { type: 'artwork', label: 'Previous', disabled: true }
    }
  }
  
  const getRightNavigationInfo = () => {
    const currentActive = activeRef.current
    if (!currentActive?.art) return { type: 'artwork', label: 'Next', disabled: true }
    
    const currentIndex = allArtworks.findIndex(art => art.id === currentActive.art.id)
    
    if (currentIndex < allArtworks.length - 1) {
      return { type: 'artwork', label: 'Next', disabled: false }
    } else {
      return { type: 'artwork', label: 'Next', disabled: true }
    }
  }
  
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    
    // Focus the modal container to ensure keyboard events are captured
    setTimeout(() => {
      const modalContainer = document.querySelector('[role="dialog"]')
      if (modalContainer) {
        modalContainer.focus()
      }
    }, 100)
    
    // Keyboard navigation
    const onKey = (e) => {
      const a = activeRef.current
      
      // Only handle keys when modal is open
      if (!a || !a.art) {
        return
      }
      
      if (e.key === 'Escape') {
        setActive(null)
        return
      }
      
      // Prevent default behavior for arrow keys
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        e.stopPropagation()
      }
      
      if (e.key === 'ArrowLeft') {
        navigateLeft()
      }
      if (e.key === 'ArrowRight') {
        navigateRight()
      }
    }
    
    // Add a global keyboard handler that works regardless of focus
    const globalKeyHandler = (e) => {
      onKey(e)
    }
    
    // Add to both document and window with capture phase
    document.addEventListener('keydown', globalKeyHandler, { capture: true })
    window.addEventListener('keydown', globalKeyHandler, { capture: true })
    
    // Touch gesture handling for mobile
    let touchStartX = 0
    let touchStartY = 0
    
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    }
    
    const handleTouchEnd = (e) => {
      const a = activeRef.current
      if (!a?.art) return
      
      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const deltaX = touchStartX - touchEndX
      const deltaY = touchStartY - touchEndY
      
      // Handle horizontal swipes for navigation
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // Swipe left - navigate right (next)
          navigateRight()
        } else {
          // Swipe right - navigate left (previous)
          navigateLeft()
        }
      }
    }
    
    // Only use the global key handlers, remove duplicate listeners
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => { 
      document.body.style.overflow = prev
      // Remove global key handlers
      document.removeEventListener('keydown', globalKeyHandler, { capture: true })
      window.removeEventListener('keydown', globalKeyHandler, { capture: true })
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      // Clean up fullscreen container if modal is closed
      exitFullscreen()
    }
  }, [setActive])

  const [visible, setVisible] = useState(true)
  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 20)
    return () => clearTimeout(t)
  }, [active.idx])

  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const imageRef = useRef(null)
  const [isFs, setIsFs] = useState(false)
  
  useEffect(() => {
    const onFsChange = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Create a dedicated fullscreen container for just the image
      const fullscreenContainer = document.createElement('div')
      fullscreenContainer.className = 'fixed inset-0 bg-black z-50 flex items-center justify-center'
      fullscreenContainer.style.backgroundColor = 'rgb(var(--bg))'
      
      // Clone the current image
      const currentImage = imageRef.current
      if (currentImage && currentImageSrc) {
        const fullscreenImage = document.createElement('img')
        fullscreenImage.src = currentImageSrc
        fullscreenImage.alt = active.art.title || ''
        fullscreenImage.className = 'max-w-full max-h-full object-contain rounded-lg'
        fullscreenImage.style.transition = 'opacity 0.3s ease'
        fullscreenImage.style.objectFit = 'contain'
        fullscreenImage.style.maxWidth = '90vw'
        fullscreenImage.style.maxHeight = '90vh'
        
        // Add close button
        const closeButton = document.createElement('button')
        closeButton.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m18 6-12 12"/>
            <path d="m6 6 12 12"/>
          </svg>
        `
        closeButton.className = 'absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 backdrop-blur-sm'
        closeButton.onclick = exitFullscreen
        
        // Add image info overlay
        const infoOverlay = document.createElement('div')
        infoOverlay.className = 'absolute bottom-4 left-4 right-4 text-center'
        infoOverlay.innerHTML = `
          <div class="inline-block bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
            <div class="text-sm font-medium">${active.art.title || 'Untitled'}</div>
            ${hasMultipleImages ? `<div class="text-xs opacity-80 mt-1">Image ${active.idx + 1} of ${active.art.images?.length || 0}</div>` : ''}
          </div>
        `
        
        fullscreenContainer.appendChild(fullscreenImage)
        fullscreenContainer.appendChild(closeButton)
        fullscreenContainer.appendChild(infoOverlay)
        
        // Add keyboard navigation for fullscreen
        const handleKeyDown = (e) => {
          if (e.key === 'Escape') exitFullscreen()
          if (hasMultipleImages) {
            if (e.key === 'ArrowLeft') {
              setActive({ art: active.art, idx: (active.idx - 1 + (active.art.images?.length || 1)) % (active.art.images?.length || 1) })
            }
            if (e.key === 'ArrowRight') {
              setActive({ art: active.art, idx: (active.idx + 1) % (active.art.images?.length || 1) })
            }
          }
        }
        
        fullscreenContainer.addEventListener('keydown', handleKeyDown)
        fullscreenContainer.setAttribute('tabindex', '0')
        fullscreenContainer.focus()
        
        // Store references for cleanup
        fullscreenContainer._handleKeyDown = handleKeyDown
        fullscreenContainer._closeButton = closeButton
        
        document.body.appendChild(fullscreenContainer)
        
        // Make it fullscreen
        fullscreenContainer.requestFullscreen?.() || fullscreenContainer.webkitRequestFullscreen?.()
        
        // Store reference for exit
        window._fullscreenContainer = fullscreenContainer
      }
    } else {
      exitFullscreen()
    }
  }
  
  const exitFullscreen = () => {
    if (window._fullscreenContainer) {
      window._fullscreenContainer.remove()
      window._fullscreenContainer = null
    }
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    }
  }

  // Handle like functionality
  const handleLike = async (art) => {
    try {
      const response = await fetch('https://asia-southeast1-kuyajp-portfolio.cloudfunctions.net/likePhoto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imagePath: art.path || art.id })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Store the updated likes count in cache
        likesCache.current.set(art.id, result.newLikesCount)
        
        // Update the active artwork's likes count
        setActive(prev => ({
          ...prev,
          art: {
            ...prev.art,
            likes: result.newLikesCount
          }
        }));
      }
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  // Get the current image source safely
  const getCurrentImageSrc = () => {
    return active.art.src || active.art.image || null
  }

  const currentImageSrc = getCurrentImageSrc()
  const hasMultipleImages = false // Each artwork is a single image

  return (
    <>
      {/* Cinematic Backdrop */}
      <div 
        className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-xl transition-all duration-500" 
        onClick={() => setActive(null)} 
      />
      
      {/* Main modal container */}
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center lg:overflow-hidden overflow-y-auto"
        role="dialog" 
        aria-modal="true"
        tabIndex={-1}
        onKeyDown={(e) => e.stopPropagation()}
        style={{ outline: 'none' }}
      >
        <div ref={containerRef} className="w-full h-full pointer-events-auto flex flex-col lg:flex-row">
          
          <div className="fixed inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none lg:absolute" />
          
          {/* Main Image Area - Cinematic & Centered */}
          <div className="relative flex-[2] lg:flex-1 h-[60vh] lg:h-full flex flex-col justify-center overflow-hidden">
            {/* Minimal Header Overlay */}
            <div className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 flex justify-between items-start pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-4">
                <button 
                  onClick={() => setActive(null)}
                  className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                  <div className="p-2 rounded-full bg-white/10 backdrop-blur-md group-hover:bg-white/20 transition-all">
                    <ChevronLeft size={20} />
                  </div>
                  <span className="text-sm font-medium tracking-wide hidden sm:block">Back</span>
                </button>
              </div>

              <div className="pointer-events-auto flex gap-3">
                <button 
                  onClick={toggleFullscreen}
                  className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white/70 hover:text-white hover:bg-white/20 transition-all"
                  title="Toggle Fullscreen"
                >
                  {isFs ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
              </div>
            </div>

            {/* Image Stage */}
            <div className="flex-1 relative flex items-center justify-center w-full h-full p-0 sm:p-8 lg:p-12 overflow-hidden">
              {currentImageSrc ? (
                <img 
                  ref={imageRef}
                  src={currentImageSrc} 
                  alt={active.art.title || ''} 
                  className={`w-full h-full object-contain transition-all duration-500 shadow-2xl ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                  style={{ 
                    filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.5))'
                  }}
                />
              ) : (
                <div className="text-white/50 flex flex-col items-center">
                  <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                  <span className="text-sm tracking-widest uppercase">Loading Masterpiece</span>
                </div>
              )}

              {/* Navigation Arrows (Floating) */}
              <div className="absolute inset-x-4 sm:inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                <button
                  onClick={navigateLeft}
                  disabled={getLeftNavigationInfo().disabled}
                  className={`pointer-events-auto p-4 rounded-full transition-all duration-300 group ${
                    getLeftNavigationInfo().disabled ? 'opacity-0 cursor-not-allowed' : 'opacity-50 hover:opacity-100 hover:bg-white/10 backdrop-blur-sm'
                  }`}
                >
                  <ChevronLeft size={32} className="text-white drop-shadow-lg group-hover:-translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={navigateRight}
                  disabled={getRightNavigationInfo().disabled}
                  className={`pointer-events-auto p-4 rounded-full transition-all duration-300 group ${
                    getRightNavigationInfo().disabled ? 'opacity-0 cursor-not-allowed' : 'opacity-50 hover:opacity-100 hover:bg-white/10 backdrop-blur-sm'
                  }`}
                >
                  <ChevronRight size={32} className="text-white drop-shadow-lg group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Info Panel (Desktop & Mobile) */}
          <div className="flex-none lg:flex w-full lg:w-[400px] h-auto lg:h-full bg-[rgb(var(--bg))] border-t lg:border-t-0 lg:border-l border-white/5 flex-col shadow-2xl relative z-20">
            <div className="flex-1 lg:overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
              
              {/* Top Meta */}
              <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-[rgb(var(--primary))]/30 text-[rgb(var(--primary))] text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-bold">
                  Single Shot
                </span>
                <button onClick={() => handleLike(active.art)} className="group flex items-center gap-1 sm:gap-2 transition-all">
                  <span className="text-[10px] sm:text-xs font-mono opacity-50 group-hover:opacity-100 transition-opacity hidden sm:inline">
                    {active.art?.likes || 0} APPRECIATIONS
                  </span>
                  <div className="p-1.5 sm:p-2 rounded-full bg-white/5 group-hover:bg-red-500/10 transition-colors">
                    <Heart size={14} className={`sm:w-[18px] sm:h-[18px] transition-all duration-300 ${active.art?.likes > 0 ? "fill-red-500 text-red-500" : "text-white/40 group-hover:text-red-500 group-hover:scale-110"}`} />
                  </div>
                </button>
              </div>

              {/* Title Section */}
              <div className="mb-4 sm:mb-6 lg:mb-10">
                <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold leading-[1.1] mb-1 sm:mb-2 lg:mb-3 text-[rgb(var(--fg))]">
                  {active.art.title}
                </h1>
                {active.art.scientificName && (
                  <p className="text-sm sm:text-base lg:text-xl text-[rgb(var(--primary))] italic font-serif opacity-90">
                    {active.art.scientificName}
                  </p>
                )}
              </div>

              {/* Description */}
              {active.art.description && (
                <div className="mb-4 sm:mb-6 lg:mb-10 text-[rgb(var(--muted-fg))] leading-relaxed font-light text-sm sm:text-base lg:text-lg">
                  {active.art.description}
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6 py-4 sm:py-6 lg:py-8 border-y border-white/5">
                <div>
                  <h4 className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--muted))] mb-1 sm:mb-2">Location</h4>
                  <p className="text-xs sm:text-sm lg:text-base text-[rgb(var(--fg))] font-medium">{active.art.location || 'Unknown Location'}</p>
                </div>
                <div>
                  <h4 className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--muted))] mb-1 sm:mb-2">Date Taken</h4>
                  <p className="text-xs sm:text-sm lg:text-base text-[rgb(var(--fg))] font-medium">{active.art.timeTaken || 'Unknown Date'}</p>
                </div>
                {active.art.history && (
                  <div>
                    <h4 className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--muted))] mb-1 sm:mb-2">Story</h4>
                    <p className="text-xs sm:text-sm text-[rgb(var(--fg))] leading-relaxed opacity-80">{active.art.history}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 lg:p-6 border-t border-white/5 bg-[rgb(var(--bg))]">
              <div className="flex justify-between items-center text-[8px] sm:text-[10px] uppercase tracking-widest text-[rgb(var(--muted))]">
                <span>© John Philip Morada</span>
                <span>Image {allArtworks.findIndex(art => art.id === active.art.id) + 1} / {allArtworks.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}



import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ChevronRight, User } from 'lucide-react'
import { getImagesFromFolder } from '../firebase/storage'

export default function Home() {
  const [active, setActive] = useState(null)
  const [imageDimensions, setImageDimensions] = useState({})
  const [landscapeImages, setLandscapeImages] = useState([])
  const [firebaseImages, setFirebaseImages] = useState([])
  const [loading, setLoading] = useState(true)

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

  // Snapping functionality disabled - normal scrolling only
  useEffect(() => {
    // Ensure page starts at the top when component mounts
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  return (
    <main>
      {/* Full-width hero */}
      <section className="relative w-full snap-section">
        <div className="relative h-dvh">
          <img
            src="/Hero.jpg"
            alt="Photographer hero"
            className="absolute inset-0 w-full h-dvh object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white drop-shadow mb-4">Philip Photography</h1>
              <p className="text-white/90 max-w-2xl mx-auto text-lg">Capturing the beauty of wildlife, especially the magnificent diversity of bird species in their natural habitats.</p>
              <Link to="/gallery" className="btn-outline border-white text-white hover:bg-white hover:text-black mt-8 inline-block">VIEW GALLERY</Link>
            </div>
          </div>
          
          {/* Testimonials Section - Bottom of Hero - Hidden on mobile */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 hidden lg:block testimonials-mobile-hidden">
            <div className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
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
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
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
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
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
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
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
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction section */}
      <section className="snap-section bg-[rgb(var(--bg))] min-h-screen flex flex-col justify-start">
        <div className="container-responsive py-4 sm:py-6">
          {/* Editorial masthead - mobile optimized */}
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="lg:col-span-5">
                <h2 className="font-extrabold leading-tight max-w-xl">
                  <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-[rgb(var(--primary))]">John Philip Morada</span>
                  <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-[rgb(var(--fg))] mt-1">Wildlife & Bird Photography</span>
                </h2>
                <div className="mt-3 sm:mt-4 h-[2px] sm:h-[3px] w-16 sm:w-20 lg:w-24 bg-[rgb(var(--primary))]" />
                <p className="mt-3 sm:mt-4 text-[rgb(var(--muted-fg))] text-sm sm:text-base leading-relaxed">
                  Based in the Philippines. Field-driven work focused on light, timing, and honest stories from the wild.
                </p>
                {/* Portfolio badge - hidden on mobile */}
                <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3 hidden sm:flex">
                  <div className="inline-block rounded-full px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] uppercase tracking-[0.25em] bg-[rgb(var(--muted))]/10 text-[rgb(var(--muted))]">Portfolio</div>
                  <div className="text-xs sm:text-sm text-[rgb(var(--muted))]">2024 Edition</div>
                </div>
                {/* Category cards - hidden on mobile, visible on tablet+ */}
                <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-3 sm:gap-4 max-w-sm sm:max-w-md hidden md:grid">
                  <div className="bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/20 rounded-lg p-3 sm:p-4 text-center hover:border-[rgb(var(--primary))]/30 transition-colors duration-300">
                    <div className="text-lg sm:text-xl font-semibold text-[rgb(var(--fg))]">Birdlife</div>
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mt-1">Focus</div>
                  </div>
                  <div className="bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/20 rounded-lg p-3 sm:p-4 text-center hover:border-[rgb(var(--primary))]/30 transition-colors duration-300">
                    <div className="text-lg sm:text-xl font-semibold text-[rgb(var(--fg))]">Philippines</div>
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mt-1">Base</div>
                  </div>
                  <div className="bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/20 rounded-lg p-3 sm:p-4 text-center hover:border-[rgb(var(--primary))]/30 transition-colors duration-300">
                    <div className="text-lg sm:text-xl font-semibold text-[rgb(var(--fg))]">Worldwide</div>
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mt-1">Available</div>
                  </div>
                </div>
              </div>
              {/* Hero image - always visible but responsive sizing */}
              <div className="lg:col-span-5 lg:justify-self-end mt-6 lg:mt-0">
                <figure className="relative group max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto lg:mx-0 lg:ml-auto">
                  <img
                    src="/KuyaJP.jpg"
                    alt="John Philip Morada photographing with a telephoto lens on a tripod"
                    className="w-full aspect-square object-cover rounded-xl sm:rounded-2xl shadow-xl border border-black/10 dark:border-white/10 hover:shadow-2xl transition-shadow duration-300"
                  />
                  <figcaption className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm backdrop-blur-md bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    In the field: patience, light, and timing.
                  </figcaption>
                  <div className="pointer-events-none absolute inset-0 rounded-xl sm:rounded-2xl ring-1 ring-inset ring-black/10 dark:ring-white/10" />
                </figure>
              </div>
            </div>
            
          </div>

          {/* Removed secondary CTA row per request */}

           {/* Selected Works - Continuous Horizontal Chain */}
          <div className="relative">
            <div className="text-center mb-4 sm:mb-6 md:mb-8">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[rgb(var(--fg))]">Selected Works</h3>
              <p className="text-xs sm:text-sm text-[rgb(var(--muted-fg))] mt-1 sm:mt-2">A glimpse into the wild through my lens</p>
              {/* Decorative elements */}
              <div className="mt-2 sm:mt-3 md:mt-4 flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
                <div className="h-px w-8 sm:w-10 md:w-12 bg-[rgb(var(--primary))]" />
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[rgb(var(--primary))]" />
                <div className="h-px w-8 sm:w-10 md:w-12 bg-[rgb(var(--primary))]" />
              </div>
            </div>

            {/* Full-width photo chain with edge fades */}
            <div className="absolute left-0 w-screen overflow-hidden" style={{ left: '50%', transform: 'translateX(-50%)' }}>
              {/* Gradient edge fades */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[rgb(var(--bg))] to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[rgb(var(--bg))] to-transparent" />
              {/* Top-right hint */}
              <div className="absolute right-6 -top-6 text-[10px] tracking-widest uppercase text-[rgb(var(--muted))]">
                {allPhotographs.length > 0 && landscapeImages.length === 0 ? 'Processing images...' : 'Hover to pause'}
              </div>
              {loading || (allPhotographs.length > 0 && landscapeImages.length === 0) ? (
                <div className="flex gap-4 py-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex-shrink-0 w-48 h-32 sm:w-52 sm:h-36 rounded-lg overflow-hidden">
                      <div className="w-full h-full bg-gray-800 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : displayImages.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <span className="text-white/70 text-sm">No images found in Firebase Storage</span>
                </div>
              ) : (
                <div 
                  className="flex gap-4 infinite-scroll transition-all duration-500 ease-in-out"
                  style={{ 
                    width: `calc(${displayImages.length * 3} * (200px + 16px))`,
                    minHeight: '144px' // Fixed height to prevent layout shifts (36 * 4 for sm screens)
                  }}
                >
                {/* First set of images */}
                {displayImages.map((photo, index) => (
                  <div 
                    key={photo.id} 
                    className="flex-shrink-0 group cursor-pointer"
                    onClick={() => setActive({ art: { images: [photo.src], title: photo.title }, idx: 0 })}
                  >
                    <div className="relative w-48 h-32 sm:w-52 sm:h-36 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ring-1 ring-black/10 dark:ring-white/10 hover:ring-[rgb(var(--primary))]/40">
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-95"
                        onLoad={(e) => {
                          const { naturalWidth, naturalHeight } = e.target
                          handleImageLoad(photo, naturalWidth, naturalHeight)
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-white/80">{String(index + 1).padStart(2, '0')}</div>
                      <div className="absolute bottom-2 left-2 right-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                        <div className="text-white text-xs font-mono tracking-widest opacity-80 mb-1">
                          {String(index + 1).padStart(2, '0')}/
                        </div>
                        <div className="text-white text-xs font-semibold uppercase tracking-wide truncate">
                          {photo.title}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Second set for seamless loop */}
                {displayImages.map((photo, index) => (
                  <div 
                    key={`duplicate-${photo.id}`} 
                    className="flex-shrink-0 group cursor-pointer"
                    onClick={() => setActive({ art: { images: [photo.src], title: photo.title }, idx: 0 })}
                  >
                    <div className="relative w-48 h-32 sm:w-52 sm:h-36 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ring-1 ring-black/10 dark:ring-white/10 hover:ring-[rgb(var(--primary))]/40">
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-white/80">{String(index + 1).padStart(2, '0')}</div>
                      <div className="absolute bottom-2 left-2 right-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                        <div className="text-white text-xs font-mono tracking-widest opacity-80 mb-1">
                          {String(index + 1).padStart(2, '0')}/
                        </div>
                        <div className="text-white text-xs font-semibold uppercase tracking-wide truncate">
                          {photo.title}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Third set for ultra-smooth loop */}
                {displayImages.map((photo, index) => (
                  <div 
                    key={`triple-${photo.id}`} 
                    className="flex-shrink-0 group cursor-pointer"
                    onClick={() => setActive({ art: { images: [photo.src], title: photo.title }, idx: 0 })}
                  >
                    <div className="relative w-48 h-32 sm:w-52 sm:h-36 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ring-1 ring-black/10 dark:ring-white/10 hover:ring-[rgb(var(--primary))]/40">
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-white/80">{String(index + 1).padStart(2, '0')}</div>
                      <div className="absolute bottom-2 left-2 right-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                        <div className="text-white text-xs font-mono tracking-widest opacity-80 mb-1">
                          {String(index + 1).padStart(2, '0')}/
                        </div>
                        <div className="text-white text-xs font-semibold uppercase tracking-wide truncate">
                          {photo.title}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
           </div>

         </div>
      </section>
    </main>
  )
}




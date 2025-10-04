import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ChevronRight, User } from 'lucide-react'
import { getImagesFromFolder } from '../firebase/storage'
import { getFeaturedImages } from '../firebase/admin-api'

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

  // Calculate balanced grid layout for featured images
  const getFeaturedGridLayout = () => {
    if (featuredLoading || featuredImages.length === 0) return { gridCols: 3, gridRows: 2, images: [] }
    
    const processedImages = featuredImages.map(photo => {
      const dimensions = featuredImageDimensions[photo.id]
      return {
        ...photo,
        aspectRatio: dimensions?.aspectRatio || 1,
        isPortrait: dimensions ? dimensions.aspectRatio < 1 : false
      }
    })

    // Create a balanced 3x2 grid layout
    // Strategy: Place 1 portrait (spanning 2 rows) and fill remaining with landscapes
    const portraits = processedImages.filter(img => img.isPortrait)
    const landscapes = processedImages.filter(img => !img.isPortrait)
    
    const layoutImages = []
    const maxImages = Math.min(6, processedImages.length)
    
    // Place one portrait that spans 2 rows (position 0)
    if (portraits.length > 0 && maxImages >= 1) {
      layoutImages.push({ ...portraits.shift(), gridClass: 'col-span-1 row-span-2' })
    }
    
    // Fill remaining positions with landscapes or additional portraits
    let currentIndex = 1
    while (layoutImages.length < maxImages && currentIndex < 6) {
      // For positions 1, 2, 4, 5 (avoid position 3 which is below the portrait)
      if (currentIndex !== 3) {
        if (landscapes.length > 0) {
          layoutImages.push({ ...landscapes.shift(), gridClass: 'col-span-1 row-span-1' })
        } else if (portraits.length > 0) {
          layoutImages.push({ ...portraits.shift(), gridClass: 'col-span-1 row-span-1' })
        }
      }
      currentIndex++
    }
    
    // If we have position 3 available (below portrait), fill it
    if (layoutImages.length < maxImages && (landscapes.length > 0 || portraits.length > 0)) {
      if (landscapes.length > 0) {
        layoutImages.push({ ...landscapes.shift(), gridClass: 'col-span-1 row-span-1' })
      } else if (portraits.length > 0) {
        layoutImages.push({ ...portraits.shift(), gridClass: 'col-span-1 row-span-1' })
      }
    }

    return {
      gridCols: 3,
      gridRows: 2,
      images: layoutImages.slice(0, 6)
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
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold text-white drop-shadow mb-4 sm:mb-6 md:mb-8 lg:mb-10">Philip Photography</h1>
              <p className="text-white/90 max-w-2xl mx-auto text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl leading-relaxed lg:max-w-3xl">Capturing the beauty of wildlife, especially the magnificent diversity of bird species in their natural habitats.</p>
              <Link to="/gallery" className="btn-outline border-white text-white hover:bg-white hover:text-black mt-6 sm:mt-8 md:mt-10 lg:mt-12 inline-block text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 lg:py-5">VIEW GALLERY</Link>
            </div>
          </div>
          
          {/* Testimonials Section - Bottom of Hero - Hidden on mobile */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 hidden lg:block testimonials-mobile-hidden">
            <div className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-4 sm:gap-6">
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
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hidden xl:block">
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
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hidden xl:block">
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
      <section className="snap-section bg-[rgb(var(--bg))] min-h-screen flex items-center py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container-responsive w-full">
          <div className="text-center lg:text-left">
            {/* Editorial masthead - mobile optimized */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 md:gap-6 lg:gap-8 xl:gap-12 items-center">
            <div className="lg:col-span-7 text-left">
              <h2 className="font-extrabold leading-tight max-w-2xl">
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl text-[rgb(var(--primary))]">John Philip Morada</span>
                <span className="block text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl 2xl:text-4xl text-[rgb(var(--fg))] mt-1">Wildlife & Bird Photography</span>
              </h2>
              <div className="mt-1 sm:mt-2 md:mt-3 lg:mt-3 h-[2px] sm:h-[3px] md:h-[4px] lg:h-[4px] w-12 sm:w-16 md:w-20 lg:w-20 xl:w-24 2xl:w-28 bg-[rgb(var(--primary))]" />
              <p className="mt-1 sm:mt-2 md:mt-3 lg:mt-3 text-[rgb(var(--muted-fg))] text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl leading-relaxed max-w-2xl">
                Based in the Philippines. Field-driven work focused on light, timing, and honest stories from the wild.
              </p>
              {/* Portfolio badge - hidden on mobile */}
              <div className="mt-3 sm:mt-4 md:mt-5 lg:mt-6 flex items-center gap-2 sm:gap-3 md:gap-4 hidden sm:flex">
                <div className="inline-block rounded-full px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-2 md:py-3 text-[9px] sm:text-[10px] md:text-xs lg:text-base xl:text-lg uppercase tracking-[0.25em] bg-[rgb(var(--muted))]/10 text-[rgb(var(--muted))]">Portfolio</div>
                <div className="text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl text-[rgb(var(--muted))]">2024 Edition</div>
              </div>
              
              {/* Category cards - Desktop only, below Portfolio section */}
              <div className="mt-3 sm:mt-4 md:mt-5 lg:mt-5 xl:mt-6 grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-4 xl:gap-6 2xl:gap-8 hidden md:grid max-w-md">
                <div className="bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/20 rounded-lg p-1.5 sm:p-2 md:p-3 lg:p-2 xl:p-3 2xl:p-4 text-center hover:border-[rgb(var(--primary))]/30 transition-colors duration-300">
                  <div className="text-sm sm:text-base md:text-lg lg:text-xs xl:text-sm 2xl:text-base font-semibold text-[rgb(var(--fg))]">Birdlife</div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-[8px] xl:text-[9px] 2xl:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mt-0.5 lg:mt-0.5">Focus</div>
                </div>
                <div className="bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/20 rounded-lg p-1.5 sm:p-2 md:p-3 lg:p-2 xl:p-3 2xl:p-4 text-center hover:border-[rgb(var(--primary))]/30 transition-colors duration-300">
                  <div className="text-sm sm:text-base md:text-lg lg:text-xs xl:text-sm 2xl:text-base font-semibold text-[rgb(var(--fg))]">Philippines</div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-[8px] xl:text-[9px] 2xl:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mt-0.5 lg:mt-0.5">Base</div>
                </div>
                <div className="bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/20 rounded-lg p-1.5 sm:p-2 md:p-3 lg:p-2 xl:p-3 2xl:p-4 text-center hover:border-[rgb(var(--primary))]/30 transition-colors duration-300">
                  <div className="text-sm sm:text-base md:text-lg lg:text-xs xl:text-sm 2xl:text-base font-semibold text-[rgb(var(--fg))]">Worldwide</div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-[8px] xl:text-[9px] 2xl:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mt-0.5 lg:mt-0.5">Available</div>
                </div>
              </div>
            </div>
            {/* Hero image - always visible but responsive sizing */}
            <div className="lg:col-span-5 lg:justify-self-end mt-4 sm:mt-6 lg:mt-0">
              <figure className="relative group max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto lg:mx-0">
                <img
                  src="/KuyaJP.jpg"
                  alt="John Philip Morada photographing with a telephoto lens on a tripod"
                  className="w-full aspect-square object-cover rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-3xl xl:rounded-3xl shadow-xl border border-black/10 dark:border-white/10 hover:shadow-2xl transition-shadow duration-300"
                />
                <figcaption className="absolute bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-5 left-2 sm:left-3 md:left-4 lg:left-5 right-2 sm:right-3 md:right-4 lg:right-5 px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-3 lg:py-4 rounded-lg text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl backdrop-blur-md bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  In the field: patience, light, and timing.
                </figcaption>
                <div className="pointer-events-none absolute inset-0 rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-3xl xl:rounded-3xl ring-1 ring-inset ring-black/10 dark:ring-white/10" />
              </figure>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Section 3: Magazine Style Layout */}
      <section className="snap-section bg-[rgb(var(--bg))] min-h-screen flex items-center py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container-responsive w-full">
          {/* Magazine-style Editorial Header */}
          <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column - Editorial Content */}
              <div className="lg:col-span-6 space-y-6 lg:space-y-8">
                {/* Issue Info */}
                <div className="border-l-4 border-[rgb(var(--primary))] pl-4 sm:pl-6">
                  <div className="text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] text-[rgb(var(--muted))] mb-1">
                    Featured Collection
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-[rgb(var(--fg))] leading-tight">
                    Selected Works
                  </div>
                  <div className="text-xs sm:text-sm md:text-base lg:text-lg text-[rgb(var(--muted-fg))] mt-2">
                    Issue 2024 • Wildlife Photography
                  </div>
                </div>

                {/* Editorial Content - More compact on mobile */}
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                    <p className="text-[rgb(var(--muted-fg))] leading-relaxed text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">
                      Each photograph represents hours of patient observation and perfect timing. 
                      From the elusive Philippine Eagle to the vibrant sunbirds of Mindanao, 
                      these images capture the essence of wildlife in its purest form.
                    </p>
                  </div>

                  {/* Stats - More compact on mobile */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 pt-3 sm:pt-4 md:pt-6 border-t border-[rgb(var(--muted))]/20">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[rgb(var(--primary))]">0</div>
                      <div className="text-[10px] sm:text-xs md:text-sm lg:text-base text-[rgb(var(--muted-fg))] uppercase tracking-wide">Years Experience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[rgb(var(--primary))]">0</div>
                      <div className="text-[10px] sm:text-xs md:text-sm lg:text-base text-[rgb(var(--muted-fg))] uppercase tracking-wide">Species Captured</div>
                    </div>
                  </div>

                  {/* Equipment Note - Hidden on mobile and small screens */}
                  <div className="bg-[rgb(var(--muted))]/5 rounded-lg p-4 sm:p-6 border border-[rgb(var(--muted))]/10 hidden sm:block">
                    <div className="text-xs sm:text-sm font-semibold text-[rgb(var(--primary))] uppercase tracking-wide mb-2">
                      Field Notes
                    </div>
                    <p className="text-xs sm:text-sm md:text-base text-[rgb(var(--muted-fg))] leading-relaxed">
                      "The key to wildlife photography is understanding behavior patterns and 
                      being ready for that split-second moment when everything aligns perfectly."
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Dynamic Featured Grid */}
              <div className="lg:col-span-6">
                {featuredLoading ? (
                  <div className="grid grid-cols-3 grid-rows-2 gap-2 sm:gap-3 md:gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : featuredImages.length === 0 ? (
                  <div className="grid grid-cols-3 grid-rows-2 gap-2 sm:gap-3 md:gap-4">
                    <div className="col-span-3 row-span-2 flex items-center justify-center aspect-[3/2] bg-[rgb(var(--muted))]/5 rounded-lg border border-[rgb(var(--muted))]/20">
                      <div className="text-center">
                        <div className="text-[rgb(var(--muted-fg))] text-sm mb-2">No Featured Images</div>
                        <div className="text-[rgb(var(--muted))] text-xs">Upload images to 'featured' folder</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 grid-rows-2 gap-2 sm:gap-3 md:gap-4">
                    {getFeaturedGridLayout().images.map((photo, index) => {
                      return (
                        <div 
                          key={photo.id} 
                          className={`group cursor-pointer ${photo.gridClass || 'col-span-1 row-span-1'}`}
                          onClick={() => setActive({ art: { images: [photo.src], title: photo.title }, idx: 0 })}
                        >
                          <div className="relative h-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <img
                              src={photo.src}
                              alt={photo.alt}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              onLoad={(e) => {
                                const { naturalWidth, naturalHeight } = e.target
                                handleFeaturedImageLoad(photo, naturalWidth, naturalHeight)
                              }}
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            {/* Badge */}
                            <div className="absolute top-2 left-2 text-[8px] sm:text-[9px] md:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-[rgb(var(--primary))] text-white shadow-lg">
                              {String(index + 1).padStart(2, '0')}
                            </div>
                            
                            {/* Info panel */}
                            <div className="absolute bottom-1 left-1 right-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                              <div className="bg-black/60 backdrop-blur-sm rounded px-1.5 py-1 border border-white/10">
                                <div className="text-white text-[8px] sm:text-[9px] font-mono tracking-widest opacity-90">
                                  Featured {String(index + 1).padStart(2, '0')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full Width Carousel at Bottom */}
          <div className="relative w-full overflow-hidden">
            {/* Enhanced gradient edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 md:w-32 lg:w-40 xl:w-48 2xl:w-56 bg-gradient-to-r from-[rgb(var(--bg))] to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 md:w-32 lg:w-40 xl:w-48 2xl:w-56 bg-gradient-to-l from-[rgb(var(--bg))] to-transparent z-10" />
            
            {loading || (allPhotographs.length > 0 && landscapeImages.length === 0) ? (
              <div className="flex gap-3 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 justify-center">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex-shrink-0 w-32 h-24 sm:w-40 sm:h-30 md:w-48 md:h-36 lg:w-56 lg:h-42 xl:w-64 xl:h-48 2xl:w-72 2xl:h-54 rounded-xl lg:rounded-2xl overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : displayImages.length === 0 ? (
              <div className="flex items-center justify-center py-8 sm:py-12 md:py-16">
                <span className="text-[rgb(var(--muted-fg))] text-sm sm:text-base md:text-lg">No images found in Firebase Storage</span>
              </div>
            ) : (
              <div 
                className="flex gap-3 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 infinite-scroll transition-all duration-500 ease-in-out justify-center"
                style={{ 
                  width: `calc(${displayImages.length * 3} * (clamp(180px, 10vw, 280px) + clamp(12px, 2.5vw, 40px)))`,
                  minHeight: 'clamp(120px, 18vh, 280px)'
                }}
              >
              {/* First set of images with magazine styling */}
              {displayImages.map((photo, index) => (
                <div 
                  key={photo.id} 
                  className="flex-shrink-0 group cursor-pointer"
                  onClick={() => setActive({ art: { images: [photo.src], title: photo.title }, idx: 0 })}
                >
                  <div className="relative rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 ring-2 ring-black/5 dark:ring-white/5 hover:ring-[rgb(var(--primary))]/30 group-hover:scale-[0.98]" style={{width: 'clamp(180px, 10vw, 280px)', height: 'clamp(135px, 15vw, 210px)'}}>
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onLoad={(e) => {
                        const { naturalWidth, naturalHeight } = e.target
                        handleImageLoad(photo, naturalWidth, naturalHeight)
                      }}
                    />
                    {/* Magazine-style overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Magazine badge */}
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 text-[9px] sm:text-[10px] md:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[rgb(var(--primary))] text-white shadow-lg">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    
                    {/* Magazine info panel */}
                    <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/10">
                        <div className="text-white text-[10px] sm:text-xs font-mono tracking-widest opacity-90 mb-1">
                          Featured {String(index + 1).padStart(2, '0')}
                        </div>
                        <div className="text-white text-xs sm:text-sm font-semibold uppercase tracking-wide truncate">
                          {photo.title}
                        </div>
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
                  <div className="relative rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 ring-2 ring-black/5 dark:ring-white/5 hover:ring-[rgb(var(--primary))]/30 group-hover:scale-[0.98]" style={{width: 'clamp(180px, 10vw, 280px)', height: 'clamp(135px, 15vw, 210px)'}}>
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 text-[9px] sm:text-[10px] md:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[rgb(var(--primary))] text-white shadow-lg">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/10">
                        <div className="text-white text-[10px] sm:text-xs font-mono tracking-widest opacity-90 mb-1">
                          Featured {String(index + 1).padStart(2, '0')}
                        </div>
                        <div className="text-white text-xs sm:text-sm font-semibold uppercase tracking-wide truncate">
                          {photo.title}
                        </div>
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
                  <div className="relative rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 ring-2 ring-black/5 dark:ring-white/5 hover:ring-[rgb(var(--primary))]/30 group-hover:scale-[0.98]" style={{width: 'clamp(180px, 10vw, 280px)', height: 'clamp(135px, 15vw, 210px)'}}>
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 text-[9px] sm:text-[10px] md:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[rgb(var(--primary))] text-white shadow-lg">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/10">
                        <div className="text-white text-[10px] sm:text-xs font-mono tracking-widest opacity-90 mb-1">
                          Featured {String(index + 1).padStart(2, '0')}
                        </div>
                        <div className="text-white text-xs sm:text-sm font-semibold uppercase tracking-wide truncate">
                          {photo.title}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action Section - 4th Section */}
      <section className="snap-section bg-[rgb(var(--bg))] min-h-screen flex items-center py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container-responsive w-full">
          <div className="text-center">
            <div className="mb-8 sm:mb-12 md:mb-16 lg:mb-20 xl:mb-24">
              <h4 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-[rgb(var(--fg))] mb-4 sm:mb-6 md:mb-8">
                Ready to capture your story?
              </h4>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-[rgb(var(--muted-fg))] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto leading-relaxed">
                Let's discuss your photography needs and create something extraordinary together.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12">
              <Link 
                to="/contact" 
                className="btn-primary text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 md:py-5 lg:py-6"
              >
                Get In Touch
              </Link>
              <Link 
                to="/gallery" 
                className="btn-outline text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 md:py-5 lg:py-6"
              >
                View Portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer section with comprehensive responsive spacing */}
      <footer className="bg-[rgb(var(--bg))] border-t border-[rgb(var(--muted))]/10 responsive-bottom-spacing">
        <div className="container-responsive">
          {/* Mobile: 432x874, 394x794, 412x891 - Compact spacing */}
          <div className="py-4 sm:py-6 md:py-8 lg:py-12 xl:py-16 2xl:py-20">
            <div className="text-center">
              {/* Copyright moved here */}
              <div className="text-center text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-[rgb(var(--muted))] tracking-widest uppercase">
                © 2024 Philip Photography
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}




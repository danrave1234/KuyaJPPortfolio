import { Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { ChevronRight, User, X, ChevronLeft, ChevronRight as ChevronRightIcon, Maximize2, Minimize2, Heart } from 'lucide-react'
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
                  <div className="text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl text-[rgb(var(--muted))]">{new Date().getFullYear()} Edition</div>
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
                    Issue {new Date().getFullYear()} • Wildlife Photography
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
                  <div className="flex items-center justify-center aspect-[3/2] bg-[rgb(var(--muted))]/5 rounded-lg border border-[rgb(var(--muted))]/20">
                    <div className="text-center">
                      <div className="w-5 h-5 border-2 border-[rgb(var(--primary))]/30 border-t-[rgb(var(--primary))] rounded-full animate-spin mx-auto mb-2"></div>
                      <div className="text-[rgb(var(--muted-fg))] text-sm">Loading featured image...</div>
                    </div>
                  </div>
                ) : featuredImages.length === 0 ? (
                  <div className="flex items-center justify-center aspect-[3/2] bg-[rgb(var(--muted))]/5 rounded-lg border border-[rgb(var(--muted))]/20">
                    <div className="text-center">
                      <div className="text-[rgb(var(--muted-fg))] text-sm mb-2">No Featured Image</div>
                      <div className="text-[rgb(var(--muted))] text-xs">Upload an image to 'featured' folder</div>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="group cursor-pointer"
                    onClick={() => {
                      const featuredImage = getFeaturedImage()
                      if (featuredImage) {
                        setActive({ art: { id: featuredImage.id, src: featuredImage.src, title: featuredImage.title, alt: featuredImage.alt, description: featuredImage.description }, idx: 0 })
                      }
                    }}
                  >
                    {(() => {
                      const featuredImage = getFeaturedImage()
                      if (!featuredImage) return null
                      
                      // Auto-fit container based on image orientation
                      const containerClass = featuredImage.isPortrait 
                        ? 'aspect-[3/4] max-w-sm mx-auto' // Portrait: taller container
                        : 'aspect-[4/3] w-full' // Landscape: wider container
                      
                      return (
                        <div className={`relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${containerClass}`}>
                          <img
                            src={featuredImage.src}
                            alt={featuredImage.alt}
                            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                            onLoad={(e) => {
                              const { naturalWidth, naturalHeight } = e.target
                              handleFeaturedImageLoad(featuredImage, naturalWidth, naturalHeight)
                            }}
                          />
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Featured badge */}
                          <div className="absolute top-3 left-3 text-xs font-bold px-3 py-1.5 rounded-full bg-[rgb(var(--primary))] text-white shadow-lg">
                            Featured
                          </div>
                          
                          {/* Info panel */}
                          <div className="absolute bottom-3 left-3 right-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
                              <p className="text-white text-sm font-semibold">
                                {featuredImage.title}
                              </p>
                              <p className="text-white/80 text-xs">
                                Featured Image
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
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
                  onClick={() => setActive({ art: { id: photo.id, src: photo.src, title: photo.title, alt: photo.alt, description: photo.description }, idx: 0 })}
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
                  onClick={() => setActive({ art: { id: photo.id, src: photo.src, title: photo.title, alt: photo.alt, description: photo.description }, idx: 0 })}
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
                  onClick={() => setActive({ art: { id: photo.id, src: photo.src, title: photo.title, alt: photo.alt, description: photo.description }, idx: 0 })}
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
                © {new Date().getFullYear()} Philip Photography
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal for carousel images */}
      {active && (
        <ModalViewer active={active} setActive={setActive} allArtworks={landscapeImages} />
      )}
    </main>
  )
}

function ModalViewer({ active, setActive, allArtworks }) {
  // Early return if active is null or invalid
  if (!active || !active.art) {
    return null
  }

  const activeRef = useRef(active)
  useEffect(() => { activeRef.current = active }, [active])
  
  // Simple navigation functions - move between artworks
  const navigateLeft = () => {
    const currentActive = activeRef.current
    if (!currentActive?.art) return
    
    const currentIndex = allArtworks.findIndex(art => art.id === currentActive.art.id)
    
    if (currentIndex > 0) {
      // Navigate to previous artwork
      const prevArt = allArtworks[currentIndex - 1]
      setActive({ art: prevArt, idx: 0 })
    }
  }
  
  const navigateRight = () => {
    const currentActive = activeRef.current
    if (!currentActive?.art) return
    
    const currentIndex = allArtworks.findIndex(art => art.id === currentActive.art.id)
    
    if (currentIndex < allArtworks.length - 1) {
      // Navigate to next artwork
      const nextArt = allArtworks[currentIndex + 1]
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
      {/* Enhanced backdrop with theme-aware blur */}
      <div 
        className="fixed inset-0 z-40 backdrop-blur-md transition-colors duration-300" 
        style={{
          background: 'linear-gradient(135deg, rgba(var(--bg), 0.95) 0%, rgba(var(--bg), 0.85) 50%, rgba(var(--bg), 0.95) 100%)'
        }}
        onClick={() => setActive(null)} 
      />
      
      {/* Main modal container */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-8 overflow-y-auto" 
        role="dialog" 
        aria-modal="true"
        tabIndex={-1}
        onKeyDown={(e) => {
          // Ensure keyboard events are captured by the modal
          e.stopPropagation()
        }}
        style={{ outline: 'none' }}
      >
        <div ref={containerRef} className="w-full max-w-7xl max-h-[98vh] sm:max-h-[95vh] relative my-auto">
          <div 
            ref={viewerRef} 
            className="relative rounded-2xl shadow-2xl ring-1 ring-[rgb(var(--muted))]/20 overflow-hidden transition-colors duration-300"
            style={{ 
              backgroundColor: 'rgb(var(--bg))',
              maxWidth: '100vw',
              maxHeight: '95vh'
            }}
          >
            
            {/* Header with controls */}
            <div 
              className="absolute top-0 left-0 right-0 z-20 p-3 sm:p-4 lg:p-6 transition-colors duration-300"
              style={{ 
                background: 'linear-gradient(to bottom, rgba(var(--bg), 0.9) 0%, rgba(var(--bg), 0.7) 50%, transparent 100%)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span 
                    className="ml-3 text-xs font-mono uppercase tracking-wider transition-colors duration-300"
                    style={{ color: 'rgba(var(--muted-fg), 0.8)' }}
                  >
                    Single Image
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className="p-2.5 rounded-full backdrop-blur-sm transition-all duration-200 shadow-lg hover:scale-105" 
                    style={{ 
                      backgroundColor: 'rgba(var(--muted), 0.2)',
                      color: 'rgb(var(--fg))'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(var(--muted), 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(var(--muted), 0.2)'
                    }}
                    onClick={toggleFullscreen} 
                    aria-label="View image in fullscreen"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                    </svg>
                  </button>
                  <button 
                    className="p-2.5 rounded-full backdrop-blur-sm transition-all duration-200 shadow-lg hover:scale-105" 
                    style={{ 
                      backgroundColor: 'rgba(var(--muted), 0.2)',
                      color: 'rgb(var(--fg))'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(var(--muted), 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(var(--muted), 0.2)'
                    }}
                    onClick={() => setActive(null)} 
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex flex-col lg:flex-row min-h-[75vh] sm:min-h-[75vh] lg:min-h-[80vh] overflow-y-auto" style={{ maxHeight: 'calc(98vh - 80px)' }}>
              
              {/* Image section */}
              <div 
                className="relative flex-1 overflow-hidden transition-colors duration-300"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(var(--muted), 0.1) 0%, rgba(var(--muted), 0.05) 100%)'
                }}
              >
                <div className="relative h-full min-h-[60vh] sm:min-h-[55vh] lg:min-h-[70vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-14 sm:pt-16 lg:pt-16 pb-12 sm:pb-10 lg:pb-8 overflow-hidden">
                  {currentImageSrc ? (
                    <img 
                      ref={imageRef}
                      src={currentImageSrc} 
                      alt={active.art.title || ''} 
                      className={`max-w-full max-h-full object-contain transition-all duration-700 rounded-lg ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: 'calc(100% - 4rem)', 
                        width: 'auto', 
                        height: 'auto',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto transition-colors duration-300"
                          style={{ backgroundColor: 'rgba(var(--muted), 0.2)' }}
                        >
                          <X size={24} style={{ color: 'rgba(var(--muted-fg), 0.6)' }} />
                        </div>
                        <div 
                          className="text-lg font-semibold mb-2 transition-colors duration-300"
                          style={{ color: 'rgb(var(--muted-fg))' }}
                        >
                          Image not available
                        </div>
                        <div 
                          className="text-sm transition-colors duration-300"
                          style={{ color: 'rgba(var(--muted-fg), 0.7)' }}
                        >
                          Unable to load image
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Smart Navigation arrows - always left/right with context-aware labels */}
                <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                  {/* Left navigation button */}
                  <div className="ml-2 sm:ml-4">
                    {(() => {
                      const leftInfo = getLeftNavigationInfo()
                      return (
                        <button
                          onClick={navigateLeft}
                          className={`pointer-events-auto p-2 sm:p-3 rounded-full transition-all duration-200 backdrop-blur-sm shadow-lg hover:scale-110 touch-manipulation ${
                            leftInfo.disabled
                              ? 'bg-black/20 text-gray-400 cursor-not-allowed' 
                              : 'bg-black/60 hover:bg-black/80 text-white'
                          }`}
                          title={leftInfo.label}
                          disabled={leftInfo.disabled}
                        >
                          <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                        </button>
                      )
                    })()}
                  </div>
                  
                  {/* Right navigation button */}
                  <div className="mr-2 sm:mr-4">
                    {(() => {
                      const rightInfo = getRightNavigationInfo()
                      return (
                        <button
                          onClick={navigateRight}
                          className={`pointer-events-auto p-2 sm:p-3 rounded-full transition-all duration-200 backdrop-blur-sm shadow-lg hover:scale-110 touch-manipulation ${
                            rightInfo.disabled
                              ? 'bg-black/20 text-gray-400 cursor-not-allowed' 
                              : 'bg-black/60 hover:bg-black/80 text-white'
                          }`}
                          title={rightInfo.label}
                          disabled={rightInfo.disabled}
                        >
                          <ChevronRightIcon size={18} className="sm:w-5 sm:h-5" />
                        </button>
                      )
                    })()}
                  </div>
                </div>
              </div>

              {/* Vertical divider between image and sidebar */}
              <div 
                className="hidden lg:block w-[2px] bg-gray-300 dark:bg-gray-600 transition-colors duration-300"
              ></div>

              {/* Sidebar with info and thumbnails */}
              <div 
                className="w-full lg:w-80 flex flex-col transition-colors duration-300 overflow-y-auto mt-4 sm:mt-0"
                style={{ 
                  backgroundColor: 'rgb(var(--bg))',
                  maxHeight: 'calc(95vh - 80px)'
                }}
              >
                
                {/* Content section */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                  
                  {/* Title and metadata */}
                  <div className="mb-6 sm:mb-8">
                    {/* Category Badge */}
                    <div className="mb-3">
                      <span 
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors duration-300"
                        style={{ 
                          backgroundColor: 'rgba(var(--primary), 0.1)',
                          color: 'rgb(var(--primary))',
                          border: '1px solid rgba(var(--primary), 0.2)'
                        }}
                      >
                        Photograph
                      </span>
                    </div>
                    
                    {/* Main Title */}
                    <h1 
                      className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4 sm:mb-6 transition-colors duration-300"
                      style={{ color: 'rgb(var(--fg))' }}
                    >
                      {active.art.title || 'Untitled'}
                    </h1>
                    
                    {/* Description */}
                    {active.art.description && (
                      <div className="mb-4 sm:mb-6">
                        <p 
                          className="leading-relaxed text-base sm:text-lg transition-colors duration-300"
                          style={{ color: 'rgba(var(--muted-fg), 0.9)' }}
                        >
                          {active.art.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Divider between title/description and details */}
                  <div 
                    className="w-full h-[2px] mb-4 sm:mb-6 bg-gray-300 dark:bg-gray-600 transition-colors duration-300"
                  ></div>

                  {/* Photo Details */}
                  <div className="transition-colors duration-300">
                    <h3 
                      className="text-sm sm:text-base font-bold mb-4 sm:mb-5 uppercase tracking-wider transition-colors duration-300"
                      style={{ color: 'rgb(var(--fg))' }}
                    >
                      Photo Details
                    </h3>
                    <div className="space-y-0 text-xs sm:text-sm">
                      {/* Scientific Name */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 px-0 gap-1 sm:gap-0">
                        <span 
                          className="font-medium transition-colors duration-300 text-xs sm:text-sm"
                          style={{ color: 'rgba(var(--muted-fg), 0.8)' }}
                        >
                          Scientific Name
                        </span>
                        <span 
                          className="font-semibold transition-colors duration-300 text-right text-xs sm:text-sm"
                          style={{ color: active.art.scientificName ? 'rgb(var(--fg))' : 'rgba(var(--muted-fg), 0.5)' }}
                        >
                          {active.art.scientificName ? (
                            <em>{active.art.scientificName}</em>
                          ) : (
                            <span className="italic">Not specified</span>
                          )}
                        </span>
                      </div>
                      <div 
                        className="w-full h-[1px] bg-gray-300 dark:bg-gray-600 transition-colors duration-300"
                      ></div>
                      
                      {/* Location */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 px-0 gap-1 sm:gap-0">
                        <span 
                          className="font-medium transition-colors duration-300 text-xs sm:text-sm"
                          style={{ color: 'rgba(var(--muted-fg), 0.8)' }}
                        >
                          Location
                        </span>
                        <span 
                          className="font-semibold transition-colors duration-300 text-right text-xs sm:text-sm break-words"
                          style={{ color: active.art.location ? 'rgb(var(--fg))' : 'rgba(var(--muted-fg), 0.5)' }}
                        >
                          {active.art.location || <span className="italic">Not specified</span>}
                        </span>
                      </div>
                      <div 
                        className="w-full h-[1px] bg-gray-300 dark:bg-gray-600 transition-colors duration-300"
                      ></div>
                      
                      {/* Time Taken */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 px-0 gap-1 sm:gap-0">
                        <span 
                          className="font-medium transition-colors duration-300 text-xs sm:text-sm"
                          style={{ color: 'rgba(var(--muted-fg), 0.8)' }}
                        >
                          Date Taken
                        </span>
                        <span 
                          className="font-semibold transition-colors duration-300 text-right text-xs sm:text-sm"
                          style={{ color: active.art.timeTaken ? 'rgb(var(--fg))' : 'rgba(var(--muted-fg), 0.5)' }}
                        >
                          {active.art.timeTaken || <span className="italic">Not specified</span>}
                        </span>
                      </div>
                      <div 
                        className="w-full h-[1px] bg-gray-300 dark:bg-gray-600 transition-colors duration-300"
                      ></div>
                      
                      {/* History */}
                      <div className="py-2 sm:py-3 px-0">
                        <span 
                          className="font-medium transition-colors duration-300 block mb-1 sm:mb-2 text-xs sm:text-sm"
                          style={{ color: 'rgba(var(--muted-fg), 0.8)' }}
                        >
                          History
                        </span>
                        <p 
                          className="text-xs sm:text-sm transition-colors duration-300 leading-relaxed"
                          style={{ color: active.art.history ? 'rgba(var(--muted-fg), 0.9)' : 'rgba(var(--muted-fg), 0.5)' }}
                        >
                          {active.art.history || <span className="italic">No additional information available</span>}
                        </p>
                      </div>
                      <div 
                        className="w-full h-[1px] bg-gray-300 dark:bg-gray-600 transition-colors duration-300"
                      ></div>
                      
                      {/* Likes */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 px-0 gap-1 sm:gap-0">
                        <span 
                          className="font-medium transition-colors duration-300 text-xs sm:text-sm"
                          style={{ color: 'rgba(var(--muted-fg), 0.8)' }}
                        >
                          Likes
                        </span>
                        <div className="flex items-center gap-2">
                          <span 
                            className="font-semibold transition-colors duration-300 text-xs sm:text-sm"
                            style={{ color: 'rgb(var(--fg))' }}
                          >
                            {active.art.likes || 0}
                          </span>
                          <button
                            onClick={() => handleLike(active.art)}
                            className="p-1 rounded-full hover:bg-[rgb(var(--muted))]/20 transition-all duration-200"
                            title="Like this photo"
                          >
                            <Heart 
                              size={14}
                              className="text-[rgb(var(--primary))] hover:scale-110 transition-transform duration-200 sm:w-4 sm:h-4"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer with navigation info */}
          <div 
            className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-gray-300 dark:border-gray-600 transition-colors duration-300"
            style={{ 
              background: 'linear-gradient(to top, rgba(var(--bg), 0.95) 0%, rgba(var(--bg), 0.8) 100%)'
            }}
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span 
                  className="text-xs font-mono uppercase tracking-wider transition-colors duration-300"
                  style={{ color: 'rgba(var(--muted-fg), 0.8)' }}
                >
                  Image {allArtworks.findIndex(art => art.id === active.art.id) + 1} of {allArtworks.length}
                </span>
              </div>
              <div 
                className="text-xs font-mono uppercase tracking-wider transition-colors duration-300"
                style={{ color: 'rgba(var(--muted-fg), 0.6)' }}
              >
                ← → for navigation
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


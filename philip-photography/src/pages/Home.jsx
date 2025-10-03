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

  // Load images from Firebase Storage
  useEffect(() => {
    const loadFirebaseImages = async () => {
      try {
        const result = await getImagesFromFolder('gallery')
        if (result.success) {
          const imagesWithIds = result.images.map((img, index) => ({
            id: index + 1,
            src: img.src,
            title: img.title || img.name,
            alt: img.alt || img.name
          }))
          setFirebaseImages(imagesWithIds)
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

  // Use landscape images if available, otherwise show all images initially
  const displayImages = landscapeImages.length > 0 ? landscapeImages : allPhotographs

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
          
          {/* Testimonials Section - Bottom of Hero */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
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
      <section className="snap-section bg-[rgb(var(--bg))] min-h-screen flex flex-col justify-start pt-20">
        <div className="container-responsive py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--fg))]">John Philip Morada</h2>
              <p className="mt-4 text-[rgb(var(--muted-fg))] leading-relaxed">
                Wildlife and bird photographer based in the Philippines. John Philip captures fleeting
                behavior, texture, and light—telling quiet stories from the field through patient observation
                and respectful distance.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/about" className="btn-solid">About the Photographer</Link>
                <Link to="/gallery" className="btn-outline">View Selected Works</Link>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <figure className="relative group max-w-sm mx-auto">
                <img
                  src="/KuyaJP.jpg"
                  alt="John Philip Morada photographing with a telephoto lens on a tripod"
                  className="w-full aspect-square object-cover rounded-2xl shadow-xl border border-black/10 dark:border-white/10"
                />
                <figcaption className="absolute bottom-3 left-3 right-3 px-4 py-2 rounded-lg text-sm backdrop-blur-md bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  In the field: patience, light, and timing.
                </figcaption>
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10 dark:ring-white/10" />
              </figure>
            </div>
          </div>

           {/* Selected Works - Continuous Horizontal Chain */}
           <div className="relative">
             <div className="text-center mb-6">
               <h3 className="text-2xl font-semibold text-[rgb(var(--fg))]">Selected Works</h3>
               <p className="text-sm text-[rgb(var(--muted-fg))] mt-2">A glimpse into the wild through my lens</p>
             </div>

            {/* Full-width photo chain that breaks out of container */}
            <div className="absolute left-0 w-screen overflow-hidden" style={{ left: '50%', transform: 'translateX(-50%)' }}>
              {loading ? (
                <div className="flex gap-4 items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <span className="text-white/70 text-sm ml-3">Loading images...</span>
                </div>
              ) : displayImages.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <span className="text-white/70 text-sm">No images found in Firebase Storage</span>
                </div>
              ) : (
                <div 
                  className="flex gap-4 infinite-scroll"
                  style={{ 
                    width: `calc(${displayImages.length * 3} * (200px + 16px))`
                  }}
                >
                {/* First set of images */}
                {displayImages.map((photo, index) => (
                  <div 
                    key={photo.id} 
                    className="flex-shrink-0 group cursor-pointer"
                    onClick={() => setActive({ art: { images: [photo.src], title: photo.title }, idx: 0 })}
                  >
                    <div className="relative w-48 h-32 sm:w-52 sm:h-36 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                    <div className="relative w-48 h-32 sm:w-52 sm:h-36 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                    <div className="relative w-48 h-32 sm:w-52 sm:h-36 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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




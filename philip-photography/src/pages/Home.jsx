import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ChevronRight, User } from 'lucide-react'

// Firebase Storage configuration
const FIREBASE_STORAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/kuyajp-portfolio.firebasestorage.app/o'

// Helper function to generate Firebase Storage URLs
const getFirebaseUrl = (filename) => `${FIREBASE_STORAGE_URL}/gallery%2F${filename}?alt=media`

export default function Home() {
  const [active, setActive] = useState(null)
  const [imageDimensions, setImageDimensions] = useState({})
  const [landscapeImages, setLandscapeImages] = useState([])

  // Uploaded photographs organized into groups (fixed missing images)
  const allPhotographs = [
    { id: 1, src: getFirebaseUrl('1.jpg'), title: 'WILDLIFE-PORTRAIT-001', alt: 'Wildlife portrait 1' },
    { id: 2, src: getFirebaseUrl('2.1.jpg'), title: 'WILDLIFE-SERIES-2A', alt: 'Wildlife series 2a' },
    { id: 3, src: getFirebaseUrl('2.2.jpg'), title: 'WILDLIFE-SERIES-2B', alt: 'Wildlife series 2b' },
    { id: 4, src: getFirebaseUrl('2.3.jpg'), title: 'WILDLIFE-SERIES-2C', alt: 'Wildlife series 2c' },
    { id: 5, src: getFirebaseUrl('2.4.jpg'), title: 'WILDLIFE-SERIES-2D', alt: 'Wildlife series 2d' },
    { id: 6, src: getFirebaseUrl('2.5.jpg'), title: 'WILDLIFE-SERIES-2E', alt: 'Wildlife series 2e' },
    { id: 7, src: getFirebaseUrl('2.6.jpg'), title: 'WILDLIFE-SERIES-2F', alt: 'Wildlife series 2f' },
    { id: 8, src: '/3.jpg', title: 'NATURE-LANDSCAPE-003', alt: 'Nature landscape 3' },
    { id: 9, src: '/3.2.jpg', title: 'NATURE-LANDSCAPE-003B', alt: 'Nature landscape 3b' },
    { id: 10, src: '/4.1.jpg', title: 'BIRD-PHOTOGRAPHY-4A', alt: 'Bird photography 4a' },
    { id: 11, src: '/4.2.jpg', title: 'BIRD-PHOTOGRAPHY-4B', alt: 'Bird photography 4b' },
    { id: 12, src: '/4.3.jpg', title: 'BIRD-PHOTOGRAPHY-4C', alt: 'Bird photography 4c' },
    { id: 13, src: '/4.4.jpg', title: 'BIRD-PHOTOGRAPHY-4D', alt: 'Bird photography 4d' },
    { id: 14, src: '/5.jpg', title: 'WILDLIFE-CAPTURE-005', alt: 'Wildlife capture 5' },
    { id: 15, src: '/6.jpg', title: 'NATURE-MOMENT-006', alt: 'Nature moment 6' },
    { id: 16, src: '/7.jpg', title: 'WILDLIFE-ACTION-007', alt: 'Wildlife action 7' },
    { id: 17, src: '/8.jpg', title: 'BIRD-IN-FLIGHT-008', alt: 'Bird in flight 8' },
    { id: 18, src: '/9.jpg', title: 'NATURE-DETAIL-009', alt: 'Nature detail 9' },
    { id: 19, src: '/11.jpg', title: 'LANDSCAPE-SHOT-011', alt: 'Landscape shot 11' },
    { id: 20, src: '/12.jpg', title: 'WILDLIFE-SCENE-012', alt: 'Wildlife scene 12' },
    { id: 21, src: '/13.jpg', title: 'NATURE-COMPOSITION-013', alt: 'Nature composition 13' },
    { id: 22, src: '/14.jpg', title: 'BIRD-PORTRAIT-014', alt: 'Bird portrait 14' },
    { id: 23, src: '/15.jpg', title: 'WILDLIFE-MOMENT-015', alt: 'Wildlife moment 15' },
    { id: 24, src: '/16.jpg', title: 'NATURE-LANDSCAPE-016', alt: 'Nature landscape 16' },
    { id: 25, src: '/17.jpg', title: 'WILDLIFE-CLOSE-UP-017', alt: 'Wildlife close-up 17' },
    { id: 26, src: '/19.jpg', title: 'NATURE-SCENE-019', alt: 'Nature scene 19' },
    { id: 27, src: '/20.jpg', title: 'WILDLIFE-ACTION-020', alt: 'Wildlife action 20' },
    { id: 28, src: '/21.jpg', title: 'BIRD-PHOTOGRAPHY-021', alt: 'Bird photography 21' },
    { id: 29, src: '/22.jpg', title: 'NATURE-MOMENT-022', alt: 'Nature moment 22' },
    { id: 30, src: '/23.jpg', title: 'WILDLIFE-PORTRAIT-023', alt: 'Wildlife portrait 23' },
    { id: 31, src: '/24.jpg', title: 'LANDSCAPE-VIEW-024', alt: 'Landscape view 24' },
    { id: 32, src: '/25.jpg', title: 'WILDLIFE-SERIES-025', alt: 'Wildlife series 25' },
    { id: 33, src: '/26.jpg', title: 'NATURE-DETAIL-026', alt: 'Nature detail 26' },
    { id: 34, src: '/27.jpg', title: 'BIRD-CAPTURE-027', alt: 'Bird capture 27' },
    { id: 35, src: '/28.jpg', title: 'WILDLIFE-LANDSCAPE-028', alt: 'Wildlife landscape 28' },
    { id: 36, src: '/29.jpg', title: 'NATURE-PORTRAIT-029', alt: 'Nature portrait 29' },
    { id: 37, src: '/30.jpg', title: 'WILDLIFE-SCENE-030', alt: 'Wildlife scene 30' },
    { id: 38, src: '/31.jpg', title: 'BIRD-PHOTOGRAPHY-031', alt: 'Bird photography 31' },
    { id: 39, src: '/32.jpg', title: 'NATURE-MOMENT-032', alt: 'Nature moment 32' },
    { id: 40, src: '/33.jpg', title: 'WILDLIFE-ACTION-033', alt: 'Wildlife action 33' },
    { id: 41, src: '/34.jpg', title: 'LANDSCAPE-SHOT-034', alt: 'Landscape shot 34' },
    { id: 42, src: '/35.jpg', title: 'NATURE-COMPOSITION-035', alt: 'Nature composition 35' },
    { id: 43, src: '/36.1.jpg', title: 'WILDLIFE-SERIES-36A', alt: 'Wildlife series 36a' },
    { id: 44, src: '/36.2.jpg', title: 'WILDLIFE-SERIES-36B', alt: 'Wildlife series 36b' },
    { id: 45, src: '/36.3.jpg', title: 'WILDLIFE-SERIES-36C', alt: 'Wildlife series 36c' },
    { id: 46, src: '/36.4.jpg', title: 'WILDLIFE-SERIES-36D', alt: 'Wildlife series 36d' },
    { id: 47, src: '/36.5.jpg', title: 'WILDLIFE-SERIES-36E', alt: 'Wildlife series 36e' },
    { id: 48, src: '/37.1.jpg', title: 'BIRD-SERIES-37A', alt: 'Bird series 37a' },
    { id: 49, src: '/37.2.jpg', title: 'BIRD-SERIES-37B', alt: 'Bird series 37b' },
    { id: 50, src: '/37.3.jpg', title: 'BIRD-SERIES-37C', alt: 'Bird series 37c' },
    { id: 51, src: '/38.jpg', title: 'WILDLIFE-PORTRAIT-038', alt: 'Wildlife portrait 38' },
    { id: 52, src: '/39.jpg', title: 'NATURE-LANDSCAPE-039', alt: 'Nature landscape 39' },
    { id: 53, src: '/40.jpg', title: 'WILDLIFE-CAPTURE-040', alt: 'Wildlife capture 40' },
    { id: 54, src: '/40.2.jpg', title: 'WILDLIFE-SERIES-40B', alt: 'Wildlife series 40b' },
    { id: 55, src: '/40..3.jpg', title: 'WILDLIFE-SERIES-40C', alt: 'Wildlife series 40c' },
    { id: 56, src: '/40.4.jpg', title: 'WILDLIFE-SERIES-40D', alt: 'Wildlife series 40d' },
    { id: 57, src: '/40.5.jpg', title: 'WILDLIFE-SERIES-40E', alt: 'Wildlife series 40e' },
    { id: 58, src: '/40.6.jpg', title: 'WILDLIFE-SERIES-40F', alt: 'Wildlife series 40f' },
    { id: 59, src: '/40.7.jpg', title: 'WILDLIFE-SERIES-40G', alt: 'Wildlife series 40g' },
    { id: 60, src: '/41.1.jpg', title: 'FINAL-SERIES-41A', alt: 'Final series 41a' },
    { id: 61, src: '/41.2.jpg', title: 'FINAL-SERIES-41B', alt: 'Final series 41b' }
  ]

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
            </div>
           </div>

         </div>
      </section>
    </main>
  )
}




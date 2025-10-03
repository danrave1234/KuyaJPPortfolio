import { useEffect, useState, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, ArrowRight } from 'lucide-react'
import { getImagesFromFolder } from '../firebase/storage'

export default function Gallery() {
  const [active, setActive] = useState(null) // { art, idx }
  const [imageDimensions, setImageDimensions] = useState({})
  const [loadedImages, setLoadedImages] = useState(new Set())
  const [firebaseImages, setFirebaseImages] = useState([])
  const [artworks, setArtworks] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(true)
  
  // Function to group images by series (using metadata)
  const groupImagesBySeries = (images) => {
    const groups = {};
    
    images.forEach(img => {
      if (img.isSeries && img.title) {
        // Group by title for series
        if (!groups[img.title]) {
          groups[img.title] = {
            images: [],
            title: img.title,
            alt: `${img.title} images`,
            isSeries: true,
            description: img.description || ''
          };
        }
        groups[img.title].images.push(img.src);
      } else {
        // Individual image (not part of a series)
        const individualName = `individual_${img.title || img.name}`;
        groups[individualName] = {
          images: [img.src],
          title: img.title || img.name.replace(/\.[^/.]+$/, ""),
          alt: img.alt || img.name,
          isSeries: false,
          description: img.description || ''
        };
      }
    });
    
    return Object.values(groups);
  }
  
  // Load all images from Firebase Storage and group by series
  useEffect(() => {
    const loadFirebaseImages = async () => {
      try {
        const result = await getImagesFromFolder('gallery');
        if (result.success) {
          // Group images by series (e.g., 2.1, 2.2, 2.3 -> Series 2)
          const groupedImages = groupImagesBySeries(result.images);
          
          // Convert grouped images to artwork format
          const artworkArray = groupedImages.map((group, index) => ({
            id: index + 1,
            images: group.images, // Multiple images per artwork for series
            title: group.title,
            alt: group.alt,
            isSeries: group.isSeries,
            description: group.description || ''
          }))

          // Shuffle and save order
          const shuffled = shuffleArray(artworkArray)
          localStorage.setItem('gallery-artwork-order', JSON.stringify(shuffled))
          setArtworks(shuffled)
        } else {
          console.error('Failed to load Firebase images:', result.error)
        }
      } catch (error) {
        console.error('Error loading Firebase images:', error)
      } finally {
        setGalleryLoading(false)
      }
    };
    loadFirebaseImages();
  }, []);
  
  // Shuffle function to randomize artwork order for chaotic layout
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
  
  // Use artworks from Firebase instead of hardcoded array
  const shuffledArtworks = artworks
    
  // Hardcoded artworks removed - now using Firebase Storage images

  const getBentoSize = (artwork, index) => {
    // Composite items are always small squares
    if (artwork.composite) {
      return 'small'
    }
    
    const dimensions = imageDimensions[artwork.id]
    
    // If image hasn't loaded yet, use small as default
    if (!dimensions) {
      return 'small'
    }
    
    const { aspectRatio, width, height } = dimensions
    
    // Simple rule: Portrait = 2 grids (medium), Landscape = 4 grids (large) or 1 grid (small)
    // Portrait: height > width (aspectRatio < 1) - should be vertical
    // Landscape: width >= height (aspectRatio >= 1) - should be 4 grids or 1 grid
    if (aspectRatio < 1.0) {
      // Portrait - height is larger than width - span 1 column, 2 rows (medium)
      return 'medium'
    } else {
      // Landscape - width is larger than or equal to height - deterministic based on artwork ID
      // Use artwork ID to create a pseudo-random but consistent decision
      return (artwork.id % 2 === 0) ? 'large' : 'small'
    }
  }


  const handleImageLoad = (id, naturalWidth, naturalHeight) => {
    const aspectRatio = naturalWidth / naturalHeight
    console.log(`Image ${id}: ${naturalWidth}x${naturalHeight}, aspectRatio: ${aspectRatio.toFixed(2)}`)
    setImageDimensions(prev => ({
      ...prev,
      [id]: { width: naturalWidth, height: naturalHeight, aspectRatio }
    }))
    setLoadedImages(prev => new Set([...prev, id]))
  }

  // Function to add new artwork dynamically
  const addNewArtwork = (newArtwork) => {
    const newId = Math.max(...artworks.map(a => a.id)) + 1
    const updatedArtworks = [...artworks, { ...newArtwork, id: newId }]
    // This would typically update state or call an API
    return updatedArtworks
  }

  // Function to determine optimal grid placement for new images
  const calculateOptimalGridLayout = (images) => {
    return images.map((img, index) => {
      // Simulate aspect ratio detection for uploaded images
      const mockAspectRatio = Math.random() * 2 + 0.5 // Random aspect ratio between 0.5 and 2.5
      let size = 'small'
      
      if (mockAspectRatio > 1.8) size = 'wide'
      else if (mockAspectRatio > 1.3) size = 'large'
      else if (mockAspectRatio < 0.8) size = 'medium'
      
      return {
        ...img,
        size,
        aspectRatio: mockAspectRatio
      }
    })
  }


  return (
    <main className="min-h-screen bg-[rgb(var(--bg))]">
      <div className="container-responsive pt-24 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12">
          <div className="flex-1">
            <h1 className="text-5xl sm:text-7xl font-bold text-[rgb(var(--fg))] uppercase tracking-wider mb-4">
              MY ARTWORKS
            </h1>
          </div>
          <div className="flex-1 lg:max-w-lg">
            <p className="text-[rgb(var(--muted))] text-lg leading-relaxed">
              A curated collection of wildlife and nature photography capturing the beauty and essence of the natural world through patient observation and artistic vision.
            </p>
          </div>
        </div>

        {galleryLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--primary))] mx-auto mb-4"></div>
              <p className="text-[rgb(var(--muted-fg))]">Loading gallery...</p>
            </div>
          </div>
        ) : shuffledArtworks.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-[rgb(var(--muted-fg))]">No images found in Firebase Storage</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[260px] mb-6 grid-flow-dense">
            {shuffledArtworks.map((art, i) => {
            const size = getBentoSize(art, i)
            const gridClasses = size === 'large' ? 'sm:col-span-2 lg:col-span-2 sm:row-span-2 lg:row-span-2' : 
                               size === 'wide' ? 'sm:col-span-2 lg:col-span-2 sm:row-span-1 lg:row-span-1' :
                               size === 'medium' ? 'sm:col-span-1 lg:col-span-1 sm:row-span-2 lg:row-span-2' : 
                               'sm:col-span-1 lg:col-span-1 sm:row-span-1 lg:row-span-1'
            
            return (
              <figure 
                key={art.id} 
                className={`group cursor-pointer ${gridClasses} rounded-xl overflow-hidden relative transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border border-[rgb(var(--muted))]/10 hover:border-[rgb(var(--primary))]/30`}
                onClick={() => setActive({ art, idx: 0 })}
              >
                <div className="w-full h-full relative overflow-hidden">
                  {art.composite ? (
                    // Composite item: single image in square format
                    <img
                      src={art.images[0]}
                      alt={art.title || ''}
                      className="w-full h-full object-contain bg-black transition-transform duration-700 group-hover:scale-110"
                      onLoad={(e) => {
                        const { naturalWidth, naturalHeight } = e.target
                        handleImageLoad(art.id, naturalWidth, naturalHeight)
                      }}
                    />
                  ) : (
                    // Single image - smart scaling based on grid size and image aspect ratio
                <img
                  src={art.images[0]}
                  alt={art.title || ''}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      style={{
                        transform: (() => {
                          const dimensions = imageDimensions[art.id]
                          if (!dimensions) return 'scale(1)'
                          
                          const { aspectRatio } = dimensions
                          const size = getBentoSize(art, i)
                          
                          // Calculate grid cell dimensions
                          let gridWidth, gridHeight
                          if (size === 'small') {
                            gridWidth = 280; gridHeight = 260
                          } else if (size === 'medium') {
                            gridWidth = 280; gridHeight = 520 // 2 rows
                          } else if (size === 'large') {
                            gridWidth = 560; gridHeight = 520 // 2 cols, 2 rows
                          } else {
                            gridWidth = 560; gridHeight = 260 // wide: 2 cols, 1 row
                          }
                          
                          const gridRatio = gridWidth / gridHeight
                          
                          // Smart scaling to minimize hidden edges
                          if (aspectRatio > gridRatio) {
                            // Image is wider than grid - scale down slightly to show more height
                            return 'scale(0.95)'
                          } else {
                            // Image is taller than grid - scale down slightly to show more width
                            return 'scale(0.95)'
                          }
                        })()
                      }}
                      onLoad={(e) => {
                        const { naturalWidth, naturalHeight } = e.target
                        handleImageLoad(art.id, naturalWidth, naturalHeight)
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 left-3 right-3 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="inline-flex items-center gap-2 bg-black/35 backdrop-blur-[2px] rounded-md px-2 py-1 max-w-[90%]">
                      <div className="text-[10px] font-mono tracking-widest text-white/80">
                        {String(i + 1).padStart(2, '0')}/
                      </div>
                      <div className="text-xs font-medium leading-snug uppercase tracking-wide text-white truncate">
                        {art.title}
                      </div>
                    </div>
                  </div>
                  {!loadedImages.has(art.id) && (
                    <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
                </div>
              </figure>
            )
          })}
          </div>
        )}

        {/* Gallery Statistics */}
        <div className="text-center mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div className="bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-[rgb(var(--fg))] mb-2">
                {shuffledArtworks.length}
              </div>
              <div className="text-[rgb(var(--muted))] text-sm uppercase tracking-wide">
                Total Artworks
              </div>
            </div>
            <div className="bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-[rgb(var(--fg))] mb-2">
                2024
              </div>
              <div className="text-[rgb(var(--muted))] text-sm uppercase tracking-wide">
                Latest Collection
              </div>
            </div>
            <div className="bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-[rgb(var(--fg))] mb-2">
                Wildlife
              </div>
              <div className="text-[rgb(var(--muted))] text-sm uppercase tracking-wide">
                Primary Focus
              </div>
            </div>
          </div>
          
          <button className="inline-flex items-center gap-3 bg-[rgb(var(--primary))] text-white px-8 py-4 rounded-full font-semibold text-sm uppercase tracking-wider hover:bg-[rgb(var(--primary))]/80 transition-colors duration-300">
            VIEW FULL COLLECTION
            <ArrowRight size={16} className="rotate-45" />
          </button>
      </div>

      {active && (
        <ModalViewer active={active} setActive={setActive} />
      )}
      </div>
    </main>
  )
}

function ModalViewer({ active, setActive }) {
  const activeRef = useRef(active)
  useEffect(() => { activeRef.current = active }, [active])
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      const a = activeRef.current
      if (e.key === 'Escape') setActive(null)
      if (!a?.art?.images) return
      if (e.key === 'ArrowLeft') setActive({ art: a.art, idx: (a.idx - 1 + a.art.images.length) % a.art.images.length })
      if (e.key === 'ArrowRight') setActive({ art: a.art, idx: (a.idx + 1) % a.art.images.length })
    }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [setActive])

  const [visible, setVisible] = useState(true)
  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 20)
    return () => clearTimeout(t)
  }, [active.idx])

  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const [isFs, setIsFs] = useState(false)
  useEffect(() => {
    const onFsChange = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md" onClick={() => setActive(null)} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50" role="dialog" aria-modal="true">
        <div ref={containerRef} className="w-[88vw] sm:w-[80vw] max-w-5xl max-h-[85dvh] relative flex flex-col gap-3 sm:gap-4">
          <div ref={viewerRef} className="relative flex min-h-0 flex-col rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10">
            {/* Controls inside image area */}
            <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
              <button className="p-2 rounded-full bg-black/60 text-white hover:bg-black/70 transition-colors shadow ring-1 ring-white/20" onClick={toggleFullscreen} aria-label="Toggle fullscreen">
                {isFs ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button className="p-2 rounded-full bg-black/60 text-white hover:bg-black/70 transition-colors shadow ring-1 ring-white/20" onClick={() => setActive(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="relative flex-1 min-h-0">
              <img src={active.art.images[active.idx]} alt={active.art.title || ''} className={`w-full h-full max-h-[72dvh] object-contain transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}/>
            </div>
            {(active.art.title || active.art.desc) && (
              <div className="px-4 sm:px-6 mt-3">
                <div className="inline-block backdrop-blur-md bg-white/90 text-slate-900 rounded-lg shadow ring-1 ring-black/10 px-4 py-2 max-w-md">
                  <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">Photograph</div>
                  <div className="mt-1 text-base sm:text-lg font-semibold leading-snug">{active.art.title || 'Untitled'}</div>
                  {active.art.desc && <div className="mt-1 text-sm opacity-80">{active.art.desc}</div>}
                </div>
              </div>
            )}
            {active.art.images.length > 1 && (
              <div className="p-2 flex items-center justify-center">
                <div className="flex gap-2 overflow-x-auto px-3 py-2 bg-black/40 rounded-full backdrop-blur-md ring-1 ring-white/10 max-w-[95%]">
                  {active.art.images.map((src, i) => (
                    <button key={i} className={`relative group rounded-md overflow-hidden ring-1 ${i === active.idx ? 'ring-white' : 'ring-white/30'} transition-transform`} onClick={() => setActive({ art: active.art, idx: i })}>
                      <img src={src} alt="thumbnail" className={`h-10 w-14 object-cover ${i === active.idx ? '' : 'opacity-80 group-hover:opacity-100'}`} />
                      {i === active.idx && <span className="absolute inset-0 ring-2 ring-white rounded-md pointer-events-none" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {active.art.images.length > 1 && (
              <>
                <button aria-label="Previous" className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-white hover:bg-black/80 transition-colors shadow ring-1 ring-white/20" onClick={() => setActive({ art: active.art, idx: (active.idx - 1 + active.art.images.length) % active.art.images.length })}>
                  <ChevronLeft size={18} />
                </button>
                <button aria-label="Next" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-white hover:bg-black/80 transition-colors shadow ring-1 ring-white/20" onClick={() => setActive({ art: active.art, idx: (active.idx + 1) % active.art.images.length })}>
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}



import { useEffect, useState, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, ArrowRight, Search } from 'lucide-react'
import { getGalleryImages, searchGalleryImages } from '../firebase/api'

export default function Gallery() {
  const [active, setActive] = useState(null) // { art, idx }
  const [imageDimensions, setImageDimensions] = useState({})
  const [loadedImages, setLoadedImages] = useState(new Set())
  const [firebaseImages, setFirebaseImages] = useState([])
  const [artworks, setArtworks] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  
  // Search state
  const [isSearching, setIsSearching] = useState(false)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searchPage, setSearchPage] = useState(1)
  const [searchHasMore, setSearchHasMore] = useState(false)

  // Debounce search input
  useEffect(() => {
    if (query.trim()) {
      setIsDebouncing(true);
    } else {
      setIsDebouncing(false);
      setIsSearching(false);
      setSearchResults([]);
      setSearchPage(1);
      setSearchHasMore(false);
    }
    
    const handle = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setIsDebouncing(false);
    }, 300)
    return () => clearTimeout(handle)
  }, [query])

  // Handle search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery, 1);
    } else {
      setIsSearching(false);
      setSearchResults([]);
      setSearchPage(1);
      setSearchHasMore(false);
    }
  }, [debouncedQuery]);

  // Clean up old search cache on component mount
  useEffect(() => {
    const cleanupSearchCache = () => {
      const now = Date.now();
      const cacheExpiry = 30 * 60 * 1000; // 30 minutes
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('gallery-search-')) {
          try {
            const cached = JSON.parse(sessionStorage.getItem(key));
            if (cached.timestamp && (now - cached.timestamp) > cacheExpiry) {
              sessionStorage.removeItem(key);
            }
          } catch (e) {
            // Remove invalid cache entries
            sessionStorage.removeItem(key);
          }
        }
      }
    };
    
    cleanupSearchCache();
  }, []);

  // Search function with caching
  const performSearch = async (searchQuery, page = 1) => {
    setIsSearching(true);
    try {
      // Check cache for search results
      const cacheKey = `search-${searchQuery}-${page}`;
      const cachedResults = sessionStorage.getItem(`gallery-search-${cacheKey}`);
      
      if (cachedResults) {
        const parsedResults = JSON.parse(cachedResults);
        if (page === 1) {
          setSearchResults(parsedResults.images);
        } else {
          setSearchResults(prev => [...prev, ...parsedResults.images]);
        }
        setSearchPage(page);
        setSearchHasMore(parsedResults.pagination?.hasMore || false);
        setIsSearching(false);
        return;
      }

      const result = await searchGalleryImages('gallery', searchQuery, page, 20);
      if (result.success) {
        const shuffled = shuffleArray(result.images);
        
        // Cache search results
        const cacheData = {
          images: shuffled,
          pagination: result.pagination,
          timestamp: Date.now()
        };
        sessionStorage.setItem(`gallery-search-${cacheKey}`, JSON.stringify(cacheData));
        
        if (page === 1) {
          setSearchResults(shuffled);
        } else {
          setSearchResults(prev => [...prev, ...shuffled]);
        }
        setSearchPage(page);
        setSearchHasMore(result.pagination?.hasMore || false);
      }
    } catch (error) {
      console.error('Error searching images:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
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
  
  // Load initial 20 images from Firebase Storage with enhanced caching
  useEffect(() => {
    let isMounted = true // Prevent state updates if component unmounts
    
    const loadInitialImages = async () => {
      try {
        // Check if we already have artworks loaded (prevent duplicate calls)
        if (artworks.length > 0) {
          setGalleryLoading(false)
          return
        }

        // 1. Check sessionStorage first (fastest)
        const sessionCache = sessionStorage.getItem('gallery-artwork-session')
        const sessionPage = sessionStorage.getItem('gallery-artwork-page')
        if (sessionCache) {
          try {
            const parsedArtworks = JSON.parse(sessionCache)
            if (parsedArtworks && Array.isArray(parsedArtworks) && parsedArtworks.length > 0) {
              if (isMounted) {
                setArtworks(parsedArtworks)
                setCurrentPage(parseInt(sessionPage) || 1)
                setHasMore(true) // Assume more available for pagination
                setTotalCount(parsedArtworks.length)
                setGalleryLoading(false)
                console.log(`Restored ${parsedArtworks.length} images from session cache (page ${parseInt(sessionPage) || 1})`)
              }
              return
            }
          } catch (e) {
            console.warn('Invalid session cache, clearing...')
            sessionStorage.removeItem('gallery-artwork-session')
            sessionStorage.removeItem('gallery-artwork-page')
          }
        }

        // 2. Check localStorage cache (persistent)
        const cachedArtworks = localStorage.getItem('gallery-artwork-cache')
        const cacheTimestamp = localStorage.getItem('gallery-artwork-cache-timestamp')
        const cachedPage = localStorage.getItem('gallery-artwork-page')
        const now = Date.now()
        const cacheExpiry = 7 * 24 * 60 * 60 * 1000 // 7 days

        if (cachedArtworks && cacheTimestamp && (now - parseInt(cacheTimestamp)) < cacheExpiry) {
          try {
            const parsedArtworks = JSON.parse(cachedArtworks)
            if (parsedArtworks && Array.isArray(parsedArtworks) && parsedArtworks.length > 0) {
              if (isMounted) {
                setArtworks(parsedArtworks)
                setCurrentPage(parseInt(cachedPage) || 1)
                setHasMore(true) // Assume more available for pagination
                setTotalCount(parsedArtworks.length)
                // Also store in sessionStorage for faster subsequent loads
                sessionStorage.setItem('gallery-artwork-session', cachedArtworks)
                sessionStorage.setItem('gallery-artwork-page', cachedPage || '1')
                setGalleryLoading(false)
                console.log(`Restored ${parsedArtworks.length} images from localStorage cache (page ${parseInt(cachedPage) || 1})`)
              }
              return
            }
          } catch (e) {
            console.warn('Invalid localStorage cache, clearing...')
            localStorage.removeItem('gallery-artwork-cache')
            localStorage.removeItem('gallery-artwork-cache-timestamp')
            localStorage.removeItem('gallery-artwork-page')
          }
        }

        // 3. Check for existing shuffled order
        const existingOrder = localStorage.getItem('gallery-artwork-order')
        if (existingOrder) {
          try {
            const parsedOrder = JSON.parse(existingOrder)
            if (parsedOrder && Array.isArray(parsedOrder) && parsedOrder.length > 0) {
              if (isMounted) {
                setArtworks(parsedOrder)
                setCurrentPage(1)
                setHasMore(true) // Assume more available for pagination
                setTotalCount(parsedOrder.length)
                setGalleryLoading(false)
              }
              return
            }
          } catch (e) {
            console.warn('Invalid order cache, clearing...')
            localStorage.removeItem('gallery-artwork-order')
          }
        }

        // 4. Fetch fresh data from Firebase Functions API (paginated!)
        console.log('No valid cache found, fetching from Firebase Functions...')
        const result = await getGalleryImages('gallery', 1, 20);
        if (result.success) {
          // Images are already processed and grouped by the backend
          const shuffled = shuffleArray(result.images)
          
          // Store in all caches
          const artworksJson = JSON.stringify(shuffled)
          localStorage.setItem('gallery-artwork-order', artworksJson)
          localStorage.setItem('gallery-artwork-cache', artworksJson)
          localStorage.setItem('gallery-artwork-cache-timestamp', now.toString())
          localStorage.setItem('gallery-artwork-page', '1')
          sessionStorage.setItem('gallery-artwork-session', artworksJson)
          sessionStorage.setItem('gallery-artwork-page', '1')
          
          if (isMounted) {
            setArtworks(shuffled)
            setCurrentPage(1)
            setHasMore(result.pagination?.hasMore || false)
            setTotalCount(result.pagination?.totalCount || 0)
            setGalleryLoading(false)
          }
        } else {
          console.error('Failed to load Firebase images:', result.error)
          if (isMounted) {
            setGalleryLoading(false)
          }
        }
      } catch (error) {
        console.error('Error loading Firebase images:', error)
        if (isMounted) {
          setGalleryLoading(false)
        }
      }
    };
    loadInitialImages();
    
    // Cleanup function
    return () => {
      isMounted = false
    }
  }, []); // Empty dependency array to prevent re-runs
  
  // Load more images function for infinite scroll with caching
  const loadMoreImages = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      console.log(`Loading page ${nextPage} with 20 images...`);
      const result = await getGalleryImages('gallery', nextPage, 20);
      
      if (result.success && result.images.length > 0) {
        const newShuffled = shuffleArray(result.images);
        
        // Update state with new images
        setArtworks(prev => {
          const updatedArtworks = [...prev, ...newShuffled];
          
          // Update all caches with the complete gallery state
          const artworksJson = JSON.stringify(updatedArtworks);
          const now = Date.now();
          
          // Update all cache layers
          sessionStorage.setItem('gallery-artwork-session', artworksJson);
          sessionStorage.setItem('gallery-artwork-page', nextPage.toString());
          localStorage.setItem('gallery-artwork-cache', artworksJson);
          localStorage.setItem('gallery-artwork-cache-timestamp', now.toString());
          localStorage.setItem('gallery-artwork-page', nextPage.toString());
          localStorage.setItem('gallery-artwork-order', artworksJson);
          
          console.log(`Updated cache with ${updatedArtworks.length} total images`);
          return updatedArtworks;
        });
        
        setCurrentPage(nextPage);
        setHasMore(result.pagination?.hasMore || false);
        console.log(`Loaded ${result.images.length} more images. Total: ${artworks.length + result.images.length}`);
      } else {
        console.log('No more images to load');
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more images:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Infinite scroll effect - trigger when statistics section comes into view
  useEffect(() => {
    // Only proceed if we have images loaded and more are available
    if (artworks.length === 0 || (!hasMore && !searchHasMore)) {
      return;
    }

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (debouncedQuery.trim()) {
            // Load more search results
            if (searchHasMore && !isSearching && !isDebouncing) {
              console.log('Statistics section visible - loading more search results...');
              performSearch(debouncedQuery, searchPage + 1);
            }
          } else {
            // Load more regular images - only if we have more pages and not currently loading
            if (hasMore && !loadingMore) {
              console.log('Statistics section visible - loading more images...');
              loadMoreImages();
            }
          }
        }
      });
    };

    // Create intersection observer to watch for statistics section
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '100px', // Trigger when section is 100px away from viewport
      threshold: 0.1 // Trigger when 10% of the section is visible
    });

    // Find the statistics section element
    const statisticsSection = document.querySelector('[data-gallery-stats]');
    if (statisticsSection) {
      observer.observe(statisticsSection);
    }

    return () => {
      if (statisticsSection) {
        observer.unobserve(statisticsSection);
      }
      observer.disconnect();
    };
  }, [currentPage, hasMore, loadingMore, debouncedQuery, searchHasMore, isSearching, searchPage, isDebouncing, artworks.length]);
  
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
  
  // Use search results if searching, otherwise use regular artworks
  const displayedArtworks = debouncedQuery.trim() ? searchResults : shuffledArtworks;
  
  // Deduplicate artworks based on unique identifier (src or images[0])
  const deduplicatedArtworks = displayedArtworks.filter((art, index, array) => {
    const uniqueKey = art.src || (art.images && art.images[0]) || art.id;
    return array.findIndex(item => 
      (item.src || (item.images && item.images[0]) || item.id) === uniqueKey
    ) === index;
  });
    
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
    <main className="min-h-screen bg-[rgb(var(--bg))] transition-colors duration-300">
      <div className="container-responsive pt-24 pb-8">
        <div className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 transition-colors duration-300">Feature Portfolio</div>
              <h1 className="font-extrabold text-[rgb(var(--fg))] uppercase leading-[0.9] transition-colors duration-300">
                <span className="block text-5xl sm:text-6xl md:text-7xl">Wildlife</span>
                <span className="block text-4xl sm:text-5xl md:text-6xl opacity-90">Through My Lens</span>
              </h1>
              <div className="mt-3 pt-3 border-t border-[rgb(var(--muted))]/20 transition-colors duration-300">
                <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] transition-colors duration-300">
                  Field Notes & Wild Encounters
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 lg:self-end">
              <p className="text-[rgb(var(--muted))] text-base sm:text-lg leading-relaxed lg:border-l lg:border-[rgb(var(--muted))]/20 lg:pl-5 transition-colors duration-300">
                A curated collection of wildlife and nature photography capturing the beauty and essence of the natural world through patient observation and artistic vision.
              </p>
            </div>
          </div>
          <div className="mt-6 h-px w-full bg-[rgb(var(--muted))]/20 transition-colors duration-300" />
        </div>

        {/* Search and description row */}
        <div className="mb-8 flex items-center justify-center">
          <div className="w-full max-w-3xl">
            <label htmlFor="gallery-search" className="sr-only">Search artworks</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search size={18} className="text-[rgb(var(--muted))] transition-colors duration-300" />
              </div>
              <input
                id="gallery-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full rounded-full bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 pl-12 pr-5 py-3 text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] shadow-sm focus:outline-none focus:ring-4 focus:ring-[rgb(var(--primary))]/25 hover:border-[rgb(var(--muted))]/40 transition-colors duration-300"
              />
            </div>
            {debouncedQuery && (
              <div className="mt-2 text-center text-sm text-[rgb(var(--muted))] transition-colors duration-300">
                Showing {deduplicatedArtworks.length} of {shuffledArtworks.length}
              </div>
            )}
          </div>
        </div>

        {galleryLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[320px] mb-6 grid-flow-dense">
            {[
              'large','small','medium','wide','small','large','small','medium','small','wide','small','medium'
            ].map((size, i) => {
              const gridClasses = size === 'large' ? 'sm:col-span-2 lg:col-span-2 sm:row-span-2 lg:row-span-2' :
                                   size === 'wide' ? 'sm:col-span-2 lg:col-span-2 sm:row-span-1 lg:row-span-1' :
                                   size === 'medium' ? 'sm:col-span-1 lg:col-span-1 sm:row-span-2 lg:row-span-2' :
                                   'sm:col-span-1 lg:col-span-1 sm:row-span-1 lg:row-span-1'
              return (
                <div key={i} className={`${gridClasses} rounded-xl overflow-hidden relative border border-[rgb(var(--muted))]/10`}>
                  <div className="absolute inset-0 animate-pulse bg-[rgb(var(--muted))]/20" />
                </div>
              )
            })}
          </div>
        ) : shuffledArtworks.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-[rgb(var(--muted-fg))] transition-colors duration-300">No images found in Firebase Storage</p>
            </div>
          </div>
        ) : debouncedQuery && deduplicatedArtworks.length === 0 && !isSearching ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-[rgb(var(--muted-fg))] transition-colors duration-300">No results for "{debouncedQuery}"</p>
            </div>
          </div>
        ) : (isSearching || isDebouncing) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[320px] mb-6 grid-flow-dense">
            {[
              'large','small','medium','wide','small','large','small','medium','small','wide','small','medium'
            ].map((size, i) => {
              const gridClasses = size === 'large' ? 'sm:col-span-2 lg:col-span-2 sm:row-span-2 lg:row-span-2' :
                                   size === 'wide' ? 'sm:col-span-2 lg:col-span-2 sm:row-span-1 lg:row-span-1' :
                                   size === 'medium' ? 'sm:col-span-1 lg:col-span-1 sm:row-span-2 lg:row-span-2' :
                                   'sm:col-span-1 lg:col-span-1 sm:row-span-1 lg:row-span-1'
              return (
                <div key={i} className={`${gridClasses} rounded-xl overflow-hidden relative border border-[rgb(var(--muted))]/10`}>
                  <div className="absolute inset-0 animate-pulse bg-[rgb(var(--muted))]/20" />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[320px] mb-6 grid-flow-dense">
            {deduplicatedArtworks.map((art, i) => {
            const size = getBentoSize(art, i)
            const gridClasses = size === 'large' ? 'sm:col-span-2 lg:col-span-2 sm:row-span-2 lg:row-span-2' : 
                               size === 'wide' ? 'sm:col-span-2 lg:col-span-2 sm:row-span-1 lg:row-span-1' :
                               size === 'medium' ? 'sm:col-span-1 lg:col-span-1 sm:row-span-2 lg:row-span-2' : 
                               'sm:col-span-1 lg:col-span-1 sm:row-span-1 lg:row-span-1'
          
            // Defensive: skip items without an image
            const firstImage = Array.isArray(art.images) && art.images.length > 0
              ? art.images[0]
              : (typeof art.src === 'string' ? art.src : null)

            if (!firstImage) {
              return null
            }

            // Create a unique key combining multiple identifiers
            const uniqueKey = `${art.id || 'unknown'}-${i}-${art.src || (art.images && art.images[0]) || 'no-image'}`.replace(/[^a-zA-Z0-9-_]/g, '-');

            return (
              <figure 
                key={uniqueKey} 
                className={`group cursor-pointer ${gridClasses} rounded-xl overflow-hidden relative transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border border-[rgb(var(--muted))]/10 hover:border-[rgb(var(--primary))]/30`}
                onClick={() => setActive({ art, idx: 0 })}
              >
                <div className="w-full h-full relative overflow-hidden">
                  {art.composite ? (
                    // Composite item: single image in square format
                    <img
                      src={firstImage}
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
                  src={firstImage}
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
                            gridWidth = 280; gridHeight = 320
                          } else if (size === 'medium') {
                            gridWidth = 280; gridHeight = 640 // 2 rows
                          } else if (size === 'large') {
                            gridWidth = 560; gridHeight = 640 // 2 cols, 2 rows
                          } else {
                            gridWidth = 560; gridHeight = 320 // wide: 2 cols, 1 row
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
        <div className="text-center mb-12" data-gallery-stats>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div className="bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/20 rounded-xl p-6 transition-colors duration-300">
              <div className="text-3xl font-bold text-[rgb(var(--fg))] mb-2 transition-colors duration-300">
                {shuffledArtworks.length}
              </div>
              <div className="text-[rgb(var(--muted))] text-sm uppercase tracking-wide transition-colors duration-300">
                Total Photographs
              </div>
            </div>
            <div className="bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/20 rounded-xl p-6 transition-colors duration-300">
              <div className="text-3xl font-bold text-[rgb(var(--fg))] mb-2 transition-colors duration-300">
                2024
              </div>
              <div className="text-[rgb(var(--muted))] text-sm uppercase tracking-wide transition-colors duration-300">
                Latest Collection
              </div>
            </div>
            <div className="bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/20 rounded-xl p-6 transition-colors duration-300">
              <div className="text-3xl font-bold text-[rgb(var(--fg))] mb-2 transition-colors duration-300">
                Wildlife
              </div>
              <div className="text-[rgb(var(--muted))] text-sm uppercase tracking-wide transition-colors duration-300">
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
  // Early return if active is null or invalid
  if (!active || !active.art) {
    return null
  }

  const activeRef = useRef(active)
  useEffect(() => { activeRef.current = active }, [active])
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      const a = activeRef.current
      if (e.key === 'Escape') setActive(null)
      if (!a?.art?.images || !Array.isArray(a.art.images) || a.art.images.length === 0) return
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

  // Get the current image source safely
  const getCurrentImageSrc = () => {
    if (!active.art.images || !Array.isArray(active.art.images) || active.art.images.length === 0) {
      // Fallback to single image if available
      return active.art.src || active.art.image || null
    }
    return active.art.images[active.idx] || null
  }

  const currentImageSrc = getCurrentImageSrc()
  const hasMultipleImages = active.art.images && Array.isArray(active.art.images) && active.art.images.length > 1

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
              {currentImageSrc ? (
                <img src={currentImageSrc} alt={active.art.title || ''} className={`w-full h-full max-h-[72dvh] object-contain transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}/>
              ) : (
                <div className="w-full h-full max-h-[72dvh] flex items-center justify-center bg-gray-800 text-white">
                  <div className="text-center">
                    <div className="text-lg font-semibold mb-2">Image not available</div>
                    <div className="text-sm opacity-70">Unable to load image</div>
                  </div>
                </div>
              )}
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
            {hasMultipleImages && (
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
            {hasMultipleImages && (
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
        
        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary))]"></div>
            <span className="ml-3 text-[rgb(var(--muted-fg))] transition-colors duration-300">Loading more images...</span>
          </div>
        )}
        
        {/* End of gallery indicator */}
        {!hasMore && artworks.length > 0 && !loadingMore && (
          <div className="flex justify-center items-center py-8">
            <span className="text-[rgb(var(--muted-fg))] text-sm transition-colors duration-300">You've reached the end of the gallery</span>
          </div>
        )}
      </div>
    </>
  )
}



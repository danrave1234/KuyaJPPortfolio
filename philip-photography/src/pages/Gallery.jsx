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
      <div className="container-responsive pt-20 sm:pt-24 md:pt-20 lg:pt-24 pb-6 sm:pb-8">
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <div className="lg:col-span-7">
              <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-2 sm:mb-3 transition-colors duration-300">Feature Portfolio</div>
              <h1 className="font-extrabold text-[rgb(var(--fg))] uppercase leading-[0.9] transition-colors duration-300">
                <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">Wildlife</span>
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl opacity-90">Through My Lens</span>
              </h1>
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[rgb(var(--muted))]/20 transition-colors duration-300">
                <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] transition-colors duration-300">
                  Field Notes & Wild Encounters
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 lg:self-end">
              <p className="text-[rgb(var(--muted))] text-sm sm:text-base md:text-lg leading-relaxed lg:border-l lg:border-[rgb(var(--muted))]/20 lg:pl-5 transition-colors duration-300">
                A curated collection of wildlife and nature photography capturing the beauty and essence of the natural world through patient observation and artistic vision.
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 h-px w-full bg-[rgb(var(--muted))]/20 transition-colors duration-300" />
        </div>

        {/* Search and description row */}
        <div className="mb-8 flex items-center justify-center">
          <div className="w-full max-w-3xl">
            <label htmlFor="gallery-search" className="sr-only">Search artworks</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
                <Search size={16} className="sm:w-[18px] sm:h-[18px] text-[rgb(var(--muted))] transition-colors duration-300" />
              </div>
              <input
                id="gallery-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full rounded-full bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 pl-10 sm:pl-12 pr-4 sm:pr-5 py-2 sm:py-3 text-sm sm:text-base text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] shadow-sm focus:outline-none focus:ring-4 focus:ring-[rgb(var(--primary))]/25 hover:border-[rgb(var(--muted))]/40 transition-colors duration-300"
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
          <div className="grid grid-cols-3 gap-3 auto-rows-[80px] sm:auto-rows-[100px] md:auto-rows-[120px] lg:auto-rows-[320px] mb-6 grid-flow-dense">
            {[
              'large','small','medium','wide','small','large','small','medium','small','wide','small','medium'
            ].map((size, i) => {
              const gridClasses = size === 'large' ? 'col-span-2 row-span-2' :
                                   size === 'wide' ? 'col-span-2 row-span-1' :
                                   size === 'medium' ? 'col-span-1 row-span-2' : 
                                   'col-span-1 row-span-1'
              return (
                <div key={i} className={`${gridClasses} rounded-lg overflow-hidden relative border border-[rgb(var(--muted))]/10`}>
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
          <div className="grid grid-cols-3 gap-3 auto-rows-[80px] sm:auto-rows-[100px] md:auto-rows-[120px] lg:auto-rows-[320px] mb-6 grid-flow-dense">
            {[
              'large','small','medium','wide','small','large','small','medium','small','wide','small','medium'
            ].map((size, i) => {
              const gridClasses = size === 'large' ? 'col-span-2 row-span-2' :
                                   size === 'wide' ? 'col-span-2 row-span-1' :
                                   size === 'medium' ? 'col-span-1 row-span-2' : 
                                   'col-span-1 row-span-1'
              return (
                <div key={i} className={`${gridClasses} rounded-lg overflow-hidden relative border border-[rgb(var(--muted))]/10`}>
                  <div className="absolute inset-0 animate-pulse bg-[rgb(var(--muted))]/20" />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 auto-rows-[80px] sm:auto-rows-[100px] md:auto-rows-[120px] lg:auto-rows-[320px] mb-6 grid-flow-dense">
            {deduplicatedArtworks.map((art, i) => {
            const size = getBentoSize(art, i)
            const gridClasses = size === 'large' ? 'col-span-2 row-span-2' : 
                               size === 'wide' ? 'col-span-2 row-span-1' :
                               size === 'medium' ? 'col-span-1 row-span-2' : 
                               'col-span-1 row-span-1'
          
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
                className={`group cursor-pointer ${gridClasses} rounded-lg overflow-hidden relative transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border border-[rgb(var(--muted))]/10 hover:border-[rgb(var(--primary))]/30`}
                onClick={() => setActive({ art, idx: 0 })}
              >
                <div className="w-full h-full relative overflow-hidden">
                  {art.composite ? (
                    // Composite item: single image in square format
                    <img
                      src={firstImage}
                      alt={art.title || ''}
                      className="w-full h-full object-contain bg-black transition-transform duration-700 group-hover:scale-110 rounded-lg"
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
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 rounded-lg"
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

        {/* Gallery Statistics */}
        <div className="text-center mb-8 sm:mb-12" data-gallery-stats>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8">
            <div className="bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/20 rounded-md sm:rounded-lg p-3 sm:p-4 md:p-6 transition-colors duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[rgb(var(--fg))] mb-1 sm:mb-2 transition-colors duration-300">
                {shuffledArtworks.length}
              </div>
              <div className="text-[rgb(var(--muted))] text-xs sm:text-sm uppercase tracking-wide transition-colors duration-300">
                Total Photographs
              </div>
            </div>
            <div className="bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/20 rounded-md sm:rounded-lg p-3 sm:p-4 md:p-6 transition-colors duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[rgb(var(--fg))] mb-1 sm:mb-2 transition-colors duration-300">
                2024
              </div>
              <div className="text-[rgb(var(--muted))] text-xs sm:text-sm uppercase tracking-wide transition-colors duration-300">
                Latest Collection
              </div>
            </div>
            <div className="bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/20 rounded-md sm:rounded-lg p-3 sm:p-4 md:p-6 transition-colors duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[rgb(var(--fg))] mb-1 sm:mb-2 transition-colors duration-300">
                Wildlife
              </div>
              <div className="text-[rgb(var(--muted))] text-xs sm:text-sm uppercase tracking-wide transition-colors duration-300">
                Primary Focus
              </div>
            </div>
          </div>
          
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
    
    // Keyboard navigation
    const onKey = (e) => {
      const a = activeRef.current
      if (e.key === 'Escape') setActive(null)
      if (!a?.art?.images || !Array.isArray(a.art.images) || a.art.images.length === 0) return
      if (e.key === 'ArrowLeft') setActive({ art: a.art, idx: (a.idx - 1 + (a.art.images?.length || 1)) % (a.art.images?.length || 1) })
      if (e.key === 'ArrowRight') setActive({ art: a.art, idx: (a.idx + 1) % (a.art.images?.length || 1) })
    }
    
    // Touch gesture handling for mobile
    let touchStartX = 0
    let touchStartY = 0
    
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    }
    
    const handleTouchEnd = (e) => {
      const a = activeRef.current
      if (!a?.art?.images || !Array.isArray(a.art.images) || a.art.images.length === 0) return
      
      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const deltaX = touchStartX - touchEndX
      const deltaY = touchStartY - touchEndY
      
      // Only handle horizontal swipes (ignore vertical scrolling)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // Swipe left - next image
          setActive({ art: a.art, idx: (a.idx + 1) % (a.art.images?.length || 1) })
        } else {
          // Swipe right - previous image
          setActive({ art: a.art, idx: (a.idx - 1 + (a.art.images?.length || 1)) % (a.art.images?.length || 1) })
        }
      }
    }
    
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => { 
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
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
      {/* Enhanced backdrop with theme-aware blur */}
      <div 
        className="fixed inset-0 z-40 backdrop-blur-md transition-colors duration-300" 
        style={{
          background: 'linear-gradient(135deg, rgba(var(--bg), 0.95) 0%, rgba(var(--bg), 0.85) 50%, rgba(var(--bg), 0.95) 100%)'
        }}
        onClick={() => setActive(null)} 
      />
      
      {/* Main modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-8 overflow-y-auto" role="dialog" aria-modal="true">
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
                    {hasMultipleImages ? `Image ${active.idx + 1} of ${active.art.images?.length || 0}` : 'Single Image'}
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

                {/* Navigation arrows */}
                {hasMultipleImages && (
                  <>
                    <button 
                      aria-label="Previous image" 
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full backdrop-blur-sm hover:scale-110 transition-all duration-200 shadow-lg touch-manipulation" 
                      style={{ 
                        backgroundColor: 'rgba(var(--bg), 0.8)',
                        color: 'rgb(var(--fg))',
                        border: '1px solid rgba(var(--muted), 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(var(--bg), 0.9)'
                        e.target.style.borderColor = 'rgba(var(--muted), 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(var(--bg), 0.8)'
                        e.target.style.borderColor = 'rgba(var(--muted), 0.2)'
                      }}
                      onClick={() => setActive({ art: active.art, idx: (active.idx - 1 + (active.art.images?.length || 1)) % (active.art.images?.length || 1) })}
                    >
                      <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                    </button>
                    <button 
                      aria-label="Next image" 
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full backdrop-blur-sm hover:scale-110 transition-all duration-200 shadow-lg touch-manipulation" 
                      style={{ 
                        backgroundColor: 'rgba(var(--bg), 0.8)',
                        color: 'rgb(var(--fg))',
                        border: '1px solid rgba(var(--muted), 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(var(--bg), 0.9)'
                        e.target.style.borderColor = 'rgba(var(--muted), 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(var(--bg), 0.8)'
                        e.target.style.borderColor = 'rgba(var(--muted), 0.2)'
                      }}
                      onClick={() => setActive({ art: active.art, idx: (active.idx + 1) % (active.art.images?.length || 1) })}
                    >
                      <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  </>
                )}
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
                        {active.art.isSeries ? 'Photo Series' : 'Photograph'}
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

                    {/* Series info */}
                    {active.art.isSeries && (
                      <div 
                        className="mt-6 p-4 rounded-xl border transition-colors duration-300"
                        style={{
                          backgroundColor: 'rgba(var(--primary), 0.08)',
                          borderColor: 'rgba(var(--primary), 0.15)'
                        }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: 'rgb(var(--primary))' }}
                          ></div>
                          <span 
                            className="text-sm font-semibold transition-colors duration-300"
                            style={{ color: 'rgb(var(--primary))' }}
                          >
                            Series Collection
                          </span>
                        </div>
                        <p 
                          className="text-sm transition-colors duration-300 ml-6"
                          style={{ color: 'rgba(var(--primary), 0.9)' }}
                        >
                          Part {active.idx + 1} of {active.art.images?.length || 0} images
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Divider between title/description and details */}
                  <div 
                    className="w-full h-[2px] mb-4 sm:mb-6 bg-gray-300 dark:bg-gray-600 transition-colors duration-300"
                  ></div>

                  {/* Technical details */}
                  <div className="transition-colors duration-300">
                    <h3 
                      className="text-sm sm:text-base font-bold mb-4 sm:mb-5 uppercase tracking-wider transition-colors duration-300"
                      style={{ color: 'rgb(var(--fg))' }}
                    >
                      Technical Details
                    </h3>
                    <div className="space-y-0 text-sm sm:text-base">
                      <div className="flex justify-between items-center py-3 sm:py-3.5 px-0">
                        <span 
                          className="font-medium transition-colors duration-300"
                          style={{ color: 'rgba(var(--muted-fg), 0.8)' }}
                        >
                          Format
                        </span>
                        <span 
                          className="font-semibold transition-colors duration-300"
                          style={{ color: 'rgb(var(--fg))' }}
                        >
                          Digital
                        </span>
                      </div>
                      <div 
                        className="w-full h-[1px] bg-gray-300 dark:bg-gray-600 transition-colors duration-300"
                      ></div>
                      <div className="flex justify-between items-center py-3 sm:py-3.5 px-0">
                        <span 
                          className="font-medium transition-colors duration-300"
                          style={{ color: 'rgba(var(--muted-fg), 0.8)' }}
                        >
                          Category
                        </span>
                        <span 
                          className="font-semibold transition-colors duration-300"
                          style={{ color: 'rgb(var(--fg))' }}
                        >
                          Wildlife Photography
                        </span>
                      </div>
                      <div 
                        className="w-full h-[1px] bg-gray-300 dark:bg-gray-600 transition-colors duration-300"
                      ></div>
                      <div className="flex justify-between items-center py-3 sm:py-3.5 px-0">
                        <span 
                          className="font-medium transition-colors duration-300"
                          style={{ color: 'rgba(var(--muted-fg), 0.8)' }}
                        >
                          Collection
                        </span>
                        <span 
                          className="font-semibold transition-colors duration-300"
                          style={{ color: 'rgb(var(--fg))' }}
                        >
                          2024 Portfolio
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thumbnail navigation */}
                {hasMultipleImages && (
                  <>
                    {/* Divider before thumbnails */}
                    <div 
                      className="w-full h-[2px] bg-gray-300 dark:bg-gray-600 transition-colors duration-300"
                    ></div>
                    <div 
                      className="p-4 sm:p-6 transition-colors duration-300"
                      style={{ 
                        backgroundColor: 'rgba(var(--muted), 0.05)'
                      }}
                    >
                    <h3 
                      className="text-sm sm:text-base font-bold mb-3 sm:mb-4 uppercase tracking-wider transition-colors duration-300"
                      style={{ color: 'rgb(var(--fg))' }}
                    >
                      Gallery Navigation
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-1.5 sm:gap-2">
                      {active.art.images.map((src, i) => (
                        <button 
                          key={i} 
                          className={`relative group rounded-lg overflow-hidden transition-all duration-200 touch-manipulation ${
                            i === active.idx 
                              ? 'scale-105 shadow-lg' 
                              : 'hover:scale-105 shadow-md hover:shadow-lg active:scale-95'
                          }`} 
                          style={{ 
                            border: i === active.idx ? '2px solid rgb(var(--primary))' : '2px solid transparent'
                          }}
                          onClick={() => setActive({ art: active.art, idx: i })}
                        >
                          <img 
                            src={src} 
                            alt={`${active.art.title} - Part ${i + 1}`} 
                            className={`w-full h-16 sm:h-20 object-cover transition-opacity duration-200 ${
                              i === active.idx ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
                            }`} 
                          />
                          {i === active.idx && (
                            <div 
                              className="absolute inset-0 pointer-events-none transition-colors duration-300"
                              style={{ backgroundColor: 'rgba(var(--primary), 0.2)' }}
                            />
                          )}
                          <div 
                            className="absolute bottom-1 right-1 text-white text-xs px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-mono transition-colors duration-300"
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                          >
                            {i + 1}
                          </div>
                        </button>
                      ))}
                    </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}



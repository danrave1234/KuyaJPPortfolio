import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, ArrowRight, Search, Heart, Filter } from 'lucide-react'
import { getGalleryImages, searchGalleryImages } from '../firebase/api'
import { analytics } from '../firebase/config'
import { logEvent } from 'firebase/analytics'
import { trackImageView, trackGalleryNavigation } from '../services/analytics'
import SEO from '../components/SEO'
import { generateSlug, extractIdFromSlug } from '../utils/slugify'

// Simple cache restoration function
const getCachedArtworks = () => {
  try {
    // Check localStorage cache first
    const cachedArtworks = localStorage.getItem('gallery-artwork-cache')
    const cacheTimestamp = localStorage.getItem('gallery-artwork-cache-timestamp')
    const cachedPage = localStorage.getItem('gallery-artwork-page')
    const cachedDimensions = localStorage.getItem('gallery-artwork-dimensions')
    const now = Date.now()
    const cacheExpiry = 7 * 24 * 60 * 60 * 1000 // 7 days

    if (cachedArtworks && cacheTimestamp && (now - parseInt(cacheTimestamp)) < cacheExpiry) {
      const parsedArtworks = JSON.parse(cachedArtworks)
      const parsedPage = cachedPage ? parseInt(cachedPage, 10) : 1
      const parsedDimensions = cachedDimensions ? JSON.parse(cachedDimensions) : null
      if (parsedArtworks && Array.isArray(parsedArtworks) && parsedArtworks.length > 0) {
        console.log(`✅ Found cache with ${parsedArtworks.length} images (page ${parsedPage})${parsedDimensions ? ' with dimensions' : ''}`)
        return {
          artworks: parsedArtworks,
          page: parsedPage,
          hasMore: true,
          totalCount: parsedArtworks.length,
          dimensions: parsedDimensions,
          fromCache: 'localStorage'
        }
      }
    }

    // Check sessionStorage as backup
    const sessionCache = sessionStorage.getItem('gallery-artwork-session')
    const sessionPage = sessionStorage.getItem('gallery-artwork-page')
    const sessionDimensions = sessionStorage.getItem('gallery-artwork-dimensions')
    if (sessionCache) {
      const parsedArtworks = JSON.parse(sessionCache)
      const parsedPage = sessionPage ? parseInt(sessionPage, 10) : 1
      const parsedDimensions = sessionDimensions ? JSON.parse(sessionDimensions) : null
      if (parsedArtworks && Array.isArray(parsedArtworks) && parsedArtworks.length > 0) {
        console.log(`✅ Found session cache with ${parsedArtworks.length} images (page ${parsedPage})${parsedDimensions ? ' with dimensions' : ''}`)
        return {
          artworks: parsedArtworks,
          page: parsedPage,
          hasMore: true,
          totalCount: parsedArtworks.length,
          dimensions: parsedDimensions,
          fromCache: 'session'
        }
      }
    }
  } catch (e) {
    console.warn('Error reading cache:', e)
  }
  return null
}

export default function Gallery() {
  const { imageSlug } = useParams()
  const navigate = useNavigate()
  
  // IMMEDIATE scroll restoration - before any rendering
  const savedScrollY = sessionStorage.getItem('gallery-scrollY')
  if (savedScrollY && !imageSlug) {
    const scrollPosition = parseInt(savedScrollY, 10)
    // Set scroll immediately - before React renders
    document.documentElement.style.scrollBehavior = 'auto'
    document.body.style.scrollBehavior = 'auto'
    document.documentElement.scrollTop = scrollPosition
    document.body.scrollTop = scrollPosition
    console.log('⚡ IMMEDIATE scroll set to:', scrollPosition)
  }
  
  // Disable browser's automatic scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto'
      }
    }
  }, [])
  
  const [active, setActive] = useState(null) // { art, idx }
  const [imageDimensions, setImageDimensions] = useState(() => {
    // Pre-load dimensions from cache if available
    try {
      const cachedDimensions = sessionStorage.getItem('gallery-artwork-dimensions') || 
                               localStorage.getItem('gallery-artwork-dimensions')
      if (cachedDimensions) {
        const parsed = JSON.parse(cachedDimensions)
        console.log('🎨 Pre-loaded dimensions for', Object.keys(parsed).length, 'images')
        return parsed
      }
    } catch (e) {
      console.warn('Failed to pre-load dimensions:', e)
    }
    return {}
  })
  const [loadedImages, setLoadedImages] = useState(new Set())
  const [firebaseImages, setFirebaseImages] = useState([])
  const [artworks, setArtworks] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  
  // Filter state
  const [sortFilter, setSortFilter] = useState('default') // 'default', 'most-liked'
  
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

  // Image lookup function to find image by slug
  const findImageBySlug = (slug, images) => {
    if (!slug || !images) return null;
    
    console.log('🔍 Finding image by slug:', slug);
    console.log('📷 Available images:', images.map(img => ({ 
      id: img.id, 
      title: img.title, 
      isSeries: img.isSeries,
      seriesIndex: img.seriesIndex,
      originalSeriesId: img.originalSeriesId 
    })));
    
    // Extract series number from the slug (e.g., "philippine-coucal-centropus-viridis-2" -> "2")
    const slugParts = slug.split('-');
    const lastPart = slugParts[slugParts.length - 1];
    const seriesNumber = /^\d+$/.test(lastPart) ? parseInt(lastPart) : 1;
    
    // First, try to find a series group
    const seriesGroup = images.find(img => {
      if (!img.isSeries) return false;
      
      // Generate slug for series (using series number 1 as base)
      const baseSlug = generateSlug(img.title, img.scientificName, '1');
      // Remove the series number from the base slug to match the series
      const seriesSlug = baseSlug.replace(/-1$/, '');
      const inputSeriesSlug = slug.replace(/-\d+$/, '');
      
      return seriesSlug === inputSeriesSlug;
    });
    
    if (seriesGroup && seriesGroup.images && seriesGroup.images.length > 0) {
      // Return the series group with the correct index
      const targetIndex = Math.min(seriesNumber - 1, seriesGroup.images.length - 1);
      console.log('✅ Found series group:', seriesGroup.title, 'at index:', targetIndex);
      return {
        ...seriesGroup,
        targetIndex: targetIndex
      };
    }
    
    // If no series found, look for single images (including separated series items)
    const singleImage = images.find(img => {
      // Generate slug for the image
      const imgSlug = generateSlug(img.title, img.scientificName, '1');
      console.log('🔍 Checking image:', img.title, 'generated slug:', imgSlug, 'target slug:', slug);
      return imgSlug === slug;
    });
    
    if (singleImage) {
      console.log('✅ Found single image:', singleImage.title);
      // Return the single image
      return {
        ...singleImage,
        targetIndex: 0
      };
    }
    
    console.log('❌ No image found for slug:', slug);
    return null;
  };

  // Handle image click with URL routing
  const handleImageClick = (art, idx = 0) => {
    // Save current scroll position
    const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0
    try {
      sessionStorage.setItem('gallery-scrollY', String(currentScroll))
      console.log('💾 Saved scroll position:', currentScroll)
    } catch {}
    
    // Extract series number from the image for clean URLs
    let seriesNumber = '1';
    if (art.isSeries && art.images && art.images[idx]) {
      seriesNumber = String(art.images[idx].seriesIndex || idx + 1);
    } else if (art.seriesNumber) {
      seriesNumber = String(art.seriesNumber);
    } else if (art.seriesIndex) {
      seriesNumber = String(art.seriesIndex);
    } else {
      // Extract from path/name if available
      const name = art.name || art.path?.split('/').pop() || '';
      const match = name.match(/_(\d+)\./);
      if (match) seriesNumber = match[1];
    }
    
    const slug = generateSlug(art.title, art.scientificName, seriesNumber);
    navigate(`/gallery/${slug}`, { replace: false, state: { scrollPosition: currentScroll } });
    setActive({ art, idx });
  };

  // Handle modal close with URL routing
  const handleModalClose = () => {
    // Save scroll position before closing so gallery restores where user left off
    let scrollY = 0
    try {
      scrollY = window.scrollY || 0
      sessionStorage.setItem('gallery-scrollY', String(scrollY))
    } catch {}
    setActive(null);
    navigate('/gallery', { replace: false, state: { restoreScroll: true, scrollPosition: scrollY } });
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (!imageSlug) {
        // Returning to /gallery: ensure we keep/restored scroll
        const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0
        try {
          sessionStorage.setItem('gallery-scrollY', String(currentScroll))
          console.log('💾 Saved scroll on popstate:', currentScroll)
        } catch {}
        setActive(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [imageSlug]);

  // Save scroll position before page unload (refresh/close)
  useEffect(() => {
    const saveScrollOnUnload = () => {
      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0
      try {
        sessionStorage.setItem('gallery-scrollY', String(currentScroll))
        console.log('💾 Saved scroll on unload:', currentScroll)
      } catch {}
    };

    // Save on beforeunload (refresh/close)
    window.addEventListener('beforeunload', saveScrollOnUnload);
    
    // Also save periodically while scrolling
    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0
        try {
          sessionStorage.setItem('gallery-scrollY', String(currentScroll))
        } catch {}
      }, 200); // Debounce scroll saves
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('beforeunload', saveScrollOnUnload);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Open modal on direct URL access
  useEffect(() => {
    if (imageSlug && artworks.length > 0 && !active) {
      const image = findImageBySlug(imageSlug, artworks);
      if (image) {
        if (image.targetIndex !== undefined) {
          // For series images, use the target index
          setActive({ art: image, idx: image.targetIndex });
        } else {
          // For single images, find the index
          const idx = artworks.findIndex(art => art.id === image.id);
          setActive({ art: image, idx: idx >= 0 ? idx : 0 });
        }
      }
    }
  }, [imageSlug, artworks]);

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

  // Re-sort results when sort filter changes
  useEffect(() => {
    if (!debouncedQuery && sortFilter !== 'default') {
      // Re-sort the main artworks when filter changes
      const sorted = sortFilter === 'most-liked' ? sortByLikes([...artworks]) : artworks;
      setArtworks(sorted);
    } else if (!debouncedQuery && sortFilter === 'default') {
      // Reset to original order when filter is reset - reload from cache or API
      const sessionCache = sessionStorage.getItem('gallery-artwork-session');
      if (sessionCache) {
        try {
          const parsedArtworks = JSON.parse(sessionCache);
          if (parsedArtworks && Array.isArray(parsedArtworks) && parsedArtworks.length > 0) {
            setArtworks(parsedArtworks);
          }
        } catch (error) {
          console.error('Error parsing cached artworks:', error);
        }
      }
    }
  }, [sortFilter]);

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
    
    // Track search in analytics
    if (analytics && searchQuery.trim()) {
      logEvent(analytics, 'search', {
        search_term: searchQuery,
        page_number: page
      })
    }
    
    try {
      // Check cache for search results
      const cacheKey = `search-${searchQuery}-${page}`;
      const cachedResults = sessionStorage.getItem(`gallery-search-${cacheKey}`);
      
      if (cachedResults) {
        const parsedResults = JSON.parse(cachedResults);
        // Apply sort filter to cached results
        const sortedCachedResults = sortFilter === 'most-liked' ? sortByLikes(parsedResults.images) : parsedResults.images;
        
        if (page === 1) {
          setSearchResults(sortedCachedResults);
        } else {
          setSearchResults(prev => [...prev, ...sortedCachedResults]);
        }
        setSearchPage(page);
        setSearchHasMore(parsedResults.pagination?.hasMore || false);
        setIsSearching(false);
        return;
      }

      const result = await searchGalleryImages('gallery', searchQuery, page, 20);
      if (result.success) {
        // Group search results by series like the main gallery
        const groupedResults = groupImagesBySeries(result.images);
        const shuffled = shuffleArray(groupedResults);
        
        // Cache search results
        const cacheData = {
          images: shuffled,
          pagination: result.pagination,
          timestamp: Date.now()
        };
        sessionStorage.setItem(`gallery-search-${cacheKey}`, JSON.stringify(cacheData));
        
        // Apply sort filter to search results
        const sortedResults = sortFilter === 'most-liked' ? sortByLikes(shuffled) : shuffled;
        
        if (page === 1) {
          setSearchResults(sortedResults);
        } else {
          setSearchResults(prev => [...prev, ...sortedResults]);
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
            description: img.description || '',
            scientificName: img.scientificName || '',
            seriesNumber: img.seriesIndex || 1 // Add series number for URL generation
          };
        }
        // Push the full image object, not just the src
        groups[img.title].images.push({
          id: img.id,
          src: img.src,
          title: img.title,
          alt: img.alt,
          description: img.description,
          scientificName: img.scientificName,
          location: img.location,
          timeTaken: img.timeTaken,
          history: img.history,
          likes: img.likes,
          path: img.path,
          seriesIndex: img.seriesIndex
        });
      } else {
        // Individual image (not part of a series) - store as flat artwork with src
        const individualName = `individual_${img.title || img.name}`;
        groups[individualName] = {
          id: img.id,
          src: img.src,
          title: img.title || img.name.replace(/\.[^/.]+$/, ""),
          alt: img.alt || img.name,
          isSeries: false,
          description: img.description || '',
          scientificName: img.scientificName || '',
          location: img.location,
          timeTaken: img.timeTaken,
          history: img.history,
          likes: img.likes,
          path: img.path
        };
      }
    });
    
    const result = Object.values(groups);
    console.log('Grouped images by series:', result);
    return result;
  }
  
  // Simple loading logic - run only once
  useEffect(() => {
    let isMounted = true
    
    const loadInitialImages = async () => {
      try {
        // Check cache first
        const cachedData = getCachedArtworks()
        
        if (cachedData) {
          console.log(`✅ Using ${cachedData.fromCache} cache with ${cachedData.artworks.length} images`)
          if (isMounted) {
            setArtworks(cachedData.artworks)
            setCurrentPage(cachedData.page)
            setHasMore(cachedData.hasMore)
            setTotalCount(cachedData.totalCount)
            // Note: Dimensions are pre-loaded in state initialization
            setGalleryLoading(false)
            setIsInitialized(true)
          }
          return
        }

        // Fetch fresh data from Firebase Functions API
        console.log('🔄 No valid cache found, fetching from Firebase Functions...')
        const result = await getGalleryImages('gallery', 1, 20);
        if (result.success) {
          // Group images by series first, then shuffle
          const groupedImages = groupImagesBySeries(result.images)
          const shuffled = shuffleArray(groupedImages)
          
          // Store in cache
          const artworksJson = JSON.stringify(shuffled)
          const now = Date.now()
          localStorage.setItem('gallery-artwork-cache', artworksJson)
          localStorage.setItem('gallery-artwork-cache-timestamp', now.toString())
          localStorage.setItem('gallery-artwork-page', '1')
          sessionStorage.setItem('gallery-artwork-session', artworksJson)
          sessionStorage.setItem('gallery-artwork-page', '1')
          // Note: dimensions will be cached as images load via handleImageLoad
          
          if (isMounted) {
            setArtworks(shuffled)
            setCurrentPage(1)
            setHasMore(result.pagination?.hasMore || false)
            setTotalCount(result.pagination?.totalCount || 0)
            setGalleryLoading(false)
            setIsInitialized(true)
          }
        } else {
          console.error('❌ Failed to load Firebase images:', result.error)
          if (isMounted) {
            setGalleryLoading(false)
          }
        }
      } catch (error) {
        console.error('❌ Error loading Firebase images:', error)
        if (isMounted) {
          setGalleryLoading(false)
        }
      }
    }

    loadInitialImages()

    return () => {
      isMounted = false
    }
  }, []) // Empty dependency array - run only once

  // Preload images for instant display
  useEffect(() => {
    if (artworks.length > 0) {
      // Preload first 12 images (first visible row + buffer)
      const imagesToPreload = artworks.slice(0, 12)
      imagesToPreload.forEach((art, index) => {
        if (art.isSeries && art.images && art.images.length > 0) {
          // Preload first image in series
          const img = new Image()
          img.src = art.images[0].url
        } else if (art.url) {
          // Preload single image
          const img = new Image()
          img.src = art.url
        }
      })
      console.log(`Preloaded ${imagesToPreload.length} images for instant display`)
    }
  }, [artworks])


  // Fine-tune scroll restoration after images load
  useEffect(() => {
    if (!isInitialized || artworks.length === 0 || imageSlug) {
      return
    }

    const savedScrollY = sessionStorage.getItem('gallery-scrollY')
    if (!savedScrollY) {
      return
    }

    const scrollPosition = parseInt(savedScrollY, 10)
    console.log('📍 Fine-tuning scroll to:', scrollPosition)

    let hasRestored = false
    const viewportHeight = window.innerHeight
    const requiredHeight = scrollPosition + viewportHeight
    
    let attempts = 0
    const maxAttempts = 30

    // Fine-tune the scroll position as the page grows
    const fineTuneScroll = () => {
      if (hasRestored) return
      
      attempts++
      
      const currentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      )
      
      const currentScroll = window.scrollY || window.pageYOffset
      const scrollDiff = Math.abs(currentScroll - scrollPosition)
      
      // If we're not at the right position and page is tall enough, adjust
      if (scrollDiff > 10 && currentHeight >= requiredHeight) {
        document.documentElement.scrollTop = scrollPosition
        document.body.scrollTop = scrollPosition
        console.log(`🔧 Adjusted scroll from ${currentScroll} to ${scrollPosition}`)
      }
      
      // Check if we're done
      if (currentHeight >= requiredHeight && scrollDiff <= 10) {
        hasRestored = true
        console.log('✅ Scroll position finalized at:', scrollPosition)
        setTimeout(() => {
          sessionStorage.removeItem('gallery-scrollY')
        }, 100)
      } else if (attempts < maxAttempts) {
        setTimeout(fineTuneScroll, 100)
      } else {
        hasRestored = true
        console.log('⚠️ Max attempts reached, scroll at:', window.scrollY)
        sessionStorage.removeItem('gallery-scrollY')
      }
    }

    // Start fine-tuning after a brief delay
    setTimeout(fineTuneScroll, 100)

  }, [isInitialized, artworks.length, imageSlug])
  
  // Load more images function for infinite scroll with caching
  const loadMoreImages = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      console.log(`Loading page ${nextPage} with 20 images...`);
      const result = await getGalleryImages('gallery', nextPage, 20);
      
      if (result.success && result.images.length > 0) {
        const newGroupedImages = groupImagesBySeries(result.images);
        const newShuffled = shuffleArray(newGroupedImages);
        
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
          // Note: dimensions will be cached as new images load via handleImageLoad
          
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

  // Sort images by likes
  const sortByLikes = (images) => {
    return images.sort((a, b) => {
      const aLikes = a.likes || 0
      const bLikes = b.likes || 0
      return bLikes - aLikes // Sort descending (most liked first)
    })
  }
  
  // Apply sorting filter to artworks
  const sortedArtworks = sortFilter === 'most-liked' ? sortByLikes([...artworks]) : artworks
  
  // Use artworks from Firebase instead of hardcoded array
  const shuffledArtworks = sortedArtworks
  
  // Use search results if searching, otherwise use regular artworks
  const displayedArtworks = debouncedQuery.trim() ? searchResults : shuffledArtworks;
  
  // Separate series photos into individual items
  const separatedArtworks = displayedArtworks.flatMap(art => {
    if (art.isSeries && art.images && art.images.length > 1) {
      // For series, create individual items for each image
      return art.images.map((image, index) => ({
        ...art,
        id: image.id, // Use the original image ID so dimensions match
        src: image.src,
        images: undefined, // Remove the images array since this is now a single image
        isSeries: false, // This individual image is not a series
        seriesIndex: index + 1,
        seriesTotal: art.images.length,
        originalSeriesId: art.id,
        title: `${art.title}${art.scientificName ? ` - ${art.scientificName}` : ''} - Part ${index + 1}`,
        alt: `${art.title}${art.scientificName ? ` - ${art.scientificName}` : ''} - Part ${index + 1}`,
        description: art.description,
        scientificName: art.scientificName,
        location: art.location,
        timeTaken: art.timeTaken,
        history: art.history,
        likes: image.likes || art.likes || 0,
        // Preserve additional metadata that might be needed
        path: image.path || art.path,
        size: image.size || art.size,
        timeCreated: image.timeCreated || art.timeCreated,
        contentType: image.contentType || art.contentType,
        metadata: image.metadata || art.metadata,
        // Store the complete series data for modal access
        completeSeriesData: {
          id: art.id,
          isSeries: true,
          images: art.images,
          title: art.title,
          description: art.description,
          scientificName: art.scientificName,
          location: art.location,
          timeTaken: art.timeTaken,
          history: art.history,
          path: art.path,
          size: art.size,
          timeCreated: art.timeCreated,
          contentType: art.contentType,
          metadata: art.metadata
        }
      }));
    } else {
      // For single images, keep as is
      return [art];
    }
  });
  
  // Deduplicate separated artworks based on unique identifier
  const deduplicatedArtworks = separatedArtworks.filter((art, index, array) => {
    const uniqueKey = art.src || art.id;
    return array.findIndex(item => 
      (item.src || item.id) === uniqueKey
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
      return 'small' // Default size until dimensions load
    }
    
    const { aspectRatio } = dimensions
    
    // Smart grid assignment based on aspect ratio with randomization
    if (aspectRatio < 0.8) {
      // Portrait - always use medium (1 column, 2 rows)
      return 'medium'
    } else if (aspectRatio > 2.0) {
      // Very wide panorama - use wide (2 columns, 1 row)
      return 'wide'
    } else {
      // Square/landscape - randomly choose between small and large for visual variety
      // Use a simple hash of the image ID to create consistent "randomness"
      const hash = artwork.id ? artwork.id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0) : Math.random() * 1000;
      
      // 10% chance for large, 90% chance for small
      return Math.abs(hash) % 10 < 1 ? 'large' : 'small'
    }
  }


  const handleImageLoad = (id, naturalWidth, naturalHeight) => {
    const aspectRatio = naturalWidth / naturalHeight
    
    // Find the artwork to determine grid size
    const artwork = deduplicatedArtworks.find(art => art.id === id)
    let gridSize = 'unknown'
    if (artwork) {
      const dimensions = { width: naturalWidth, height: naturalHeight, aspectRatio }
      
      // Apply the same logic as getBentoSize
      if (aspectRatio < 0.8) {
        gridSize = 'medium (portrait)'
      } else if (aspectRatio > 2.0) {
        gridSize = 'wide (panorama)'
      } else {
        // Use the same hash logic for consistent debugging
        const hash = artwork.id ? artwork.id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0) : Math.random() * 1000;
        const isLarge = Math.abs(hash) % 10 < 1;
        gridSize = isLarge ? 'large (square/landscape - featured!)' : 'small (square/landscape)'
      }
    }
    
    console.log(`📐 Image ${id}: ${naturalWidth}x${naturalHeight}, aspectRatio: ${aspectRatio.toFixed(2)} → ${gridSize}`)
    
    // Update dimensions and trigger re-render
    setImageDimensions(prev => {
      const newDimensions = {
        ...prev,
        [id]: { width: naturalWidth, height: naturalHeight, aspectRatio }
      }
      
      // Cache dimensions along with artworks
      try {
        const dimensionsJson = JSON.stringify(newDimensions)
        localStorage.setItem('gallery-artwork-dimensions', dimensionsJson)
        sessionStorage.setItem('gallery-artwork-dimensions', dimensionsJson)
      } catch (e) {
        console.warn('Failed to cache dimensions:', e)
      }
      
      return newDimensions
    })
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
    <>
      {/* Dynamic SEO for individual images or default gallery SEO */}
      {active ? (
        <SEO 
          title={`${active.art.title}${active.art.scientificName ? ` - ${active.art.scientificName}` : ''} | John Philip Morada Photography`}
          description={active.art.description || `Wildlife photography of ${active.art.title} by John Philip Morada. ${active.art.scientificName ? `Scientific name: ${active.art.scientificName}. ` : ''}${active.art.location ? `Photographed in ${active.art.location}.` : ''}`}
          keywords={`${active.art.title}, ${active.art.scientificName || ''}, wildlife photography, John Philip Morada, bird photography, ${active.art.location || ''}`}
          image={active.art.src}
        />
      ) : (
        <SEO 
          title="Gallery - Wildlife Photography | John Philip Morada"
          description="Explore the complete wildlife and nature photography gallery by John Philip Morada. Browse stunning images of Philippine birds, wildlife, and nature captured with dedication and artistic vision."
          keywords="wildlife gallery, nature photography collection, bird photos, Philippine wildlife images, photography portfolio, John Philip Morada gallery"
        />
      )}
      
      
      <main className="min-h-screen bg-[rgb(var(--bg))] transition-colors duration-300">
      <div className="container-responsive pt-20 sm:pt-24 md:pt-20 lg:pt-24 pb-6 sm:pb-8">
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <div className="lg:col-span-7">
              <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-2 sm:mb-3 transition-colors duration-300">Feature Portfolio</div>
              <h1 className="font-extrabold text-[rgb(var(--fg))] uppercase leading-[0.9] transition-colors duration-300" style={{ letterSpacing: '0.20em', fontKerning: 'none', fontVariantLigatures: 'none' }}>
                {/* Primary title with emphasized accent */}
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl" style={{ letterSpacing: '0.18em', fontKerning: 'none', fontVariantLigatures: 'none' }}>
                  <span className="inline-block" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
                    Wildlife
                    <span className="mt-2 block h-[4px] w-full bg-[rgb(var(--primary))] rounded-full" />
                  </span>
                </span>
                {/* Secondary title with colored emphasis on LENS */}
                <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl opacity-95" style={{ letterSpacing: '0.16em', fontKerning: 'none', fontVariantLigatures: 'none' }}>
                  Through My <span style={{ color: 'rgb(var(--primary))', letterSpacing: '0.18em', fontKerning: 'none', fontVariantLigatures: 'none' }}>Lens</span>
                </span>
                
              </h1>
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[rgb(var(--muted))]/20 transition-colors duration-300">
                <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] transition-colors duration-300">
                  Field Notes & Wild Encounters
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 lg:self-end">
              <p className="text-[rgb(var(--muted))] text-sm sm:text-base md:text-lg leading-relaxed lg:border-l lg:border-[rgb(var(--muted))]/20 lg:pl-5 transition-colors duration-300">
                A collection of my wildlife and nature photos that show the beauty of the natural world. I spent a lot of time waiting and watching to get these shots.
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 h-px w-full bg-[rgb(var(--muted))]/20 transition-colors duration-300" />
        </div>

        {/* Search and description row */}
        <div className="mb-8 flex items-center justify-center">
          <div className="w-full max-w-3xl">
            <div className="flex gap-3 items-center">
              {/* Search Input */}
              <div className="flex-1">
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
              </div>
              
              {/* Filter Dropdown */}
              <div className="relative">
                <select
                  value={sortFilter}
                  onChange={(e) => setSortFilter(e.target.value)}
                  className="appearance-none bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 rounded-full px-4 py-2 sm:py-3 pr-8 text-sm sm:text-base text-[rgb(var(--fg))] focus:outline-none focus:ring-4 focus:ring-[rgb(var(--primary))]/25 hover:border-[rgb(var(--muted))]/40 transition-colors duration-300 cursor-pointer"
                >
                  <option value="default">All</option>
                  <option value="most-liked">Most Liked</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <Filter size={14} className="text-[rgb(var(--muted))] transition-colors duration-300" />
                </div>
              </div>
            </div>
            
            {(debouncedQuery || sortFilter !== 'default') && (
              <div className="mt-2 text-center text-sm text-[rgb(var(--muted))] transition-colors duration-300">
                {debouncedQuery && (
                  <span>
                    {isSearching || isDebouncing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[rgb(var(--muted))]/30 border-t-[rgb(var(--muted))] rounded-full animate-spin"></div>
                        Searching...
                      </span>
                    ) : (
                      `Showing ${deduplicatedArtworks.length} results`
                    )}
                  </span>
                )}
                {sortFilter !== 'default' && !debouncedQuery && (
                  <span>Sorted by {sortFilter === 'most-liked' ? 'Most Liked' : 'Default'}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {galleryLoading && !isInitialized ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 auto-rows-[120px] sm:auto-rows-[100px] md:auto-rows-[120px] lg:auto-rows-[320px] mb-6 grid-flow-dense">
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
        ) : debouncedQuery && deduplicatedArtworks.length === 0 && !isSearching && !isDebouncing ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-[rgb(var(--muted-fg))] transition-colors duration-300">No results for "{debouncedQuery}"</p>
            </div>
          </div>
        ) : (isSearching || isDebouncing) ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 auto-rows-[120px] sm:auto-rows-[100px] md:auto-rows-[120px] lg:auto-rows-[320px] mb-6 grid-flow-dense">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 auto-rows-[120px] sm:auto-rows-[100px] md:auto-rows-[120px] lg:auto-rows-[320px] mb-6 grid-flow-dense animate-fadeIn">
            {console.log('🎨 Rendering artworks:', deduplicatedArtworks.length, deduplicatedArtworks)}
            {deduplicatedArtworks.map((art, i) => {
            const size = getBentoSize(art, i)
            
            const gridClasses = size === 'large' ? 'col-span-2 row-span-2' : 
                               size === 'wide' ? 'col-span-2 row-span-1' :
                               size === 'medium' ? 'col-span-1 row-span-2' : 
                               'col-span-1 row-span-1'
          
            // Defensive: skip items without an image
            const imageSrc = typeof art.src === 'string' ? art.src : null

            if (!imageSrc) {
              return null
            }

            // Create a stable key that doesn't change - include series info for uniqueness
            const uniqueKey = `${art.id || 'unknown'}-${art.seriesIndex || i}-${i}`.replace(/[^a-zA-Z0-9-_]/g, '-');

            return (
              <figure 
                key={uniqueKey} 
                className={`group cursor-pointer ${gridClasses} rounded-lg overflow-hidden relative transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border border-[rgb(var(--muted))]/10 hover:border-[rgb(var(--primary))]/30`}
                onClick={() => {
                  // Track image view in analytics
                  if (analytics) {
                    logEvent(analytics, 'view_item', {
                      item_id: art.id,
                      item_name: art.title,
                      item_category: 'photography',
                      item_variant: art.isSeries ? 'series' : 'single'
                    })
                  }

                  // Track image view with custom analytics
                  trackImageView({
                    id: art.id,
                    title: art.title,
                    path: art.src,
                    isFeatured: false
                  }, {
                    isSeries: art.isSeries,
                    seriesIndex: i,
                    galleryType: 'main'
                  });

                  // If this is a separated series item, use the complete series data
                  if (art.completeSeriesData) {
                    console.log('Opening series modal with complete data:', art.completeSeriesData);
                    console.log('Opening at index:', art.seriesIndex - 1);
                    
                    // Use the complete series data directly with URL routing
                    handleImageClick(art.completeSeriesData, art.seriesIndex - 1);
                  } else {
                    // For single images, open normally with URL routing
                    console.log('Opening single image modal:', art);
                    handleImageClick(art, 0);
                  }
                }}
              >
                <div className="w-full h-full relative overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={art.title || ''}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    style={{
                      opacity: loadedImages.has(art.id) ? 1 : 0,
                      transition: 'opacity 0.5s ease-in-out'
                    }}
                    onLoad={(e) => {
                      const { naturalWidth, naturalHeight } = e.target
                      handleImageLoad(art.id, naturalWidth, naturalHeight)
                      // Small delay to ensure smooth fade-in
                      setTimeout(() => {
                        setLoadedImages(prev => new Set([...prev, art.id]))
                      }, 50)
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-1 left-1 right-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-[2px] rounded px-1.5 py-1 max-w-[90%]">
                      <div className="text-[6px] sm:text-[7px] md:text-[8px] font-mono tracking-widest text-white/90 flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="text-[6px] sm:text-[7px] md:text-[8px] font-medium leading-tight uppercase tracking-wide text-white break-words min-w-0">
                        {art.title}
                      </div>
                    </div>
                  </div>
                </div>
              </figure>
            )
          })}
          </div>
        )}

        {/* Loading more skeleton */}
        {loadingMore && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 auto-rows-[120px] sm:auto-rows-[100px] md:auto-rows-[120px] lg:auto-rows-[320px] mb-6 grid-flow-dense">
            {[
              'large','small','medium','wide','small','large','small','medium','small','wide','small','medium'
            ].map((size, i) => {
              const gridClasses = size === 'large' ? 'col-span-2 row-span-2' :
                                   size === 'wide' ? 'col-span-2 row-span-1' :
                                   size === 'medium' ? 'col-span-1 row-span-2' : 
                                   'col-span-1 row-span-1'
              return (
                <div key={`loading-more-${i}`} className={`${gridClasses} rounded-lg overflow-hidden relative border border-[rgb(var(--muted))]/10`}>
                  <div className="absolute inset-0 animate-pulse bg-[rgb(var(--muted))]/20" />
                  
                  {/* Image overlay skeleton */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0" />
                  
                  {/* Bottom info skeleton */}
                  <div className="absolute bottom-2 left-2 right-2 transform translate-y-3 opacity-0">
                    <div className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-[2px] rounded-md px-2 py-1.5 max-w-[95%]">
                      <div className="text-[8px] sm:text-[9px] md:text-[10px] font-mono tracking-widest text-white/80 flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="text-[8px] sm:text-[9px] md:text-xs font-medium leading-tight uppercase tracking-wide text-white break-words min-w-0">
                        Loading...
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {/* End of gallery indicator */}
        {!hasMore && deduplicatedArtworks.length > 0 && !loadingMore && (
          <div className="flex justify-center items-center py-8">
            <span className="text-[rgb(var(--muted-fg))] text-sm transition-colors duration-300">You've reached the end of the gallery</span>
          </div>
        )}

        {/* Gallery Statistics */}
        <div className="text-center mb-8 sm:mb-12" data-gallery-stats>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8">
            <div className="bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/20 rounded-md sm:rounded-lg p-3 sm:p-4 md:p-6 transition-colors duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[rgb(var(--fg))] mb-1 sm:mb-2 transition-colors duration-300">
                {deduplicatedArtworks.length}
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
        <ModalViewer 
          active={active} 
          setActive={setActive} 
          allArtworks={artworks}
          handleImageClick={handleImageClick}
          handleModalClose={handleModalClose}
        />
      )}
      </div>
    </main>
    </>
  )
}

function ModalViewer({ active, setActive, allArtworks, handleImageClick, handleModalClose }) {
  // Early return if active is null or invalid
  if (!active || !active.art) {
    return null
  }

  const activeRef = useRef(active)
  useEffect(() => { activeRef.current = active }, [active])
  
  // Smart navigation functions - navigate within series or between artworks
  const navigateLeft = () => {
    const currentActive = activeRef.current
    if (!currentActive?.art) return
    
    // If it's a series and we're not on the first image, navigate within the series
    if (currentActive.art.isSeries && currentActive.idx > 0) {
      const newIdx = currentActive.idx - 1;
      handleImageClick(currentActive.art, newIdx);
      return
    }
    
    // Otherwise, navigate to previous artwork
    const currentIndex = allArtworks.findIndex(art => art.id === currentActive.art.id)
    if (currentIndex > 0) {
      const prevArt = allArtworks[currentIndex - 1]
      // If previous artwork is a series, go to its last image
      const lastIdx = prevArt.isSeries ? (prevArt.images?.length || 1) - 1 : 0
      handleImageClick(prevArt, lastIdx);
    }
  }
  
  const navigateRight = () => {
    const currentActive = activeRef.current
    if (!currentActive?.art) return
    
    // If it's a series and we're not on the last image, navigate within the series
    if (currentActive.art.isSeries && currentActive.idx < (currentActive.art.images?.length || 1) - 1) {
      const newIdx = currentActive.idx + 1;
      handleImageClick(currentActive.art, newIdx);
      return
    }
    
    // Otherwise, navigate to next artwork
    const currentIndex = allArtworks.findIndex(art => art.id === currentActive.art.id)
    if (currentIndex < allArtworks.length - 1) {
      const nextArt = allArtworks[currentIndex + 1]
      handleImageClick(nextArt, 0);
    }
  }
  
  // Helper functions to determine navigation context
  const getLeftNavigationInfo = () => {
    const currentActive = activeRef.current
    if (!currentActive?.art) return { type: 'artwork', label: 'Previous', disabled: true }

    // If it's a series and we're not on the first image
    if (currentActive.art.isSeries && currentActive.idx > 0) {
      return { type: 'image', label: 'Previous Image', disabled: false }
    }
    
    // Check if we can go to previous artwork
    const currentIndex = allArtworks.findIndex(art => art.id === currentActive.art.id)
    if (currentIndex > 0) {
      const prevArt = allArtworks[currentIndex - 1]
      return { 
        type: 'artwork', 
        label: prevArt.isSeries ? 'Previous Series' : 'Previous', 
        disabled: false 
      }
    } else {
      return { type: 'artwork', label: 'Previous', disabled: true }
    }
  }
  
  const getRightNavigationInfo = () => {
    const currentActive = activeRef.current
    if (!currentActive?.art) return { type: 'artwork', label: 'Next', disabled: true }

    // If it's a series and we're not on the last image
    if (currentActive.art.isSeries && currentActive.idx < (currentActive.art.images?.length || 1) - 1) {
      return { type: 'image', label: 'Next Image', disabled: false }
    }
    
    // Check if we can go to next artwork
    const currentIndex = allArtworks.findIndex(art => art.id === currentActive.art.id)
    if (currentIndex < allArtworks.length - 1) {
      const nextArt = allArtworks[currentIndex + 1]
      return { 
        type: 'artwork', 
        label: nextArt.isSeries ? 'Next Series' : 'Next', 
        disabled: false 
      }
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
              const newIdx = (active.idx - 1 + (active.art.images?.length || 1)) % (active.art.images?.length || 1);
              handleImageClick(active.art, newIdx);
            }
            if (e.key === 'ArrowRight') {
              const newIdx = (active.idx + 1) % (active.art.images?.length || 1);
              handleImageClick(active.art, newIdx);
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
        // Track like in analytics
        if (analytics) {
          logEvent(analytics, 'like', {
            item_id: art.id,
            item_name: art.title,
            item_category: 'photography',
            item_variant: art.isSeries ? 'series' : 'single'
          })
        }
        
        // Update the likes count - handle both series and single images
        setActive(prev => {
          if (prev.art.isSeries && prev.art.images && prev.art.images.length > 0) {
            // For series, update the specific image's likes
            const updatedImages = prev.art.images.map((image, index) => 
              index === prev.idx ? { ...image, likes: result.newLikesCount } : image
            );
            return {
              ...prev,
              art: {
                ...prev.art,
                images: updatedImages
              }
            };
          } else {
            // For single images, update the main artwork's likes
            return {
              ...prev,
              art: {
                ...prev.art,
                likes: result.newLikesCount
              }
            };
          }
        });
      }
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  // Get the current image source safely
  const getCurrentImageSrc = () => {
    if (!active?.art) return null
    
    // If it's a series, get the current image from the series array
    if (active.art.isSeries && active.art.images && active.art.images.length > 0) {
      const currentImage = active.art.images[active.idx]
      return currentImage?.src || null
    }
    
    // Otherwise, use the artwork's src
    return active.art.src || active.art.image || null
  }

  // Get the current image data (for series) or artwork data (for single images)
  const getCurrentImageData = () => {
    if (!active?.art) return null
    
    console.log('Modal active data:', active);
    console.log('Series images length:', active.art.images?.length);
    
    // If it's a series, get the current image from the series array
    if (active.art.isSeries && active.art.images && active.art.images.length > 0) {
      const currentImage = active.art.images[active.idx]
      return {
        ...currentImage,
        // Use series title for display
        title: active.art.title,
        description: active.art.description,
        scientificName: active.art.scientificName
      }
    }
    
    // Otherwise, use the artwork data
    return active.art
  }

  const currentImageSrc = getCurrentImageSrc()
  const currentImageData = getCurrentImageData()
  const hasMultipleImages = active?.art?.isSeries && active?.art?.images?.length > 1

  return (
    <>
      {/* Enhanced backdrop with theme-aware blur */}
      <div 
        className="fixed inset-0 z-40 backdrop-blur-md transition-colors duration-300" 
        style={{
          background: 'linear-gradient(135deg, rgba(var(--bg), 0.95) 0%, rgba(var(--bg), 0.85) 50%, rgba(var(--bg), 0.95) 100%)'
        }}
        onClick={handleModalClose} 
      />
      
      {/* Main modal container */}
      <div 
        className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-2 lg:p-4 overflow-y-auto" 
        role="dialog" 
        aria-modal="true"
        tabIndex={-1}
        onKeyDown={(e) => {
          // Ensure keyboard events are captured by the modal
          e.stopPropagation()
        }}
        style={{ outline: 'none' }}
      >
        <div ref={containerRef} className="w-full h-full sm:h-auto max-w-7xl max-h-[100vh] sm:max-h-[95vh] relative sm:my-auto">
          <div 
            ref={viewerRef} 
            className="relative sm:rounded-2xl shadow-2xl ring-0 sm:ring-1 ring-[rgb(var(--muted))]/20 overflow-hidden transition-colors duration-300 h-full sm:h-auto"
            style={{ 
              backgroundColor: 'rgb(var(--bg))',
              maxWidth: '100vw',
              maxHeight: '100vh',
              minHeight: 'auto'
            }}
          >
            
            {/* Header with controls */}
            <div 
              className="absolute top-0 left-0 right-0 z-20 p-2 sm:p-4 lg:p-6 transition-colors duration-300"
              style={{ 
                background: 'linear-gradient(to bottom, rgba(var(--bg), 0.95) 0%, rgba(var(--bg), 0.8) 50%, transparent 100%)'
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
                    onClick={handleModalClose} 
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex flex-col lg:flex-row lg:min-h-[80vh] overflow-y-auto" style={{ maxHeight: '100vh' }}>
              
              {/* Image section */}
              <div 
                className="relative lg:flex-1 overflow-hidden transition-colors duration-300"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(var(--muted), 0.1) 0%, rgba(var(--muted), 0.05) 100%)',
                  minHeight: 'auto'
                }}
              >
                <div className="relative w-full flex flex-col lg:h-full lg:min-h-[70vh] lg:flex-row lg:items-center lg:justify-center p-2 sm:p-4 lg:p-8 pt-12 sm:pt-16 lg:pt-16 pb-2 sm:pb-4 lg:pb-8 overflow-hidden">
                  {currentImageSrc ? (
                    <div className="w-full flex items-start sm:items-center lg:items-center justify-center relative" style={{ minHeight: 'auto' }}>
                      <img 
                        ref={imageRef}
                        src={currentImageSrc} 
                        alt={active.art.title || ''} 
                        className={`max-w-full object-contain transition-all duration-700 rounded-lg ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: 'calc(100vh - 200px)', // Account for header and details
                          width: 'auto', 
                          height: 'auto',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                      />
                    </div>
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

                {/* Like Button - Mobile: Simple icon + number, Desktop: Full button */}
                <div className="absolute bottom-4 right-4 z-20">
                  {!visible ? (
                    // Skeleton loading state for like button
                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Mobile skeleton - simple */}
                      <div className="flex items-center gap-2 sm:hidden">
                        <div className="w-5 h-5 bg-[rgb(var(--primary))]/20 rounded animate-pulse"></div>
                        <div className="w-6 h-4 bg-[rgb(var(--primary))]/20 rounded animate-pulse"></div>
                      </div>
                      {/* Desktop skeleton - full button */}
                      <div className="hidden sm:flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-md"
                        style={{
                          background: 'linear-gradient(135deg, rgba(var(--primary), 0.08) 0%, rgba(var(--primary), 0.04) 100%)',
                          border: '1px solid rgba(var(--primary), 0.2)'
                        }}
                      >
                        <div className="w-6 h-6 bg-[rgb(var(--primary))]/20 rounded animate-pulse"></div>
                        <div className="flex flex-col gap-1">
                          <div className="w-8 h-5 bg-[rgb(var(--primary))]/20 rounded animate-pulse"></div>
                          <div className="w-12 h-3 bg-[rgb(var(--primary))]/20 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* Simple like button for all screen sizes */}
                      <button
                        onClick={() => handleLike(currentImageData)}
                        className="flex items-center gap-2 transition-all duration-200 hover:scale-110"
                        title="Like this photo"
                        aria-label="Like this photo"
                      >
                        <Heart
                          size={18}
                          className="text-white drop-shadow-lg"
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                          }}
                        />
                        <span 
                          className="text-white font-semibold text-sm"
                          style={{ 
                            textShadow: '0 1px 3px rgba(0,0,0,0.7)'
                          }}
                        >
                          {currentImageData?.likes || 0}
                        </span>
                      </button>
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
                          <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                        </button>
                      )
                    })()}
                  </div>
                </div>
              </div>

              {/* Mobile/Tablet Photo Details - Only visible on small screens */}
              <div className="lg:hidden p-4 border-t border-gray-300 dark:border-gray-600 transition-colors duration-300" style={{ backgroundColor: 'rgb(var(--bg))' }}>
                {/* Photo Title and Scientific Name */}
                <div className="mb-4">
                  {!visible ? (
                    // Skeleton loading state for title
                    <div className="space-y-1">
                      <div className="w-24 h-4 bg-[rgb(var(--muted))]/20 rounded animate-pulse"></div>
                      <div className="w-32 h-3 bg-[rgb(var(--muted))]/20 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-sm font-bold transition-colors duration-300" style={{ color: 'rgb(var(--fg))' }}>
                        {active.art.title || 'Untitled'}{currentImageData?.scientificName && ` - ${currentImageData.scientificName}`}
                      </h1>
                    </div>
                  )}
                </div>



                {/* Photo Details */}
                <div className="transition-colors duration-300">
                  <div 
                    className="text-sm font-bold uppercase tracking-wider mb-3 transition-colors duration-300"
                    style={{ color: 'rgba(var(--primary), 0.9)' }}
                  >
                    PHOTO DETAILS
                  </div>
                  <div className="space-y-2 text-sm">
                    {/* Location */}
                    <div className="flex justify-between items-start py-2">
                      <span 
                        className="font-medium transition-colors duration-300 text-sm flex-shrink-0 mr-3"
                        style={{ color: 'rgba(var(--muted-fg), 0.8)' }}
                      >
                        Location
                      </span>
                      <span 
                        className="font-semibold transition-colors duration-300 text-sm text-right flex-1 break-words"
                        style={{ color: currentImageData?.location ? 'rgb(var(--fg))' : 'rgba(var(--muted-fg), 0.6)' }}
                      >
                        {currentImageData?.location || <span className="italic">Not specified</span>}
                      </span>
                    </div>
                    <div
                      className="w-full h-[1px] bg-gray-300 dark:bg-gray-600 transition-colors duration-300"
                    ></div>
                    
                    {/* Time Taken */}
                    <div className="flex justify-between items-start py-2">
                      <span 
                        className="font-medium transition-colors duration-300 text-sm flex-shrink-0 mr-3"
                        style={{ color: 'rgba(var(--muted-fg), 0.8)' }}
                      >
                        Date Taken
                      </span>
                      <span 
                        className="font-semibold transition-colors duration-300 text-sm text-right flex-1"
                        style={{ color: currentImageData?.timeTaken ? 'rgb(var(--fg))' : 'rgba(var(--muted-fg), 0.6)' }}
                      >
                        {currentImageData?.timeTaken || <span className="italic">Not specified</span>}
                      </span>
                    </div>
                    <div
                      className="w-full h-[1px] bg-gray-300 dark:bg-gray-600 transition-colors duration-300"
                    ></div>
                    
                    {/* History */}
                    <div className="py-2">
                      <span 
                        className="font-medium transition-colors duration-300 block mb-2 text-sm"
                        style={{ color: 'rgba(var(--muted-fg), 0.8)' }}
                      >
                        History
                      </span>
                      <p 
                        className="text-sm transition-colors duration-300 leading-relaxed"
                        style={{ color: currentImageData?.history ? 'rgba(var(--muted-fg), 0.9)' : 'rgba(var(--muted-fg), 0.6)' }}
                      >
                        {currentImageData?.history || <span className="italic">No additional information available</span>}
                      </p>
                    </div>
                    
                  </div>
                </div>

                {/* Mobile Gallery Navigation - Only visible when there are multiple images */}
                {hasMultipleImages && (
                  <>
                    {/* Divider before thumbnails */}
                    <div 
                      className="w-full h-[2px] bg-gray-300 dark:bg-gray-600 transition-colors duration-300 my-4"
                    ></div>
                    <div className="transition-colors duration-300">
                      <div className="grid grid-cols-4 gap-2">
                        {active.art.images.map((image, i) => (
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
                            onClick={() => handleImageClick(active.art, i)}
                          >
                            <img 
                              src={image.src} 
                              alt={`${active.art.title} - Part ${i + 1}`} 
                              className={`w-full h-16 object-cover transition-opacity duration-200 ${
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
                              className="absolute bottom-1 right-1 text-white text-xs px-1 py-0.5 rounded text-xs font-mono transition-colors duration-300"
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

              {/* Vertical divider between image and sidebar */}
              <div 
                className="hidden lg:block w-[2px] bg-gray-300 dark:bg-gray-600 transition-colors duration-300"
              ></div>

              {/* Sidebar with info and thumbnails */}
              <div 
                className="hidden lg:flex w-80 flex-col transition-colors duration-300 overflow-y-auto"
                style={{ 
                  backgroundColor: 'rgb(var(--bg))',
                  maxHeight: 'calc(100vh - 80px)'
                }}
              >
                
                {/* Content section */}
                <div className="flex-1 p-3 sm:p-4 lg:p-8">
                  
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
                          style={{ color: currentImageData?.scientificName ? 'rgb(var(--fg))' : 'rgba(var(--muted-fg), 0.5)' }}
                        >
                          {currentImageData?.scientificName ? (
                            <em>{currentImageData.scientificName}</em>
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
                          style={{ color: currentImageData?.location ? 'rgb(var(--fg))' : 'rgba(var(--muted-fg), 0.5)' }}
                        >
                          {currentImageData?.location || <span className="italic">Not specified</span>}
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
                          style={{ color: currentImageData?.timeTaken ? 'rgb(var(--fg))' : 'rgba(var(--muted-fg), 0.5)' }}
                        >
                          {currentImageData?.timeTaken || <span className="italic">Not specified</span>}
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
                          style={{ color: currentImageData?.history ? 'rgba(var(--muted-fg), 0.9)' : 'rgba(var(--muted-fg), 0.5)' }}
                        >
                          {currentImageData?.history || <span className="italic">No additional information available</span>}
                        </p>
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
                      className="p-3 sm:p-4 lg:p-6 transition-colors duration-300"
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
                      {active.art.images.map((image, i) => (
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
                          onClick={() => handleImageClick(active.art, i)}
                        >
                          <img 
                            src={image.src} 
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





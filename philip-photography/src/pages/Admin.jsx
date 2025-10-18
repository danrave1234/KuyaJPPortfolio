import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { uploadMultipleImages, deleteImage, getImagesFromFolder } from '../firebase/storage'
import { getAdminGalleryImages, searchAdminGalleryImages, clearAdminCache, cleanupAdminCache, uploadWithProgress, deleteImageWithCache, updateImageMetadataWithCache, getAdminFeaturedImages, uploadFeaturedWithProgress, deleteFeaturedImageWithCache, clearFeaturedCache } from '../firebase/admin-api'
import { signInUser, signOutUser } from '../firebase/auth'
import { initTheme } from '../theme.js'
import SEO from '../components/SEO'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import { 
  Upload, 
  Settings, 
  Eye, 
  Trash2, 
  Plus, 
  LogOut, 
  Check, 
  AlertCircle,
  Camera,
  Image as ImageIcon,
  BarChart3,
  Users,
  Palette,
  Edit3,
  Zap,
  Save,
  X,
  Menu,
  Home,
  Grid3X3,
  Star,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck
} from 'lucide-react'

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth()
  
  // Initialize theme on component mount
  useEffect(() => {
    initTheme()
  }, [])
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  
  // Debug: Log message changes
  useEffect(() => {
    if (message && typeof message !== 'string') {
      console.error('Message is not a string:', message)
    }
  }, [message])
  const [galleryImages, setGalleryImages] = useState([])
  const [selectedImages, setSelectedImages] = useState(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [editForm, setEditForm] = useState({ 
    title: '', 
    description: '', 
    scientificName: '', 
    location: '', 
    dateTaken: '', 
    history: '' 
  })
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadScientificName, setUploadScientificName] = useState('')
  const [uploadLocation, setUploadLocation] = useState('')
  const [uploadTimeTaken, setUploadTimeTaken] = useState('')
  const [uploadHistory, setUploadHistory] = useState('')
  
  // Featured gallery state
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard', 'gallery', 'featured'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showUploadModal) {
        setShowUploadModal(false)
      }
    }
    
    if (showUploadModal) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showUploadModal])
  const [featuredImages, setFeaturedImages] = useState([])
  const [featuredSelectedImages, setFeaturedSelectedImages] = useState(new Set())
  const [featuredEditingImage, setFeaturedEditingImage] = useState(null)
  const [featuredEditForm, setFeaturedEditForm] = useState({ title: '', description: '' })
  const [featuredUploadTitle, setFeaturedUploadTitle] = useState('')
  const [featuredUploadDescription, setFeaturedUploadDescription] = useState('')
  
  // Admin pagination and search state
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  // Pagination cache state
  const [pageCache, setPageCache] = useState({}) // Cache for different pages
  const [searchCache, setSearchCache] = useState({}) // Cache for search results
  const [cacheTimestamps, setCacheTimestamps] = useState({}) // Cache timestamps

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault()
    setUploading(true)
    const { user, error } = await signInUser(loginForm.email, loginForm.password)
    
    if (user) {
      setMessage('Successfully logged in!')
      setLoginForm({ email: '', password: '' })
      loadGalleryImages()
    } else {
      setMessage(`Login failed: ${error}`)
    }
    setUploading(false)
  }

  // Handle logout
  const handleLogout = async () => {
    const { error } = await signOutUser()
    if (error) {
      setMessage(`Logout error: ${error}`)
    }
  }

  // Cache management functions
  const getCacheKey = (page, searchQuery) => {
    return searchQuery.trim() ? `search_${searchQuery}_page_${page}` : `page_${page}`;
  };

  const isCacheValid = (cacheKey) => {
    const timestamp = cacheTimestamps[cacheKey];
    if (!timestamp) return false;
    const now = Date.now();
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes
    return (now - timestamp) < cacheExpiry;
  };

  const getCachedData = (cacheKey) => {
    if (searchQuery.trim()) {
      return searchCache[cacheKey];
    } else {
      return pageCache[cacheKey];
    }
  };

  const setCachedData = (cacheKey, data) => {
    const timestamp = Date.now();
    setCacheTimestamps(prev => ({ ...prev, [cacheKey]: timestamp }));
    
    if (searchQuery.trim()) {
      setSearchCache(prev => ({ ...prev, [cacheKey]: data }));
    } else {
      setPageCache(prev => ({ ...prev, [cacheKey]: data }));
    }
  };

  // Load gallery images with comprehensive caching
  const loadGalleryImages = async (page = 1, searchQuery = '') => {
    const cacheKey = getCacheKey(page, searchQuery);
    
    // Check cache first
    if (isCacheValid(cacheKey)) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setGalleryImages(cachedData.images);
        setCurrentPage(page);
        setHasMore(cachedData.hasMore);
        setMessage(`Loaded ${cachedData.images.length} images from cache (page ${page})`);
        return;
      }
    }

    setUploading(true);
    setLoadingMore(page > 1);
    
    try {
      let result;
      if (searchQuery.trim()) {
        result = await searchAdminGalleryImages('gallery', searchQuery, page, 50);
      } else {
        result = await getAdminGalleryImages('gallery', page, 50);
      }
      
      if (result.success) {
        // Cache the result
        const cacheData = {
          images: result.images,
          hasMore: result.pagination?.hasMore || false,
          page: page,
          searchQuery: searchQuery
        };
        setCachedData(cacheKey, cacheData);
        
        // Update state
        setGalleryImages(result.images);
        setCurrentPage(page);
        setHasMore(result.pagination?.hasMore || false);
        
        if (searchQuery.trim()) {
          setMessage(`Found ${result.images.length} images for "${searchQuery}"`);
        } else {
          setMessage(`Loaded ${result.images.length} images from page ${page}`);
        }
      } else {
        setMessage(`Failed to load images: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error loading images: ${error.message}`);
    } finally {
      setUploading(false);
      setLoadingMore(false);
    }
  }

  // Load more images for pagination
  const loadMoreImages = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      await loadGalleryImages(nextPage, searchQuery);
    } catch (error) {
      setMessage(`Error loading more images: ${error.message}`);
    } finally {
      setLoadingMore(false);
    }
  }

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    setIsSearching(true);
    try {
      await loadGalleryImages(1, query);
    } finally {
      setIsSearching(false);
    }
  }

  // Function to group images by series (using metadata)
  const groupImagesBySeries = (images) => {
    const groups = {};
    
    images.forEach(img => {
      if (img.isSeries && img.title) {
        // Group by title for series
        if (!groups[img.title]) {
          groups[img.title] = [];
        }
        groups[img.title].push(img);
      } else {
        // Individual image (not part of a series)
        const individualName = `individual_${img.title || img.name}`;
        groups[individualName] = [img];
      }
    });
    
    return groups;
  }

  // Load featured images
  const loadFeaturedImages = async () => {
    setUploading(true)
    try {
      const result = await getAdminFeaturedImages()
      if (result.success) {
        setFeaturedImages(result.images)
        setMessage(`Loaded ${result.images.length} featured images`)
      } else {
        setMessage(`Error loading featured images: ${result.error}`)
      }
    } catch (error) {
      setMessage(`Error loading featured images: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Load images when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      cleanupAdminCache()
      loadGalleryImages()
      loadFeaturedImages()
    }
  }, [isAuthenticated])

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    
    // Only allow 1 file for featured images (check if we're on featured tab)
    if (activeTab === 'featured' && selectedFiles.length > 1) {
      setMessage('Only 1 image can be selected for featured gallery')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    
    // Filter out non-image files
    const imageFiles = selectedFiles.filter(file => {
      const isValidImage = file.type.startsWith('image/')
      if (!isValidImage) {
        setMessage(`Skipped ${file.name || 'file'} - Only image files are supported`)
        setTimeout(() => setMessage(''), 3000)
      }
      return isValidImage
    })
    
    if (imageFiles.length > 0) {
      setFiles(imageFiles)
      
      // Pre-fill title with first file name (without extension) ONLY if uploadTitle is empty
      if (!uploadTitle.trim()) {
        const firstFileName = imageFiles[0].name.replace(/\.[^/.]+$/, "")
        setUploadTitle(firstFileName)
      }
    }
    
    // Clear the input so the same files can be selected again if needed
    e.target.value = ''
  }

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles)
      // Pre-fill title with first file name (without extension) ONLY if uploadTitle is empty
      if (!uploadTitle.trim()) {
        const firstFileName = droppedFiles[0].name.replace(/\.[^/.]+$/, "")
        setUploadTitle(firstFileName)
      }
    }
  }

  // Clear all pagination caches
  const clearPaginationCache = () => {
    setPageCache({});
    setSearchCache({});
    setCacheTimestamps({});
  };

  // State for tracking image orientations in preview
  const [previewImageDimensions, setPreviewImageDimensions] = useState({})

  // Calculate grid layout for featured images preview (mimics homepage logic)
  const getFeaturedPreviewLayout = (files) => {
    if (!files || files.length === 0) return []
    
    const maxImages = Math.min(6, files.length)
    const processedFiles = files.slice(0, maxImages).map((file, index) => {
      const dimensions = previewImageDimensions[index]
      const aspectRatio = dimensions?.aspectRatio || 1
      const isPortrait = dimensions ? dimensions.aspectRatio < 1 : false
      
      return {
        ...file,
        id: index + 1,
        aspectRatio,
        isPortrait
      }
    })

    // Smart grid arrangement based on orientation (same logic as homepage)
    const portraits = processedFiles.filter(img => img.isPortrait)
    const landscapes = processedFiles.filter(img => !img.isPortrait)
    
    const layoutImages = []
    let usedSlots = 0
    let portraitCount = 0
    let landscapeCount = 0
    
    // First, place portraits (they take 2 rows each)
    while (portraitCount < portraits.length && usedSlots + 2 <= 6) {
      const portrait = portraits[portraitCount]
      layoutImages.push({ 
        ...portrait, 
        gridClass: 'col-span-1 row-span-2'
      })
      usedSlots += 2
      portraitCount++
    }
    
    // Then fill remaining slots with landscapes
    while (landscapeCount < landscapes.length && usedSlots < 6) {
      const landscape = landscapes[landscapeCount]
      layoutImages.push({ 
        ...landscape, 
        gridClass: 'col-span-1 row-span-1'
      })
      usedSlots += 1
      landscapeCount++
    }
    
    // If we still have slots and more portraits, place them as single-row
    while (portraitCount < portraits.length && usedSlots < 6) {
      const portrait = portraits[portraitCount]
      layoutImages.push({ 
        ...portrait, 
        gridClass: 'col-span-1 row-span-1'
      })
      usedSlots += 1
      portraitCount++
    }
    
    return layoutImages
  }

  // Handle image load for preview orientation detection
  const handlePreviewImageLoad = (index, naturalWidth, naturalHeight) => {
    const aspectRatio = naturalWidth / naturalHeight
    setPreviewImageDimensions(prev => ({
      ...prev,
      [index]: { width: naturalWidth, height: naturalHeight, aspectRatio }
    }))
  }

  // Auto-close toast messages
  useEffect(() => {
    if (message) {
      // Different auto-close times based on message type
      let timeout;
      
      if (message.includes('Success') || message.includes('successfully')) {
        // Success messages: 4 seconds
        timeout = setTimeout(() => setMessage(''), 4000);
      } else if (message.includes('Error') || message.includes('Failed') || message.includes('failed') || message.includes('error')) {
        // Error messages: 6 seconds (longer for user to read)
        timeout = setTimeout(() => setMessage(''), 6000);
      } else if (message.includes('Loading') || message.includes('Uploading') || message.includes('Loaded') || message.includes('Found') || message.includes('cache')) {
        // Loading/Info messages: 3 seconds
        timeout = setTimeout(() => setMessage(''), 3000);
      } else if (message.includes('Skipped') || message.includes('Please select')) {
        // Warning messages: 5 seconds
        timeout = setTimeout(() => setMessage(''), 5000);
      } else {
        // Default messages: 4 seconds
        timeout = setTimeout(() => setMessage(''), 4000);
      }

      return () => clearTimeout(timeout);
    }
  }, [message]);

  // Handle file upload with cache invalidation
  const handleUpload = async () => {
    if (files.length === 0 || !uploadTitle.trim()) return
    
    setUploading(true)
    try {
      setMessage('Checking for existing images to replace...')
      
      const result = await uploadWithProgress(files, (progress) => {
        setMessage(`Uploading... ${Math.round(progress)}%`)
      }, uploadTitle.trim(), uploadDescription.trim(), uploadScientificName.trim(), uploadLocation.trim(), uploadTimeTaken.trim(), uploadHistory.trim())
      
      if (result.success) {
        setMessage(`Successfully uploaded ${result.successful.length} images as "${uploadTitle}"!`)
        setFiles([])
        setUploadTitle('')
        setUploadDescription('')
        setUploadScientificName('')
        setUploadLocation('')
        setUploadTimeTaken('')
        setUploadHistory('')
        const modalFileInput = document.getElementById('modal-file-input')
        if (modalFileInput) modalFileInput.value = ''
        // Close the modal
        setShowUploadModal(false)
        // Clear all caches and refresh the gallery
        clearAdminCache()
        clearPaginationCache()
        await loadGalleryImages(1, searchQuery)
      } else {
        setMessage(`Upload failed: ${result.error}`)
      }
    } catch (error) {
      setMessage(`Upload error: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Handle featured gallery upload
  const handleFeaturedUpload = async () => {
    if (files.length === 0 || !featuredUploadTitle.trim()) return
    
    setUploading(true)
    try {
      setMessage('Checking for existing images to replace...')
      
      const result = await uploadFeaturedWithProgress(files, (progress) => {
        setMessage(`Uploading featured image... ${Math.round(progress)}%`)
      }, featuredUploadTitle.trim(), featuredUploadDescription.trim())
      
      if (result.success) {
        setMessage(`Successfully uploaded featured image "${featuredUploadTitle}"!`)
        setFiles([])
        setFeaturedUploadTitle('')
        setFeaturedUploadDescription('')
        const fileInput = document.getElementById('featured-file-input')
        if (fileInput) fileInput.value = ''
        // Clear featured caches and refresh
        clearFeaturedCache()
        await loadFeaturedImages()
      } else {
        setMessage(`Featured upload failed: ${result.error}`)
      }
    } catch (error) {
      setMessage(`Featured upload error: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Handle image deletion with cache invalidation
  const handleDeleteSelected = async () => {
    if (selectedImages.size === 0) {
      setMessage('Please select images to delete')
      return
    }

    setUploading(true)
    let successCount = 0
    let failCount = 0

    for (const imagePath of selectedImages) {
      const result = await deleteImageWithCache(imagePath)
      if (result.success) {
        successCount++
      } else {
        failCount++
      }
    }

    setMessage(`Deleted ${successCount} images${failCount > 0 ? `, ${failCount} failed` : ''}`)
    setSelectedImages(new Set())
    setShowDeleteConfirm(false)
    // Clear all caches and refresh the gallery
    clearAdminCache()
    clearPaginationCache()
    loadGalleryImages(1, searchQuery)
    setUploading(false)
  }

  // Handle featured image deletion
  const handleFeaturedDeleteSelected = async () => {
    if (featuredSelectedImages.size === 0) {
      setMessage('Please select featured images to delete')
      return
    }

    setUploading(true)
    let successCount = 0
    let failCount = 0

    for (const imagePath of featuredSelectedImages) {
      const result = await deleteFeaturedImageWithCache(imagePath)
      if (result.success) {
        successCount++
      } else {
        failCount++
      }
    }

    setMessage(`Deleted ${successCount} featured images${failCount > 0 ? `, ${failCount} failed` : ''}`)
    setFeaturedSelectedImages(new Set())
    setShowDeleteConfirm(false)
    // Clear featured caches and refresh
    clearFeaturedCache()
    await loadFeaturedImages()
    setUploading(false)
  }

  // Toggle image selection
  const toggleImageSelection = (imagePath) => {
    const newSelected = new Set(selectedImages)
    if (newSelected.has(imagePath)) {
      newSelected.delete(imagePath)
    } else {
      newSelected.add(imagePath)
    }
    setSelectedImages(newSelected)
  }

  // Select all images on current page
  const selectAllImages = () => {
    const allImagePaths = galleryImages.map(image => image.path)
    setSelectedImages(new Set(allImagePaths))
  }

  // Deselect all images
  const deselectAllImages = () => {
    setSelectedImages(new Set())
  }

  // Toggle featured image selection
  const toggleFeaturedImageSelection = (imagePath) => {
    const newSelected = new Set(featuredSelectedImages)
    if (newSelected.has(imagePath)) {
      newSelected.delete(imagePath)
    } else {
      newSelected.add(imagePath)
    }
    setFeaturedSelectedImages(newSelected)
  }

  // Handle edit image
  const handleEditImage = (image) => {
    setEditingImage(image)
    setEditForm({
      title: image.title || image.name.replace(/\.[^/.]+$/, ""),
      description: image.description || '',
      scientificName: image.scientificName || '',
      location: image.location || '',
      dateTaken: image.dateTaken || '',
      history: image.history || ''
    })
  }

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingImage) return

    setUploading(true)
    try {
      // Determine if this image is part of a series
      const fileName = editingImage.name.replace(/\.[^/.]+$/, "");
      const seriesMatch = fileName.match(/^(.+?)[._](\d+)$/) || fileName.match(/^(.+?)_(\d+)$/) || fileName.match(/^(.+?)\.(\d+)$/);
      const seriesName = seriesMatch ? seriesMatch[1] : null;
      
      // If it's part of a series, update all images in the series
      if (seriesName) {
        const seriesImages = galleryImages.filter(img => {
          const imgFileName = img.name.replace(/\.[^/.]+$/, "");
          const imgSeriesMatch = imgFileName.match(/^(.+?)[._](\d+)$/) || imgFileName.match(/^(.+?)_(\d+)$/) || imgFileName.match(/^(.+?)\.(\d+)$/);
          return imgSeriesMatch && imgSeriesMatch[1] === seriesName;
        });
        
        // Update all images in the series
        const updatePromises = seriesImages.map(img => 
          updateImageMetadataWithCache(
            img.path, 
            editForm.title.trim(), 
            editForm.description.trim(),
            editForm.scientificName.trim(),
            editForm.location.trim(),
            editForm.dateTaken.trim(),
            editForm.history.trim()
          )
        );
        
        const results = await Promise.all(updatePromises);
        const allSuccessful = results.every(result => result.success);
        
        if (allSuccessful) {
          // Update the local gallery images array for all series images
          const updatedImages = galleryImages.map(img => {
            const imgFileName = img.name.replace(/\.[^/.]+$/, "");
            const imgSeriesMatch = imgFileName.match(/^(.+?)[._](\d+)$/) || imgFileName.match(/^(.+?)_(\d+)$/) || imgFileName.match(/^(.+?)\.(\d+)$/);
            const isInSeries = imgSeriesMatch && imgSeriesMatch[1] === seriesName;
            
            return isInSeries ? { 
              ...img, 
              title: editForm.title.trim(), 
              description: editForm.description.trim(),
              scientificName: editForm.scientificName.trim(),
              location: editForm.location.trim(),
              dateTaken: editForm.dateTaken.trim(),
              history: editForm.history.trim()
            } : img;
          });
          setGalleryImages(updatedImages);
          
          setMessage(`Updated entire "${editForm.title}" series successfully!`);
        } else {
          setMessage(`Update failed for some images in the series`);
        }
      } else {
        // Update single image
      const result = await updateImageMetadataWithCache(
        editingImage.path, 
        editForm.title.trim(), 
          editForm.description.trim(),
          editForm.scientificName.trim(),
          editForm.location.trim(),
          editForm.dateTaken.trim(),
          editForm.history.trim()
      )
      
      if (result.success) {
        // Update the local gallery images array
        const updatedImages = galleryImages.map(img => 
          img.path === editingImage.path 
              ? { 
                  ...img, 
                  title: editForm.title.trim(), 
                  description: editForm.description.trim(),
                  scientificName: editForm.scientificName.trim(),
                  location: editForm.location.trim(),
                  dateTaken: editForm.dateTaken.trim(),
                  history: editForm.history.trim()
                }
            : img
        )
        setGalleryImages(updatedImages)
        
        setMessage(`Updated "${editForm.title}" successfully!`)
      } else {
        setMessage(`Update failed: ${result.error}`)
      }
      }
      
      // Clear pagination cache since metadata changed
      clearPaginationCache()
      setEditingImage(null)
      setEditForm({ title: '', description: '', scientificName: '', location: '', dateTaken: '', history: '' })
      
    } catch (error) {
      setMessage(`Update failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingImage(null)
    setEditForm({ title: '', description: '', scientificName: '', location: '', dateTaken: '', history: '' })
  }

  // Show loading state while checking authentication
  useEffect(() => {
    // Add noindex meta tag for admin page
    const metaRobots = document.createElement('meta')
    metaRobots.name = 'robots'
    metaRobots.content = 'noindex, nofollow'
    document.head.appendChild(metaRobots)
    
    return () => {
      document.head.removeChild(metaRobots)
    }
  }, [])

  if (loading) {
    return (
      <>
        <SEO 
          title="Admin Portal - John Philip Morada Photography"
          description="Admin portal for managing John Philip Morada Photography website"
        />
        <div className="min-h-screen bg-[rgb(var(--bg))] flex items-center justify-center p-4">
        <div className="bg-[rgb(var(--bg))]/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full border border-[rgb(var(--muted))]/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-[rgb(var(--primary))] rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-[rgb(var(--fg))] mb-2">
              Loading Admin Portal
            </h1>
            <p className="text-[rgb(var(--muted))]">Checking authentication...</p>
          </div>
        </div>
      </div>
      </>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <SEO 
          title="Admin Login - John Philip Morada Photography"
          description="Admin login for John Philip Morada Photography website"
        />
        <div className="min-h-screen bg-[rgb(var(--bg))] flex items-center justify-center p-4">
        <div className="bg-[rgb(var(--bg))]/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full border border-[rgb(var(--muted))]/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[rgb(var(--primary))] rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-heading text-[rgb(var(--fg))]">
              Admin Portal
            </h1>
            <p className="text-[rgb(var(--muted))] mt-2 font-medium">John Philip Morada Photography</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[rgb(var(--fg))]">
                Email Address
              </label>
              <div className="relative">
              <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full px-4 py-3 bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/50 focus:border-transparent text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] transition-all duration-200"
                  placeholder="admin@example.com"
                required
              />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[rgb(var(--fg))]">
                Password
              </label>
              <div className="relative">
              <input
                type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-4 py-3 bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/50 focus:border-transparent text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] transition-all duration-200"
                  placeholder="••••••••"
                required
              />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 disabled:bg-[rgb(var(--muted))]/50 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:transform-none disabled:shadow-md"
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
          
          {message && (
            <div className={`mt-6 p-4 rounded-xl text-sm font-medium ${
              typeof message === 'string' && message.includes('Success') 
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700' 
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700'
            }`}>
              {typeof message === 'string' ? message : JSON.stringify(message)}
          </div>
          )}
        </div>
      </div>
      </>
    )
  }

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'gallery', label: 'Main Gallery', icon: Grid3X3 },
    { id: 'featured', label: 'Featured', icon: Star }
  ]

  return (
    <>
      <SEO 
        title="Admin Dashboard - John Philip Morada Photography"
        description="Admin dashboard for managing John Philip Morada Photography website"
      />
      <div className="min-h-screen bg-[rgb(var(--bg))] flex">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} fixed md:fixed z-10 transition-all duration-300 bg-[rgb(var(--bg))]/95 backdrop-blur-xl border-r border-[rgb(var(--muted))]/20 flex flex-col min-h-screen h-screen`}>
        {/* Sidebar Header */}
        <div className="p-6 pt-20 md:pt-24 border-b border-[rgb(var(--muted))]/20 relative">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 bg-[rgb(var(--primary))] rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className={`min-w-0 flex-1 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              <h1 className="text-base sm:text-lg font-bold font-heading text-[rgb(var(--fg))] truncate">
                Admin Panel
              </h1>
              <p className="text-xs text-[rgb(var(--muted))] truncate">John Philip Morada Photography</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 pt-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 transition-all duration-200 group relative ${
                  activeTab === item.id
                    ? 'text-[rgb(var(--fg))] bg-[rgb(var(--primary))]/10 border-l-2 border-[rgb(var(--primary))]'
                    : 'text-[rgb(var(--muted))] hover:bg-[rgb(var(--muted))]/10 hover:text-[rgb(var(--fg))]'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                  <Icon 
                    size={20} 
                    className="flex-shrink-0" 
                  />
                <span className={`font-medium truncate transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[rgb(var(--muted))]/20 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl transition-all duration-200 text-[rgb(var(--muted))] hover:bg-[rgb(var(--muted))]/10 hover:text-[rgb(var(--fg))] group relative`}
            title={sidebarCollapsed ? 'View Portfolio' : ''}
          >
            <Eye size={20} className="flex-shrink-0" />
            <span className={`font-medium truncate transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              View Portfolio
            </span>
          </a>
          <button
            onClick={() => {
              handleLogout()
              setMobileMenuOpen(false)
            }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 group relative`}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className={`font-medium truncate transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              Logout
            </span>
          </button>
        </div>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-[rgb(var(--muted))]/20">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-3'} px-3 py-2 rounded-xl transition-all duration-200 text-[rgb(var(--muted))] hover:bg-[rgb(var(--muted))]/10 hover:text-[rgb(var(--fg))] relative`}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <div className="flex items-center justify-center">
              {sidebarCollapsed ? <ChevronRight size={36} className="text-[rgb(var(--fg))]" /> : <ChevronLeft size={36} className="text-[rgb(var(--fg))]" />}
            </div>
            <span className={`text-sm font-medium transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              Collapse
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} overflow-hidden`}>
        {/* Top Header */}
        <header className="bg-[rgb(var(--bg))]/95 backdrop-blur-xl border-b border-[rgb(var(--muted))]/20 px-6 py-4 mt-14 md:mt-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[rgb(var(--muted))] hover:bg-[rgb(var(--muted))]/10 hover:text-[rgb(var(--fg))] transition-all duration-200 md:hidden"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold font-heading text-[rgb(var(--fg))]">
                  {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                </h1>
                <p className="text-sm text-[rgb(var(--muted))]">
                  {activeTab === 'dashboard' && 'Overview and analytics'}
                  {activeTab === 'analytics' && 'Monitor your portfolio performance'}
                  {activeTab === 'gallery' && 'Manage your photo collection'}
                  {activeTab === 'featured' && 'Curate featured images'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[rgb(var(--muted))]/10 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-[rgb(var(--fg))]">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 pt-12 overflow-y-auto overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[rgb(var(--bg))]/90 backdrop-blur-xl p-6 rounded-2xl border border-[rgb(var(--muted))]/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[rgb(var(--primary))] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <ImageIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold font-heading text-[rgb(var(--fg))]">{galleryImages.length}</p>
                      <p className="text-sm text-[rgb(var(--muted))] font-medium">Total Images</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[rgb(var(--bg))]/90 backdrop-blur-xl p-6 rounded-2xl border border-[rgb(var(--muted))]/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[rgb(var(--primary))]/80 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Palette className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold font-heading text-[rgb(var(--fg))]">
                        {Object.keys(groupImagesBySeries(galleryImages)).filter(key => !key.startsWith('individual_')).length}
                      </p>
                      <p className="text-sm text-[rgb(var(--muted))] font-medium">Photo Series</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[rgb(var(--bg))]/90 backdrop-blur-xl p-6 rounded-2xl border border-[rgb(var(--muted))]/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[rgb(var(--primary))]/60 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold font-heading text-[rgb(var(--fg))]">
                        {Object.keys(groupImagesBySeries(galleryImages)).filter(key => key.startsWith('individual_')).length}
                      </p>
                      <p className="text-sm text-[rgb(var(--muted))] font-medium">Individual Photos</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[rgb(var(--bg))]/90 backdrop-blur-xl rounded-2xl border border-[rgb(var(--muted))]/20 shadow-lg p-6">
                  <h3 className="text-lg sm:text-xl font-bold font-heading text-[rgb(var(--fg))] mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('gallery')}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-[rgb(var(--primary))]/10 hover:bg-[rgb(var(--primary))]/20 text-[rgb(var(--fg))] transition-all duration-200 group"
                    >
                      <Grid3X3 size={20} className="text-[rgb(var(--primary))]" />
                      <div className="text-left">
                        <p className="font-medium">Manage Gallery</p>
                        <p className="text-sm text-[rgb(var(--muted))]">Upload and organize photos</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('featured')}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-[rgb(var(--primary))]/10 hover:bg-[rgb(var(--primary))]/20 text-[rgb(var(--fg))] transition-all duration-200 group"
                    >
                      <Star size={20} className="text-[rgb(var(--primary))]" />
                      <div className="text-left">
                        <p className="font-medium">Featured Gallery</p>
                        <p className="text-sm text-[rgb(var(--muted))]">Curate homepage images</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-[rgb(var(--bg))]/90 backdrop-blur-xl rounded-2xl border border-[rgb(var(--muted))]/20 shadow-lg p-6">
                  <h3 className="text-lg sm:text-xl font-bold font-heading text-[rgb(var(--fg))] mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--muted))]/5">
                      <div className="w-2 h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[rgb(var(--fg))]">Portfolio is live</p>
                        <p className="text-xs text-[rgb(var(--muted))]">Auto-sync enabled</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--muted))]/5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[rgb(var(--fg))]">{galleryImages.length} images ready</p>
                        <p className="text-xs text-[rgb(var(--muted))]">Gallery updated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-8">


        {/* Gallery Management */}
        <div className="bg-[rgb(var(--bg))]/90 backdrop-blur-xl rounded-3xl border border-[rgb(var(--muted))]/20 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-[rgb(var(--muted))]/20 bg-[rgb(var(--primary))]/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-heading text-[rgb(var(--fg))]">
                    Gallery Management
                  </h3>
                    <p className="text-[rgb(var(--muted))]">
                      {galleryImages.length} images in your portfolio
                    </p>
                    <button
                      onClick={() => loadGalleryImages(1, searchQuery)}
                      className="inline-flex items-center gap-2 text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))]/80 font-medium transition-colors duration-200 hover:bg-[rgb(var(--primary))]/10 px-3 py-1 rounded-lg"
                      title="Refresh gallery"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
              </div>
              
              {/* Upload and Selection Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Upload size={16} />
                  Upload
                </button>
                
                {selectedImages.size > 0 ? (
                  <button
                    onClick={deselectAllImages}
                    className="flex items-center gap-2 bg-[rgb(var(--muted))]/20 hover:bg-[rgb(var(--muted))]/30 text-[rgb(var(--fg))] px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  >
                    <X size={16} />
                    Clear
                  </button>
                ) : (
                  <button
                    onClick={selectAllImages}
                    className="flex items-center gap-2 bg-[rgb(var(--primary))]/10 hover:bg-[rgb(var(--primary))]/20 text-[rgb(var(--primary))] px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  >
                    <Check size={16} />
                    Select All
                  </button>
                )}
                
                {selectedImages.size > 0 && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg"
                  >
                    <Trash2 size={18} />
                    Delete ({selectedImages.size})
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-8">
            {/* Search and Pagination Controls */}
            <div className="mb-8 space-y-6">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search images by title or filename..."
                      className="w-full px-4 py-3 pl-12 bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/50 focus:border-transparent text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] transition-all duration-200"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-[rgb(var(--muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors duration-200"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (searchQuery.trim()) {
                        setIsSearching(true);
                        loadGalleryImages(1, searchQuery.trim());
                      } else {
                        setIsSearching(false);
                        loadGalleryImages(1, '');
                      }
                    }}
                    disabled={uploading}
                    className="flex items-center gap-2 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 disabled:bg-[rgb(var(--muted))]/50 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-md"
                  >
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                    {searchQuery.trim() ? 'Search' : 'Load All'}
                  </button>
                  
                  {isSearching && (
                    <button
                      onClick={() => {
                        setIsSearching(false);
                        setSearchQuery('');
                        loadGalleryImages(1, '');
                      }}
                      className="flex items-center gap-2 bg-[rgb(var(--muted))]/20 hover:bg-[rgb(var(--muted))]/30 text-[rgb(var(--fg))] px-4 py-3 rounded-xl font-medium transition-all duration-200"
                    >
                      <X size={16} />
                      Clear Search
                    </button>
                  )}
                </div>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-[rgb(var(--muted))]">
                    {isSearching ? (
                      <span>Search results: {galleryImages.length} images{selectedImages.size > 0 && ` • ${selectedImages.size} selected`}</span>
                    ) : (
                      <span>Page {currentPage} • {galleryImages.length} images on this page{selectedImages.size > 0 && ` • ${selectedImages.size} selected`}</span>
                    )}
                  </div>
                  <button
                    onClick={() => clearPaginationCache()}
                    className="text-xs text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] px-2 py-1 rounded hover:bg-[rgb(var(--muted))]/10 transition-colors duration-200"
                    title="Clear pagination cache"
                  >
                    Clear Cache
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => loadGalleryImages(currentPage - 1, searchQuery.trim())}
                    disabled={currentPage <= 1 || uploading}
                    className="flex items-center gap-2 bg-[rgb(var(--bg))] hover:bg-[rgb(var(--muted))]/10 disabled:bg-[rgb(var(--muted))]/5 text-[rgb(var(--fg))] disabled:text-[rgb(var(--muted))] px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-[rgb(var(--muted))]/20 disabled:border-transparent"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[rgb(var(--muted))]">Page</span>
                    <span className="bg-[rgb(var(--primary))] text-white px-3 py-1 rounded-lg font-semibold text-sm">
                      {currentPage}
                    </span>
                    {hasMore && (
                      <span className="text-xs text-[rgb(var(--muted))]">of many</span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => loadGalleryImages(currentPage + 1, searchQuery.trim())}
                    disabled={!hasMore || uploading}
                    className="flex items-center gap-2 bg-[rgb(var(--bg))] hover:bg-[rgb(var(--muted))]/10 disabled:bg-[rgb(var(--muted))]/5 text-[rgb(var(--fg))] disabled:text-[rgb(var(--muted))] px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-[rgb(var(--muted))]/20 disabled:border-transparent"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {uploading && galleryImages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-[rgb(var(--primary))]/20 to-[rgb(var(--primary))]/10 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg">
                  <div className="w-8 h-8 border-2 border-[rgb(var(--primary))]/30 border-t-[rgb(var(--primary))] rounded-full animate-spin"></div>
                </div>
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold font-heading text-[rgb(var(--fg))] mb-3">
                  {isSearching ? 'Searching...' : 'Loading Images...'}
                </h4>
                <p className="text-[rgb(var(--muted))]">
                  {isSearching ? 'Finding images matching your search...' : 'Fetching your gallery images...'}
                </p>
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-[rgb(var(--muted))]/10 to-[rgb(var(--muted))]/20 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg">
                  <ImageIcon className="w-12 h-12 text-[rgb(var(--muted))]" />
                </div>
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold font-heading text-[rgb(var(--fg))] mb-3">
                  {isSearching ? 'No Search Results' : 'No Images Yet'}
                </h4>
                <p className="text-[rgb(var(--muted))] mb-8 max-w-md mx-auto">
                  {isSearching ? (
                    `No images found matching "${searchQuery}". Try a different search term.`
                  ) : (
                    'Upload your first photos to get started with your portfolio. Create beautiful series or upload individual artworks.'
                  )}
                </p>
                {isSearching ? (
                  <button
                    onClick={() => {
                      setIsSearching(false);
                      setSearchQuery('');
                      loadGalleryImages(1, '');
                    }}
                    className="inline-flex items-center gap-3 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <X size={18} />
                    Clear Search
                  </button>
                ) : (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center gap-3 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus size={18} />
                    Upload Your First Photos
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative group rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                      selectedImages.has(image.path)
                        ? 'border-blue-500 ring-4 ring-blue-200 shadow-xl scale-105'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl'
                    }`}
                    onClick={() => toggleImageSelection(image.path)}
                  >
                    <img
                      src={image.src}
                      alt={image.title}
                      className="w-full h-32 object-cover"
                    />
                    
                    {/* Selection overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center pointer-events-none">
                      {selectedImages.has(image.path) && (
                        <div className="bg-blue-500 text-white rounded-full p-3 shadow-lg scale-110">
                          <Check size={18} />
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditImage(image);
                        }}
                        className="w-8 h-8 bg-[rgb(var(--bg))]/90 rounded-full flex items-center justify-center hover:bg-[rgb(var(--primary))] hover:text-white transition-all duration-200 shadow-lg"
                        title="Edit image details"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImages(new Set([image.path]));
                          setShowDeleteConfirm(true);
                        }}
                        className="w-8 h-8 bg-[rgb(var(--bg))]/90 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-200 shadow-lg"
                        title="Delete image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    {/* Image info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                      <p className="text-white text-sm truncate font-semibold">{image.title}</p>
                      {(() => {
                        const fileName = image.name.replace(/\.[^/.]+$/, "");
                        const seriesMatch = fileName.match(/^(.+?)\.(\d+)$/);
                        if (seriesMatch) {
                          return (
                            <p className="text-white/80 text-xs truncate">
                              Series {seriesMatch[1]} - Part {seriesMatch[2]}
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                  ))}
                </div>
                
                {/* Loading More Indicator */}
                {loadingMore && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 bg-[rgb(var(--bg))]/50 backdrop-blur-sm px-6 py-4 rounded-xl border border-[rgb(var(--muted))]/20">
                      <div className="w-5 h-5 border-2 border-[rgb(var(--primary))]/30 border-t-[rgb(var(--primary))] rounded-full animate-spin"></div>
                      <span className="text-[rgb(var(--fg))] font-medium">Loading more images...</span>
                    </div>
                  </div>
                )}
                
                {/* Pagination Info */}
                {!isSearching && (
                  <div className="flex items-center justify-center py-8">
                    <div className="bg-[rgb(var(--bg))]/50 backdrop-blur-sm px-6 py-4 rounded-xl border border-[rgb(var(--muted))]/20">
                      <div className="text-center">
                        <p className="text-[rgb(var(--fg))] font-medium">
                          Page {currentPage} of {hasMore ? 'many' : currentPage}
                        </p>
                        <p className="text-[rgb(var(--muted))] text-sm mt-1">
                          {galleryImages.length} images on this page
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-lg border backdrop-blur-sm z-50 max-w-sm transition-all duration-300 ${
            (() => {
              if (message.includes('Success') || message.includes('successfully')) {
                return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700';
              } else if (message.includes('Error') || message.includes('Failed') || message.includes('failed') || message.includes('error')) {
                return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700';
              } else if (message.includes('Loading') || message.includes('Uploading') || message.includes('Loaded') || message.includes('Found') || message.includes('cache')) {
                return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700';
              } else if (message.includes('Skipped') || message.includes('Please select')) {
                return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700';
              } else {
                return 'bg-[rgb(var(--muted))]/10 text-[rgb(var(--fg))] border-[rgb(var(--muted))]/20';
              }
            })()
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                (() => {
                  if (typeof message === 'string') {
                    if (message.includes('Success') || message.includes('successfully')) {
                      return 'bg-emerald-500';
                    } else if (message.includes('Error') || message.includes('Failed') || message.includes('failed') || message.includes('error')) {
                      return 'bg-red-500';
                    } else if (message.includes('Loading') || message.includes('Uploading') || message.includes('Loaded') || message.includes('Found') || message.includes('cache')) {
                      return 'bg-blue-500';
                    } else if (message.includes('Skipped') || message.includes('Please select')) {
                      return 'bg-yellow-500';
                    }
                  }
                  return 'bg-slate-500';
                })()
              }`}>
                {(() => {
                  if (typeof message === 'string') {
                    if (message.includes('Success') || message.includes('successfully')) {
                      return <Check size={16} className="text-white" />;
                    } else if (message.includes('Error') || message.includes('Failed') || message.includes('failed') || message.includes('error')) {
                      return <AlertCircle size={16} className="text-white" />;
                    } else if (message.includes('Loading') || message.includes('Uploading') || message.includes('Loaded') || message.includes('Found') || message.includes('cache')) {
                      return <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>;
                    } else if (message.includes('Skipped') || message.includes('Please select')) {
                      return <AlertCircle size={16} className="text-white" />;
                    }
                  }
                  return <AlertCircle size={16} className="text-white" />;
                })()}
              </div>
              <p className="font-medium flex-1">{typeof message === 'string' ? message : JSON.stringify(message)}</p>
              <button
                onClick={() => setMessage('')}
                className="ml-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200"
                title="Close message"
              >
                <X size={16} className="text-current" />
              </button>
            </div>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(var(--bg))]/95 backdrop-blur-xl p-4 rounded-3xl shadow-2xl max-w-md w-full border border-[rgb(var(--muted))]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-heading text-[rgb(var(--fg))]">
                  Delete {activeTab === 'featured' ? 'Featured' : ''} Images
                </h3>
                <p className="text-[rgb(var(--muted))]">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-[rgb(var(--fg))] mb-4">
              Are you sure you want to delete <strong>{selectedImages.size}</strong> selected image(s)?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-[rgb(var(--muted))]/20 hover:bg-[rgb(var(--muted))]/30 text-[rgb(var(--fg))] px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Cancel
                </button>
              <button
                onClick={activeTab === 'featured' ? handleFeaturedDeleteSelected : handleDeleteSelected}
                disabled={uploading}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none"
              >
                {uploading ? 'Deleting...' : `Delete ${activeTab === 'featured' ? 'Featured' : ''} Images`}
              </button>
              </div>
          </div>
        </div>
      )}
            </div>
          )}

        {activeTab === 'featured' && (
          <>

            {/* Featured Upload Section */}
            <div className="bg-[rgb(var(--bg))]/90 backdrop-blur-xl rounded-3xl border border-[rgb(var(--muted))]/20 shadow-xl overflow-hidden">
              <div className="p-8 border-b border-[rgb(var(--muted))]/20 bg-[rgb(var(--primary))]/5">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-[rgb(var(--primary))] rounded-xl flex items-center justify-center shadow-lg">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold font-heading text-[rgb(var(--fg))]">Upload Featured Image</h2>
                    <p className="text-[rgb(var(--muted))] text-sm">Add a single featured image to the homepage</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                {/* Current Featured Photo or Upload Area */}
                {featuredImages.length > 0 ? (
                  <div className="space-y-6">
                    {/* Current Featured Photo */}
                    <div className="bg-[rgb(var(--bg))]/50 rounded-2xl p-6 border border-[rgb(var(--muted))]/20">
                      <h3 className="text-base sm:text-lg font-semibold font-heading text-[rgb(var(--fg))] mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-[rgb(var(--primary))]" />
                        Current Featured Photo
                      </h3>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <img
                            src={featuredImages[0].src}
                            alt={featuredImages[0].title}
                            className="w-48 h-48 object-cover rounded-xl shadow-lg"
                          />
                          <div className="absolute -top-2 -right-2 bg-[rgb(var(--primary))] text-white px-2 py-1 rounded-lg text-xs font-medium">
                            Featured
                  </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-[rgb(var(--fg))] mb-2">{featuredImages[0].title}</h4>
                          <p className="text-[rgb(var(--muted))] text-sm mb-4">{featuredImages[0].name}</p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleEditImage(featuredImages[0])}
                              className="flex items-center gap-2 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                            >
                              <Edit3 size={16} />
                              Edit Details
                            </button>
                            <button
                              onClick={() => {
                                setFeaturedSelectedImages(new Set([featuredImages[0].path]));
                                setShowDeleteConfirm(true);
                              }}
                              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                            >
                              <Trash2 size={16} />
                              Remove
                            </button>
                  </div>
                </div>
              </div>
            </div>

                    {/* Replace Photo Section */}
                    <div className="bg-[rgb(var(--bg))]/50 rounded-2xl p-6 border border-[rgb(var(--muted))]/20">
                      <h3 className="text-base sm:text-lg font-semibold font-heading text-[rgb(var(--fg))] mb-4">
                        Replace Featured Photo
                      </h3>
                      <div
                        className="border-2 border-dashed border-[rgb(var(--muted))]/30 rounded-2xl p-6 text-center hover:border-[rgb(var(--primary))]/50 transition-all duration-300 cursor-pointer bg-[rgb(var(--muted))]/5"
                        onClick={() => document.getElementById('featured-file-input').click()}
                      >
                        <input
                          id="featured-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="space-y-4">
                          <div className="w-12 h-12 bg-[rgb(var(--primary))]/10 rounded-xl mx-auto flex items-center justify-center">
                            <Upload className="w-6 h-6 text-[rgb(var(--primary))]" />
                  </div>
                  <div>
                            <h4 className="text-base font-semibold text-[rgb(var(--fg))] mb-1">
                              {files.length > 0 ? '1 image selected' : 'Click to select new featured image'}
                            </h4>
                            <p className="text-[rgb(var(--muted))] text-sm">
                              This will replace the current featured photo
                            </p>
                  </div>
                </div>
              </div>
                    </div>
                  </div>
                ) : (
                  /* Upload Area for First Featured Photo */
                <div
                  className="border-2 border-dashed border-[rgb(var(--muted))]/30 rounded-2xl p-8 text-center hover:border-[rgb(var(--primary))]/50 transition-all duration-300 cursor-pointer bg-[rgb(var(--muted))]/5"
                  onClick={() => document.getElementById('featured-file-input').click()}
                >
                  <input
                    id="featured-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-[rgb(var(--primary))]/10 rounded-2xl mx-auto flex items-center justify-center">
                      <Upload className="w-8 h-8 text-[rgb(var(--primary))]" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold font-heading text-[rgb(var(--fg))] mb-2">
                        {files.length > 0 ? '1 image selected' : 'Click to select featured image'}
                      </h3>
                      <p className="text-[rgb(var(--muted))] text-sm">
                        Supports JPG, PNG, GIF, WebP formats (single image only)
                      </p>
                    </div>
                  </div>
                </div>
                )}

                {/* File Preview */}
                {files.length > 0 && (
                  <div className="space-y-6">
                    {/* Single Image Preview */}
                    <div className="bg-[rgb(var(--bg))]/50 rounded-2xl p-6 border border-[rgb(var(--muted))]/20">
                        <h3 className="text-base sm:text-lg font-semibold font-heading text-[rgb(var(--fg))] mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Homepage Preview
                      </h3>
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-[rgb(var(--muted))]/20">
                        <div className="max-w-md mx-auto">
                          {(() => {
                            const file = files[0]
                            if (!file) return null
                            
                            // Auto-fit container based on image orientation
                            const dimensions = previewImageDimensions[0]
                            const aspectRatio = dimensions?.aspectRatio || 1
                            const isPortrait = dimensions ? dimensions.aspectRatio < 1 : false
                            
                            const containerClass = isPortrait 
                              ? 'aspect-[3/4] max-w-sm mx-auto' // Portrait: taller container
                              : 'aspect-[4/3] w-full' // Landscape: wider container
                            
                            return (
                              <div className={`relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${containerClass}`}>
                                <img
                                  src={file instanceof File ? URL.createObjectURL(file) : file.src || '#'}
                                  alt={file.name || 'Image'}
                                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                                  onLoad={(e) => {
                                    const { naturalWidth, naturalHeight } = e.target
                                    handlePreviewImageLoad(0, naturalWidth, naturalHeight)
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
                                      {file.name ? file.name.replace(/\.[^/.]+$/, "") : 'Image'}
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
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Form */}
                {files.length > 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[rgb(var(--fg))] mb-2">
                        Featured Title *
                      </label>
                      <input
                        type="text"
                        value={featuredUploadTitle}
                        onChange={(e) => setFeaturedUploadTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-[rgb(var(--bg))]/50 border border-[rgb(var(--muted))]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/50 focus:border-transparent text-[rgb(var(--fg))] placeholder-[rgb(var(--muted-fg))] transition-all duration-200"
                        placeholder="Enter featured title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[rgb(var(--fg))] mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        value={featuredUploadDescription}
                        onChange={(e) => setFeaturedUploadDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-[rgb(var(--bg))]/50 border border-[rgb(var(--muted))]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/50 focus:border-transparent text-[rgb(var(--fg))] placeholder-[rgb(var(--muted-fg))] resize-none transition-all duration-200"
                        placeholder="Enter description..."
                      />
                    </div>

                    <button
                      onClick={handleFeaturedUpload}
                      disabled={uploading || !featuredUploadTitle.trim()}
                      className="w-full bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 disabled:bg-[rgb(var(--primary))]/50 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none flex items-center justify-center gap-3"
                    >
                      {uploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Uploading Featured Images...
                        </>
                      ) : (
                        <>
                          <Upload size={20} />
                          Upload {files.length} Featured Image{files.length > 1 ? 's' : ''}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

          </>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="modal-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowUploadModal(false)}
            />
            
            {/* Modal Content */}
            <div className="modal-content relative w-full max-w-6xl max-h-[90vh] bg-[rgb(var(--bg))]/95 backdrop-blur-xl rounded-3xl border border-[rgb(var(--muted))]/20 shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-4 border-b border-[rgb(var(--muted))]/20 bg-[rgb(var(--primary))]/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[rgb(var(--primary))] rounded-lg flex items-center justify-center shadow-lg">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-heading text-[rgb(var(--fg))]">Upload New Photos</h3>
                      <p className="text-[rgb(var(--muted))]">
                        Create beautiful series or upload individual artworks
                      </p>
                    </div>
                  </div>
                          <button
                    onClick={() => setShowUploadModal(false)}
                    className="w-8 h-8 bg-[rgb(var(--muted))]/20 hover:bg-[rgb(var(--muted))]/30 rounded-lg flex items-center justify-center transition-all duration-200 group"
                  >
                    <X className="w-4 h-4 text-[rgb(var(--fg))] group-hover:text-[rgb(var(--primary))] transition-colors duration-200" />
                          </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="p-4 max-h-[calc(90vh-100px)] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Left Column - Upload Area and Image Previews */}
                  <div className="lg:col-span-3 space-y-6">
                    {/* Upload Area */}
                    <div className="bg-[rgb(var(--bg))]/50 rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 bg-[rgb(var(--primary))] rounded-xl flex items-center justify-center shadow-lg">
                          <ImageIcon className="w-5 h-5 text-white" />
                          </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold font-heading text-[rgb(var(--fg))]">
                            {files.length > 0 ? 'Selected Images' : 'Upload Images'}
                          </h3>
                          <p className="text-[rgb(var(--muted))]">
                            {files.length > 0 
                              ? `${files.length} ${files.length === 1 ? 'image' : 'images'} ready for upload`
                              : 'Click below or drag and drop your images'
                            }
                          </p>
                        </div>
                        {files.length > 0 && (
                          <button
                            onClick={() => {
                              setFiles([])
                              setUploadTitle('')
                              setUploadDescription('')
                              const fileInput = document.getElementById('modal-file-input')
                              if (fileInput) fileInput.value = ''
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                          >
                            <Trash2 size={16} />
                            Clear All
                          </button>
                        )}
                      </div>

                      {/* Upload Drop Zone */}
                      <div className="relative">
                        <input
                          id="modal-file-input"
                          type="file"
                          multiple
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div 
                          className="border-2 border-dashed border-[rgb(var(--muted))]/30 rounded-2xl p-8 text-center hover:border-[rgb(var(--primary))]/50 transition-all duration-300 cursor-pointer bg-[rgb(var(--bg))]/30 hover:bg-[rgb(var(--primary))]/5"
                          onClick={() => document.getElementById('modal-file-input').click()}
                        >
                          <div className="w-16 h-16 bg-[rgb(var(--primary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold font-heading text-[rgb(var(--fg))] mb-2">
                            {files.length > 0 ? 'Add More Images' : 'Add Your Photos'}
                          </h3>
                          <p className="text-sm text-[rgb(var(--muted))]">
                            Click here or drag and drop your images
                          </p>
                        </div>
                      </div>

                      {/* Image Previews */}
                      {files.length > 0 && (
                        <div className="mt-6">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {files.map((file, index) => (
                              <div key={index} className="relative group cursor-pointer">
                                <div className="aspect-square rounded-2xl overflow-hidden border-2 border-[rgb(var(--muted))]/20 group-hover:border-[rgb(var(--primary))]/50 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-110 group-hover:z-10">
                                  <img
                                    src={file instanceof File ? URL.createObjectURL(file) : file.src || '#'}
                                    alt={file.name || 'Image'}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                </div>
                                
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[rgb(var(--primary))] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                                  {index + 1}
                                </div>
                                <button
                                  onClick={() => {
                                    const newFiles = files.filter((_, i) => i !== index)
                                    setFiles(newFiles)
                                    if (newFiles.length === 0) {
                                      setUploadTitle('')
                                      setUploadDescription('')
                                      const fileInput = document.getElementById('modal-file-input')
                                      if (fileInput) fileInput.value = ''
                                    }
                                  }}
                                  className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg"
                                  title="Remove this image"
                                >
                                  ×
                                </button>
                      </div>
                    ))}
                          </div>
                  </div>
                )}
              </div>
            </div>

                  {/* Right Column - Series Details */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[rgb(var(--bg))]/50 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-[rgb(var(--primary))]/80 rounded-lg flex items-center justify-center">
                          <Edit3 className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold font-heading text-[rgb(var(--fg))]">
                          Series Details
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-[rgb(var(--fg))] mb-2">
                            Series Title *
                          </label>
                          <input
                            type="text"
                            value={uploadTitle}
                            onChange={(e) => setUploadTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/50 focus:border-transparent text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] transition-all duration-200 font-medium"
                            placeholder="Enter series title"
                            required
                          />
                          <div className="mt-2 flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
                            {files.length > 1 ? (
                              <>
                                <div className="w-2 h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                                <span>Will be grouped as a series</span>
                              </>
                            ) : files.length === 1 ? (
                              <>
                                <div className="w-2 h-2 bg-[rgb(var(--primary))]/60 rounded-full"></div>
                                <span>Will be uploaded individually</span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 bg-[rgb(var(--muted))]/40 rounded-full"></div>
                                <span>Upload images to see status</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-[rgb(var(--fg))] mb-2">
                            Scientific Name
                          </label>
                          <input
                            type="text"
                            value={uploadScientificName}
                            onChange={(e) => setUploadScientificName(e.target.value)}
                            className="w-full px-4 py-3 bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/50 focus:border-transparent text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] transition-all duration-200"
                            placeholder="e.g., Panthera leo"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-[rgb(var(--fg))] mb-2">
                            Description
                          </label>
                          <textarea
                            value={uploadDescription}
                            onChange={(e) => setUploadDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/50 focus:border-transparent text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] transition-all duration-200 resize-none"
                            placeholder="Describe your series or add context..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-[rgb(var(--fg))] mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            value={uploadLocation}
                            onChange={(e) => setUploadLocation(e.target.value)}
                            className="w-full px-4 py-3 bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/50 focus:border-transparent text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] transition-all duration-200"
                            placeholder="e.g., Serengeti National Park, Tanzania"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-[rgb(var(--fg))] mb-2">
                            Date Taken
                          </label>
                          <input
                            type="text"
                            value={uploadTimeTaken}
                            onChange={(e) => setUploadTimeTaken(e.target.value)}
                            className="w-full px-4 py-3 bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/50 focus:border-transparent text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] transition-all duration-200"
                            placeholder="e.g., March 15, 2024"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-[rgb(var(--fg))] mb-2">
                            History (Optional)
                          </label>
                          <textarea
                            value={uploadHistory}
                            onChange={(e) => setUploadHistory(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/50 focus:border-transparent text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] transition-all duration-200 resize-none"
                            placeholder="Add any interesting history or context about this photo..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Upload Button */}
                    <button
                      onClick={handleUpload}
                      disabled={uploading || files.length === 0 || !uploadTitle.trim()}
                      className="w-full bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 disabled:bg-[rgb(var(--muted))]/50 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-md flex items-center justify-center gap-3"
                    >
                      {uploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Uploading {files.length} images...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Upload {files.length} Images {files.length > 1 ? 'as Series' : ''}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Edit Image Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-[rgb(var(--bg))]/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full h-[95vh] sm:h-[90vh] flex flex-col border border-[rgb(var(--muted))]/20">
            {/* Modal Header */}
            <div className="p-4 border-b border-[rgb(var(--muted))]/20 bg-[rgb(var(--primary))]/5">
              <div className="flex items-center justify-between">
              <div>
                  <h3 className="text-lg sm:text-xl font-bold font-heading text-[rgb(var(--fg))]">
                    Edit Photo Details
                </h3>
                  <p className="text-[rgb(var(--muted))]">
                    {(() => {
                      const fileName = editingImage.name.replace(/\.[^/.]+$/, "");
                      const seriesMatch = fileName.match(/^(.+?)[._](\d+)$/) || fileName.match(/^(.+?)_(\d+)$/) || fileName.match(/^(.+?)\.(\d+)$/);
                      return seriesMatch ? `Update entire "${seriesMatch[1]}" series` : "";
                    })()}
                  </p>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="w-8 h-8 bg-[rgb(var(--muted))]/20 hover:bg-[rgb(var(--muted))]/30 rounded-lg flex items-center justify-center transition-all duration-200 group"
                >
                  <X className="w-4 h-4 text-[rgb(var(--fg))] group-hover:text-[rgb(var(--primary))] transition-colors duration-200" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto min-h-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Left Column - Photo Preview */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="bg-[rgb(var(--bg))]/50 rounded-2xl p-4 sm:p-6">
                    <div className="relative">
              <img
                src={editingImage.src}
                alt={editingImage.title}
                        className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-xl shadow-lg"
                      />
                      {(() => {
                        const fileName = editingImage.name.replace(/\.[^/.]+$/, "");
                        const seriesMatch = fileName.match(/^(.+?)\.(\d+)$/);
                        if (seriesMatch) {
                          return (
                            <div className="absolute top-3 left-3 bg-[rgb(var(--primary))] text-white px-3 py-1 rounded-lg text-sm font-medium">
                              Part {seriesMatch[2]}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <div className="mt-4 p-4 bg-[rgb(var(--bg))] rounded-lg">
                      <p className="text-sm text-[rgb(var(--muted))] mb-1">File Name</p>
                      <p className="font-medium text-[rgb(var(--fg))]">{editingImage.name}</p>
                    </div>
            </div>

                  {/* Series Photos Preview */}
                  {(() => {
                    const fileName = editingImage.name.replace(/\.[^/.]+$/, "");
                    // Try multiple patterns for series detection
                    const seriesMatch = fileName.match(/^(.+?)[._](\d+)$/) || fileName.match(/^(.+?)_(\d+)$/) || fileName.match(/^(.+?)\.(\d+)$/);
                    
                    if (seriesMatch) {
                      const seriesName = seriesMatch[1];
                      const seriesImages = galleryImages.filter(img => {
                        const imgFileName = img.name.replace(/\.[^/.]+$/, "");
                        // Try the same patterns for filtering
                        const imgSeriesMatch = imgFileName.match(/^(.+?)[._](\d+)$/) || imgFileName.match(/^(.+?)_(\d+)$/) || imgFileName.match(/^(.+?)\.(\d+)$/);
                        return imgSeriesMatch && imgSeriesMatch[1] === seriesName;
                      }).sort((a, b) => {
                        const aMatch = a.name.match(/[._](\d+)\./) || a.name.match(/[._](\d+)$/);
                        const bMatch = b.name.match(/[._](\d+)\./) || b.name.match(/[._](\d+)$/);
                        const aNum = parseInt(aMatch?.[1] || '0');
                        const bNum = parseInt(bMatch?.[1] || '0');
                        return aNum - bNum;
                      });

                      return (
                        <div className="bg-[rgb(var(--bg))]/50 rounded-2xl p-4 sm:p-6">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {seriesImages.map((img, index) => {
                              const isCurrentImage = img.path === editingImage.path;
                              return (
                                <div
                                  key={index}
                                  onClick={() => handleEditImage(img)}
                                  className={`relative group rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                                    isCurrentImage
                                      ? 'border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary))]/30'
                                      : 'border-[rgb(var(--muted))]/20 hover:border-[rgb(var(--primary))]/40 hover:scale-105'
                                  }`}
                                >
                                  <img
                                    src={img.src}
                                    alt={img.title}
                                    className="w-full h-20 object-cover"
                                  />
                                  <div className="absolute top-1 left-1 bg-[rgb(var(--primary))] text-white px-2 py-1 rounded text-xs font-medium">
                                    {(img.name.match(/[._](\d+)\./) || img.name.match(/[._](\d+)$/))?.[1] || index + 1}
                                  </div>
                                  {isCurrentImage && (
                                    <div className="absolute inset-0 bg-[rgb(var(--primary))]/20 flex items-center justify-center">
                                      <div className="bg-[rgb(var(--primary))] text-white rounded-full p-1">
                                        <Check size={12} />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-sm text-[rgb(var(--muted))] mt-3">
                            Changes will be applied to all {seriesImages.length} photos in this series
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Right Column - Form Fields */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-[rgb(var(--bg))]/50 rounded-2xl p-4 sm:p-6">
                    
                    <div className="space-y-4">
              <div>
                        <label className="block text-sm font-semibold text-[rgb(var(--fg))] mb-2">
                          Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          className="w-full px-4 py-3 bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/50 focus:border-transparent text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] transition-all duration-200"
                          placeholder="Enter photo title"
                  required
                />
              </div>

              <div>
                        <label className="block text-sm font-semibold text-[rgb(var(--fg))] mb-2">
                          Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={3}
                          className="w-full px-4 py-3 bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/50 focus:border-transparent text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] transition-all duration-200 resize-none"
                          placeholder="Enter photo description..."
                />
              </div>

                      <div>
                        <label className="block text-sm font-semibold text-[rgb(var(--fg))] mb-2">
                          Scientific Name
                        </label>
                        <input
                          type="text"
                          value={editForm.scientificName}
                          onChange={(e) => setEditForm({...editForm, scientificName: e.target.value})}
                          className="w-full px-4 py-3 bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/50 focus:border-transparent text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] transition-all duration-200"
                          placeholder="e.g., Panthera leo"
                        />
            </div>

                      <div>
                        <label className="block text-sm font-semibold text-[rgb(var(--fg))] mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                          className="w-full px-4 py-3 bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/50 focus:border-transparent text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] transition-all duration-200"
                          placeholder="e.g., Serengeti National Park, Tanzania"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[rgb(var(--fg))] mb-2">
                          Date Taken
                        </label>
                        <input
                          type="text"
                          value={editForm.dateTaken}
                          onChange={(e) => setEditForm({...editForm, dateTaken: e.target.value})}
                          className="w-full px-4 py-3 bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/50 focus:border-transparent text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] transition-all duration-200"
                          placeholder="e.g., March 15, 2024"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[rgb(var(--fg))] mb-2">
                          History & Context
                        </label>
                        <textarea
                          value={editForm.history}
                          onChange={(e) => setEditForm({...editForm, history: e.target.value})}
                          rows={3}
                          className="w-full px-4 py-3 bg-[rgb(var(--bg))] border border-[rgb(var(--muted))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/50 focus:border-transparent text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] transition-all duration-200 resize-none"
                          placeholder="Add any interesting history or context about this photo..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 p-3 border-t border-[rgb(var(--muted))]/20 bg-[rgb(var(--bg))]/50">
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                onClick={handleCancelEdit}
                  className="w-full sm:w-auto px-4 py-2 bg-[rgb(var(--muted))]/20 hover:bg-[rgb(var(--muted))]/30 text-[rgb(var(--fg))] rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-1"
              >
                  <X size={14} />
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={uploading || !editForm.title.trim()}
                  className="w-full sm:w-auto px-4 py-2 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 disabled:bg-[rgb(var(--muted))]/50 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <AnalyticsDashboard />
            </div>
          )}

        </main>
      </div>
    </div>
    </>
  )
}
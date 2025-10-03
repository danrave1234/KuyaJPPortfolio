import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { uploadMultipleImages, deleteImage, getImagesFromFolder } from '../firebase/storage'
import { getAdminGalleryImages, searchAdminGalleryImages, clearAdminCache, cleanupAdminCache, uploadWithProgress, deleteImageWithCache } from '../firebase/admin-api'
import { signInUser, signOutUser } from '../firebase/auth'
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
  Zap,
  Edit3,
  Save,
  X
} from 'lucide-react'

export default function Admin() {
  const { user, isAuthenticated } = useAuth()
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [galleryImages, setGalleryImages] = useState([])
  const [selectedImages, setSelectedImages] = useState(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', description: '' })
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  
  // Admin pagination and search state
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

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

  // Load gallery images with caching
  const loadGalleryImages = async (page = 1, searchQuery = '') => {
    setUploading(true)
    try {
      let result;
      if (searchQuery.trim()) {
        result = await searchAdminGalleryImages('gallery', searchQuery, page, 50);
      } else {
        result = await getAdminGalleryImages('gallery', page, 50);
      }
      
      if (result.success) {
        if (page === 1) {
          setGalleryImages(result.images);
        } else {
          setGalleryImages(prev => [...prev, ...result.images]);
        }
        setCurrentPage(page);
        setHasMore(result.pagination?.hasMore || false);
        setMessage(`Loaded ${result.images.length} images`);
      } else {
        setMessage(`Failed to load images: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error loading images: ${error.message}`);
    } finally {
      setUploading(false);
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

  // Load images when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      cleanupAdminCache()
      loadGalleryImages()
    }
  }, [isAuthenticated])

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    
    // Filter out non-image files
    const imageFiles = selectedFiles.filter(file => {
      const isValidImage = file.type.startsWith('image/')
      if (!isValidImage) {
        setMessage(`Skipped ${file.name} - Only image files are supported`)
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

  // Handle file upload with cache invalidation
  const handleUpload = async () => {
    if (files.length === 0 || !uploadTitle.trim()) return
    
    setUploading(true)
    try {
      const result = await uploadWithProgress(files, (progress) => {
        setMessage(`Uploading... ${Math.round(progress)}%`)
      })
      
      if (result.success) {
        setMessage(`Successfully uploaded ${result.successful.length} images as "${uploadTitle}"!`)
        setFiles([])
        setUploadTitle('')
        setUploadDescription('')
        const fileInput = document.getElementById('file-input')
        if (fileInput) fileInput.value = ''
        // Clear caches and refresh the gallery
        clearAdminCache()
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
    // Clear caches and refresh the gallery
    clearAdminCache()
    loadGalleryImages(1, searchQuery)
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

  // Handle edit image
  const handleEditImage = (image) => {
    setEditingImage(image)
    setEditForm({
      title: image.title || image.name.replace(/\.[^/.]+$/, ""),
      description: image.description || ''
    })
  }

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingImage) return

    setUploading(true)
    try {
      // Update the image in the gallery images array
      const updatedImages = galleryImages.map(img => 
        img.path === editingImage.path 
          ? { ...img, title: editForm.title, description: editForm.description }
          : img
      )
      setGalleryImages(updatedImages)
      
      // Here you would typically save to Firebase or a database
      // For now, we'll just update the local state
      
      setMessage(`Updated "${editForm.title}" successfully!`)
      setEditingImage(null)
      setEditForm({ title: '', description: '' })
    } catch (error) {
      setMessage(`Update failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingImage(null)
    setEditForm({ title: '', description: '' })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 dark:border-slate-700/50">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">Kuya JP Photography</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
              <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent dark:text-white placeholder-slate-400 transition-all duration-200"
                  placeholder="admin@example.com"
                required
              />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
              <input
                type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent dark:text-white placeholder-slate-400 transition-all duration-200"
                  placeholder="••••••••"
                required
              />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:transform-none disabled:shadow-md"
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
              message.includes('Success') 
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700' 
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700'
            }`}>
              {message}
          </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[rgb(var(--bg))]/95 backdrop-blur-xl border-b border-[rgb(var(--muted))]/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[rgb(var(--primary))] rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[rgb(var(--fg))]">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-[rgb(var(--muted))]">Kuya JP Photography</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[rgb(var(--muted))]/10 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-[rgb(var(--fg))]">
                  {user?.email}
                </span>
              </div>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 text-white rounded-lg font-medium transition-all duration-200"
              >
                <Eye size={16} />
                <span className="hidden sm:inline">View Portfolio</span>
              </a>
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--muted))]/20 hover:bg-[rgb(var(--muted))]/30 text-[rgb(var(--fg))] rounded-lg font-medium transition-all duration-200"
            >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
            </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 pt-24 pb-12 space-y-8">
        {/* Welcome Section */}
        <div className="bg-[rgb(var(--bg))]/90 backdrop-blur-xl rounded-3xl p-8 border border-[rgb(var(--muted))]/20 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-[rgb(var(--primary))] rounded-2xl flex items-center justify-center shadow-lg">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-[rgb(var(--fg))] mb-2">
                  Welcome back, Admin! 👋
                </h2>
                <p className="text-[rgb(var(--muted))] text-lg">
                  Manage your photography portfolio with ease
                </p>
              </div>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Eye size={20} />
              Preview Portfolio
            </a>
          </div>
        </div>

          {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[rgb(var(--bg))]/90 backdrop-blur-xl p-6 rounded-2xl border border-[rgb(var(--muted))]/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[rgb(var(--primary))] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <ImageIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-[rgb(var(--fg))]">{galleryImages.length}</p>
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
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {Object.keys(groupImagesBySeries(galleryImages)).filter(key => !key.startsWith('individual_')).length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Photo Series</p>
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--bg))]/90 backdrop-blur-xl p-6 rounded-2xl border border-[rgb(var(--muted))]/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[rgb(var(--primary))]/60 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {Object.keys(groupImagesBySeries(galleryImages)).filter(key => key.startsWith('individual_')).length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Individual Photos</p>
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--bg))]/90 backdrop-blur-xl p-6 rounded-2xl border border-[rgb(var(--muted))]/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[rgb(var(--primary))]/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">Live</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Auto-Sync</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-[rgb(var(--bg))]/90 backdrop-blur-xl rounded-3xl border border-[rgb(var(--muted))]/20 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-[rgb(var(--muted))]/20 bg-[rgb(var(--primary))]/5">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-[rgb(var(--primary))] rounded-xl flex items-center justify-center shadow-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[rgb(var(--fg))]">Upload New Photos</h3>
                <p className="text-[rgb(var(--muted))]">
                  Create beautiful series or upload individual artworks
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
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
                      <h3 className="text-xl font-bold text-[rgb(var(--fg))]">
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
                          const fileInput = document.getElementById('file-input')
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
                      id="file-input"
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div 
                      className="border-2 border-dashed border-[rgb(var(--muted))]/30 rounded-2xl p-8 text-center hover:border-[rgb(var(--primary))]/50 transition-all duration-300 cursor-pointer bg-[rgb(var(--bg))]/30 hover:bg-[rgb(var(--primary))]/5"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <div className="w-16 h-16 bg-[rgb(var(--primary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-[rgb(var(--fg))] mb-2">
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
                                src={URL.createObjectURL(file)}
                                alt={file.name}
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
                                  const fileInput = document.getElementById('file-input')
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

              {/* Right Column - Series Details (Always Visible) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[rgb(var(--bg))]/50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-[rgb(var(--primary))]/80 rounded-lg flex items-center justify-center">
                      <Edit3 className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--fg))]">
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

        {/* Gallery Management */}
        <div className="bg-[rgb(var(--bg))]/90 backdrop-blur-xl rounded-3xl border border-[rgb(var(--muted))]/20 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-[rgb(var(--muted))]/20 bg-[rgb(var(--primary))]/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[rgb(var(--primary))]/80 rounded-xl flex items-center justify-center shadow-lg">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[rgb(var(--fg))]">
                    Gallery Management
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-[rgb(var(--muted))]">
                      {galleryImages.length} images in your portfolio
                    </p>
                    <button
                      onClick={loadGalleryImages}
                      className="inline-flex items-center gap-2 text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))]/80 font-medium transition-colors duration-200 hover:bg-[rgb(var(--primary))]/10 px-3 py-1 rounded-lg"
                      title="Refresh gallery"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                    <a
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))]/80 font-medium transition-colors duration-200 hover:bg-[rgb(var(--primary))]/10 px-3 py-1 rounded-lg"
                    >
                      <Eye size={14} />
                      View Live
                    </a>
                  </div>
                </div>
              </div>
              
              {selectedImages.size > 0 && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-3 bg-[rgb(var(--muted))]/20 hover:bg-[rgb(var(--muted))]/30 text-[rgb(var(--fg))] px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg"
                >
                  <Trash2 size={18} />
                  Delete Selected ({selectedImages.size})
                </button>
              )}
            </div>
          </div>
          
          <div className="p-8">
            {galleryImages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg">
                  <ImageIcon className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                </div>
                <h4 className="text-2xl font-bold text-[rgb(var(--fg))] mb-3">No Images Yet</h4>
                <p className="text-[rgb(var(--muted))] mb-8 max-w-md mx-auto">
                  Upload your first photos to get started with your portfolio. Create beautiful series or upload individual artworks.
                </p>
                <button
                  onClick={() => document.getElementById('file-input').click()}
                  className="inline-flex items-center gap-3 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus size={18} />
                  Upload Your First Photos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative group rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImages.has(image.path)
                        ? 'border-blue-500 ring-4 ring-blue-200 shadow-xl scale-105'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl'
                    }`}
                  >
                    <img
                      src={image.src}
                      alt={image.title}
                      className="w-full h-32 object-cover cursor-pointer"
                      onClick={() => toggleImageSelection(image.path)}
                    />
                    
                    {/* Selection overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      {selectedImages.has(image.path) && (
                        <div className="bg-blue-500 text-white rounded-full p-3 shadow-lg scale-110">
                          <Check size={18} />
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => handleEditImage(image)}
                        className="w-8 h-8 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all duration-200 shadow-lg"
                        title="Edit image details"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedImages(new Set([image.path]));
                          setShowDeleteConfirm(true);
                        }}
                        className="w-8 h-8 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-200 shadow-lg"
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
            )}
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-lg border backdrop-blur-sm z-50 max-w-sm ${
            message.includes('Success') 
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700' 
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                message.includes('Success') 
                  ? 'bg-emerald-500' 
                  : 'bg-red-500'
              }`}>
                {message.includes('Success') ? (
                  <Check size={16} className="text-white" />
                ) : (
                  <AlertCircle size={16} className="text-white" />
                )}
              </div>
              <p className="font-medium">{message}</p>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 dark:border-slate-700/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Delete Images
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Are you sure you want to delete <strong>{selectedImages.size}</strong> selected image(s)?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-xl font-medium transition-colors duration-200"
              >
                Cancel
                </button>
              <button
                onClick={handleDeleteSelected}
                disabled={uploading}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none"
              >
                {uploading ? 'Deleting...' : 'Delete Images'}
                </button>
              </div>
          </div>
        </div>
      )}

      {/* Edit Image Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 dark:border-slate-700/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Edit3 className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Edit Image Details
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Update title and description
                </p>
              </div>
            </div>

            {/* Image Preview */}
            <div className="mb-6">
              <img
                src={editingImage.src}
                alt={editingImage.title}
                className="w-full h-32 object-cover rounded-xl"
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Image Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent dark:text-white placeholder-slate-400 transition-all duration-200"
                  placeholder="Enter image title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent dark:text-white placeholder-slate-400 transition-all duration-200 resize-none"
                  placeholder="Enter image description..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={uploading || !editForm.title.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none flex items-center justify-center gap-2"
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
      )}
    </div>
  )
}
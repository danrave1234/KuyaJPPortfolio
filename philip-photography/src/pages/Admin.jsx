import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, Settings, Eye, Trash2, Plus, LogOut, X, Check, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { signInUser, signOutUser } from '../firebase/auth'
import { uploadMultipleImages, getImagesFromFolder, deleteImage } from '../firebase/storage'

export default function Admin() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState([])
  const [galleryImages, setGalleryImages] = useState([])
  const [message, setMessage] = useState('')
  const [selectedImages, setSelectedImages] = useState(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Handle Firebase login
  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')
    const { user, error } = await signInUser(loginForm.email, loginForm.password)
    
    if (user) {
      setMessage('Successfully logged in!')
      setLoginForm({ email: '', password: '' })
      loadGalleryImages()
    } else {
      setMessage(`Login failed: ${error}`)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    const { error } = await signOutUser()
    if (!error) {
      setMessage('Successfully logged out!')
      setGalleryImages([])
    } else {
      setMessage(`Logout error: ${error}`)
    }
  }

  // Load gallery images from Firebase Storage
  const loadGalleryImages = async () => {
    const result = await getImagesFromFolder('gallery')
    if (result.success) {
      setGalleryImages(result.images)
    } else {
      setMessage(`Failed to load images: ${result.error}`)
    }
  }

  // Load images when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadGalleryImages()
    }
  }, [isAuthenticated])

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(selectedFiles)
  }

  // Handle image upload
  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage('Please select files to upload')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const result = await uploadMultipleImages(files, 'gallery')
      
      if (result.success) {
        setMessage(`Successfully uploaded ${result.successful.length} images!`)
        setFiles([])
        document.getElementById('file-input').value = ''
        loadGalleryImages() // Refresh the gallery
      } else {
        setMessage(`Upload failed: ${result.error}`)
      }
    } catch (error) {
      setMessage(`Upload error: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Handle image deletion
  const handleDeleteSelected = async () => {
    if (selectedImages.size === 0) {
      setMessage('Please select images to delete')
      return
    }

    setUploading(true)
    let successCount = 0
    let failCount = 0

    for (const imagePath of selectedImages) {
      const result = await deleteImage(imagePath)
      if (result.success) {
        successCount++
      } else {
        failCount++
      }
    }

    setMessage(`Deleted ${successCount} images${failCount > 0 ? `, ${failCount} failed` : ''}`)
    setSelectedImages(new Set())
    setShowDeleteConfirm(false)
    loadGalleryImages() // Refresh the gallery
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Access</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Kuya JP Photography Dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="Enter your password"
                required
              />
            </div>
            
            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.includes('Success') 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {message}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Login
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft size={16} />
              Back to Portfolio
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20">
      {/* Admin Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 fixed top-0 left-0 right-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Portfolio</span>
              </button>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Photo Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Welcome, {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Message Display */}
      {message && (
        <div className="container mx-auto px-4 py-4">
          <div className={`p-3 rounded-md text-sm ${
            message.includes('Success') || message.includes('uploaded') || message.includes('Deleted')
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {message}
          </div>
        </div>
      )}

      {/* Admin Dashboard */}
      <main className="container mx-auto px-4 py-8">
        {/* Upload Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Upload Photos</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  dark:file:bg-blue-900/30 dark:file:text-blue-400"
              />
              <button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md transition-colors"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload {files.length > 0 && `(${files.length})`}
                  </>
                )}
              </button>
            </div>
            {files.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Selected files: {files.map(f => f.name).join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Management */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Gallery Images ({galleryImages.length})
              </h2>
              {selectedImages.size > 0 && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                  Delete Selected ({selectedImages.size})
                </button>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {galleryImages.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="mx-auto text-slate-400 dark:text-slate-500 mb-4" size={48} />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Images Found</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Upload some photos to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImages.has(image.path)
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => toggleImageSelection(image.path)}
                  >
                    <img
                      src={image.src}
                      alt={image.title}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      {selectedImages.has(image.path) && (
                        <div className="bg-blue-500 text-white rounded-full p-1">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                      <p className="text-white text-xs truncate">{image.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Delete Images
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete {selectedImages.size} selected image(s)? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={uploading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md transition-colors"
              >
                {uploading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


// Admin API service for gallery management with caching
const functionsURL = 'https://asia-southeast1-kuyajp-portfolio.cloudfunctions.net';

// Admin gallery images with caching
export const getAdminGalleryImages = async (folder = 'gallery', page = 1, limit = 50) => {
  try {
    // Check cache first
    const cacheKey = `admin-gallery-${folder}-${page}-${limit}`;
    const cachedResults = sessionStorage.getItem(`admin-cache-${cacheKey}`);
    
    if (cachedResults) {
      const parsed = JSON.parse(cachedResults);
      const now = Date.now();
      const cacheExpiry = 5 * 60 * 1000; // 5 minutes for admin cache
      
      if (parsed.timestamp && (now - parsed.timestamp) < cacheExpiry) {
        return parsed.data;
      }
    }

    const response = await fetch(`${functionsURL}/getAdminGalleryImages?folder=${folder}&page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the results
    if (data.success) {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      sessionStorage.setItem(`admin-cache-${cacheKey}`, JSON.stringify(cacheData));
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching admin gallery images:', error);
    return { success: false, error: error.message, images: [] };
  }
};

// Admin search with caching
export const searchAdminGalleryImages = async (folder = 'gallery', query = '', page = 1, limit = 50) => {
  try {
    // Check cache first
    const cacheKey = `admin-search-${folder}-${query}-${page}-${limit}`;
    const cachedResults = sessionStorage.getItem(`admin-cache-${cacheKey}`);
    
    if (cachedResults) {
      const parsed = JSON.parse(cachedResults);
      const now = Date.now();
      const cacheExpiry = 2 * 60 * 1000; // 2 minutes for search cache
      
      if (parsed.timestamp && (now - parsed.timestamp) < cacheExpiry) {
        return parsed.data;
      }
    }

    const response = await fetch(`${functionsURL}/searchAdminGalleryImages?folder=${folder}&q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the results
    if (data.success) {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      sessionStorage.setItem(`admin-cache-${cacheKey}`, JSON.stringify(cacheData));
    }
    
    return data;
  } catch (error) {
    console.error('Error searching admin gallery images:', error);
    return { success: false, error: error.message, images: [] };
  }
};

// Clear admin cache
export const clearAdminCache = () => {
  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith('admin-cache-')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => sessionStorage.removeItem(key));
};

// Clean up expired admin cache
export const cleanupAdminCache = () => {
  const now = Date.now();
  const cacheExpiry = 10 * 60 * 1000; // 10 minutes
  
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith('admin-cache-')) {
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

// Upload progress tracking
export const uploadWithProgress = async (files, onProgress) => {
  // This would integrate with your existing upload function
  // but add progress tracking and caching invalidation
  try {
    // Clear relevant caches when uploading
    clearAdminCache();
    
    // Call your existing upload function
    const { uploadMultipleImages } = await import('./storage.js');
    const result = await uploadMultipleImages(files);
    
    // Clear gallery caches too since new images are added
    sessionStorage.removeItem('gallery-artwork-session');
    localStorage.removeItem('gallery-artwork-cache');
    localStorage.removeItem('gallery-artwork-order');
    
    return result;
  } catch (error) {
    console.error('Error uploading images:', error);
    return { success: false, error: error.message };
  }
};

// Delete image with cache invalidation
export const deleteImageWithCache = async (imagePath) => {
  try {
    // Clear relevant caches when deleting
    clearAdminCache();
    
    // Call your existing delete function
    const { deleteImage } = await import('./storage.js');
    const result = await deleteImage(imagePath);
    
    // Clear gallery caches too since images are removed
    sessionStorage.removeItem('gallery-artwork-session');
    localStorage.removeItem('gallery-artwork-cache');
    localStorage.removeItem('gallery-artwork-order');
    
    return result;
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message };
  }
};

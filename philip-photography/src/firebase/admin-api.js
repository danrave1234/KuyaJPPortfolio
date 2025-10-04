// Admin API service for gallery management with caching
const functionsURL = 'https://asia-southeast1-kuyajp-portfolio.cloudfunctions.net';

// Featured Gallery Functions
export const getFeaturedImages = async () => {
  try {
    const response = await fetch(`${functionsURL}/getFeaturedImages`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching featured images:', error);
    return { success: false, error: error.message, images: [] };
  }
};

export const getAdminFeaturedImages = async () => {
  try {
    // Check cache first
    const cachedResults = sessionStorage.getItem('admin-featured-cache');
    
    if (cachedResults) {
      const parsed = JSON.parse(cachedResults);
      const now = Date.now();
      const cacheExpiry = 5 * 60 * 1000; // 5 minutes for admin cache
      
      if (parsed.timestamp && (now - parsed.timestamp) < cacheExpiry) {
        return parsed.data;
      }
    }

    const response = await fetch(`${functionsURL}/getAdminFeaturedImages`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Merge with localStorage metadata if available
    if (data.success && data.images) {
      const globalMetadata = JSON.parse(localStorage.getItem('image_metadata_cache') || '{}');
      
      data.images = data.images.map(image => {
        const metadata = globalMetadata[image.path];
        if (metadata) {
          return {
            ...image,
            title: metadata.title || image.title,
            description: metadata.description || image.description,
            updatedAt: metadata.updatedAt
          };
        }
        return image;
      });
    }
    
    // Cache the results
    if (data.success) {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      sessionStorage.setItem('admin-featured-cache', JSON.stringify(cacheData));
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching admin featured images:', error);
    return { success: false, error: error.message, images: [] };
  }
};

export const clearFeaturedCache = () => {
  sessionStorage.removeItem('admin-featured-cache');
  localStorage.removeItem('featured-gallery-cache');
  localStorage.removeItem('featured-gallery-cache-timestamp');
  sessionStorage.removeItem('featured-gallery-session');
};

// Helper function to find and delete existing images before replacement
export const handleImageReplacement = async (folder, files, seriesTitle) => {
  const { deleteImage } = await import('./storage.js');
  
  try {
    // Get current images in the folder
    const getImagesFunction = folder === 'featured' ? getAdminFeaturedImages : () => getAdminGalleryImages(folder, 1, 1000);
    const currentImages = await getImagesFunction();
    
    if (!currentImages.success) {
      console.warn('Could not fetch current images for replacement check');
      return;
    }
    
    // Find images to replace based on title or filename
    const filesToDelete = [];
    
    for (const file of files) {
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      
      // Check for matches by title or filename
      const matches = currentImages.images.filter(img => 
        img.title === seriesTitle || 
        img.title === fileName ||
        img.name === file.name ||
        img.name.replace(/\.[^/.]+$/, "") === fileName
      );
      
      filesToDelete.push(...matches);
    }
    
    // Delete found matches
    for (const fileToDelete of filesToDelete) {
      try {
        await deleteImage(fileToDelete.path);
        console.log(`Replaced existing ${folder} image: ${fileToDelete.title || fileToDelete.name}`);
      } catch (deleteError) {
        console.warn(`Could not delete existing image ${fileToDelete.title || fileToDelete.name}:`, deleteError);
      }
    }
    
    return filesToDelete.length;
  } catch (error) {
    console.error('Error handling image replacement:', error);
    return 0;
  }
};

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
    
    // Merge with localStorage metadata if available
    if (data.success && data.images) {
      const globalMetadata = JSON.parse(localStorage.getItem('image_metadata_cache') || '{}');
      
      data.images = data.images.map(image => {
        const metadata = globalMetadata[image.path];
        if (metadata) {
          return {
            ...image,
            title: metadata.title || image.title,
            description: metadata.description || image.description,
            updatedAt: metadata.updatedAt
          };
        }
        return image;
      });
    }
    
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

// Upload progress tracking with replacement handling
export const uploadWithProgress = async (files, onProgress, seriesTitle = '', seriesDescription = '', scientificName = '', location = '', timeTaken = '', history = '') => {
  try {
    // Clear relevant caches when uploading
    clearAdminCache();
    
    // Handle image replacement before uploading
    const replacedCount = await handleImageReplacement('gallery', files, seriesTitle);
    if (replacedCount > 0) {
      console.log(`Replaced ${replacedCount} existing gallery images`);
    }
    
    // Call your existing upload function with all metadata
    const { uploadMultipleImages } = await import('./storage.js');
    const result = await uploadMultipleImages(files, 'gallery', seriesTitle, seriesDescription, scientificName, location, timeTaken, history);
    
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

// Featured gallery upload function with replacement handling
export const uploadFeaturedWithProgress = async (files, onProgress, seriesTitle = '', seriesDescription = '') => {
  try {
    // Clear featured caches when uploading
    clearFeaturedCache();
    
    // Handle image replacement before uploading
    const replacedCount = await handleImageReplacement('featured', files, seriesTitle);
    if (replacedCount > 0) {
      console.log(`Replaced ${replacedCount} existing featured images`);
    }
    
    // Call your existing upload function with featured folder
    const { uploadMultipleImages } = await import('./storage.js');
    const result = await uploadMultipleImages(files, 'featured', seriesTitle, seriesDescription);
    
    // Clear all featured caches since new images are added
    clearFeaturedCache();
    
    return result;
  } catch (error) {
    console.error('Error uploading featured images:', error);
    return { success: false, error: error.message };
  }
};

// Update image metadata with cache invalidation
export const updateImageMetadataWithCache = async (imagePath, title, description) => {
  try {
    // Clear relevant caches when updating
    clearAdminCache();
    
    // Call your existing update function
    const { updateImageMetadata } = await import('./storage.js');
    const result = await updateImageMetadata(imagePath, {
      title: title,
      description: description,
      updatedAt: new Date().toISOString()
    });
    
    // Clear gallery caches too since metadata is updated
    sessionStorage.removeItem('gallery-artwork-session');
    localStorage.removeItem('gallery-artwork-cache');
    localStorage.removeItem('gallery-artwork-order');
    
    return result;
  } catch (error) {
    console.error('Error updating image metadata:', error);
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

// Delete featured image with cache invalidation
export const deleteFeaturedImageWithCache = async (imagePath) => {
  try {
    // Clear featured caches when deleting
    clearFeaturedCache();
    
    // Call your existing delete function
    const { deleteImage } = await import('./storage.js');
    const result = await deleteImage(imagePath);
    
    // Clear all featured caches since images are removed
    clearFeaturedCache();
    
    return result;
  } catch (error) {
    console.error('Error deleting featured image:', error);
    return { success: false, error: error.message };
  }
};

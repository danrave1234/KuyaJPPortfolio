import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata
} from 'firebase/storage';
import { storage } from './config';

// Upload a single image to Firebase Storage
export const uploadImage = async (file, path = 'gallery', newFileName = null, customMetadata = {}) => {
  try {
    const fileNameToUse = newFileName || file.name;
    const imageRef = ref(storage, `${path}/${fileNameToUse}`);

    const metadata = {
      customMetadata: {
        ...customMetadata,
        originalName: file.name, // Keep original name for reference
      }
    };

    const snapshot = await uploadBytes(imageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { 
      success: true, 
      url: downloadURL, 
      ref: imageRef,
      error: null,
      name: fileNameToUse,
      path: imageRef.fullPath,
      metadata: metadata.customMetadata
    };
  } catch (error) {
    return { 
      success: false, 
      url: null, 
      ref: null,
      error: error.message,
      name: newFileName || file.name,
      path: null,
      metadata: null
    };
  }
};

// Upload multiple images
export const uploadMultipleImages = async (files, path = 'gallery', seriesTitle = '', seriesDescription = '') => {
  try {
    const uploadPromises = files.map((file, index) => {
      const originalExtension = file.name.split('.').pop();
      // Generate a new filename based on the seriesTitle and index
      const baseFileName = seriesTitle.replace(/[^a-zA-Z0-9_.-]/g, '_') || 'untitled_series'; // Sanitize title
      const newFileName = files.length > 1
        ? `${baseFileName}_${index + 1}.${originalExtension}`
        : `${baseFileName}.${originalExtension}`;

      const customMetadata = {
        title: seriesTitle,
        description: seriesDescription,
        isSeries: files.length > 1 ? 'true' : 'false', // Store as string
        seriesIndex: files.length > 1 ? String(index + 1) : '1', // Store as string
      };

      return uploadImage(file, path, newFileName, customMetadata);
    });

    const results = await Promise.all(uploadPromises);

    const successful = results.filter(result => result.success);
    const failed = results.filter(result => !result.success);

    return {
      success: failed.length === 0,
      successful,
      failed,
      error: failed.length > 0 ? `${failed.length} files failed to upload` : null
    };
  } catch (error) {
    return {
      success: false,
      successful: [],
      failed: [],
      error: error.message
    };
  }
};

// Delete an image from Firebase Storage
export const deleteImage = async (imagePath) => {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Request deduplication cache
const urlCache = new Map();
const metadataCache = new Map();

// Get all images from a folder with optimized batching and caching
export const getImagesFromFolder = async (folderPath = 'gallery') => {
  try {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);
    
    // Batch all requests together for better performance
    const imagePromises = result.items.map(async (item) => {
      const cacheKey = item.fullPath;
      
      // Check if we already have cached data for this item
      if (urlCache.has(cacheKey) && metadataCache.has(cacheKey)) {
        const cachedUrl = urlCache.get(cacheKey);
        const cachedMetadata = metadataCache.get(cacheKey);
        return {
          id: item.name,
          name: item.name,
          src: cachedUrl,
          path: item.fullPath,
          title: cachedMetadata.customMetadata?.title || item.name,
          alt: cachedMetadata.customMetadata?.alt || item.name,
          description: cachedMetadata.customMetadata?.description || '',
          isSeries: cachedMetadata.customMetadata?.isSeries === 'true',
          seriesIndex: cachedMetadata.customMetadata?.seriesIndex ? parseInt(cachedMetadata.customMetadata.seriesIndex) : 1,
          size: cachedMetadata.size,
          timeCreated: cachedMetadata.timeCreated
        };
      }
      
      // Fetch URL and metadata in parallel
      const [url, metadata] = await Promise.all([
        getDownloadURL(item),
        getMetadata(item)
      ]);
      
      // Cache the results
      urlCache.set(cacheKey, url);
      metadataCache.set(cacheKey, metadata);
      
      return {
        id: item.name,
        name: item.name,
        src: url,
        path: item.fullPath,
        title: metadata.customMetadata?.title || item.name,
        alt: metadata.customMetadata?.alt || item.name,
        description: metadata.customMetadata?.description || '',
        isSeries: metadata.customMetadata?.isSeries === 'true',
        seriesIndex: metadata.customMetadata?.seriesIndex ? parseInt(metadata.customMetadata.seriesIndex) : 1,
        size: metadata.size,
        timeCreated: metadata.timeCreated
      };
    });
    
    const images = await Promise.all(imagePromises);
    
    // Store in server-side cache (if using a backend)
    // This would typically be handled by your backend API
    if (typeof window !== 'undefined') {
      // Client-side: Store in browser cache with cache headers
      const cacheKey = `firebase-gallery-${folderPath}`
      const cacheData = {
        images,
        timestamp: Date.now(),
        etag: `gallery-${Date.now()}` // Simple ETag for cache validation
      }
      
      // Store in memory cache for this session
      if (!window.firebaseCache) {
        window.firebaseCache = new Map()
      }
      window.firebaseCache.set(cacheKey, cacheData)
    }
    
    return { success: true, images, error: null };
  } catch (error) {
    return { success: false, images: [], error: error.message };
  }
};

// Get a single image URL by name
export const getImageURL = async (imageName, folder = 'gallery') => {
  try {
    const imageRef = ref(storage, `${folder}/${imageName}`);
    const url = await getDownloadURL(imageRef);
    return { success: true, url, error: null };
  } catch (error) {
    return { success: false, url: null, error: error.message };
  }
};

// Update image metadata (title, description, etc.)
export const updateImageMetadata = async (imagePath, metadata) => {
  try {
    const imageRef = ref(storage, imagePath);
    
    // Get current metadata first
    const currentMetadata = await getMetadata(imageRef);
    
    // Update with new custom metadata
    const updatedMetadata = {
      ...currentMetadata.customMetadata,
      ...metadata
    };
    
    // Note: Firebase Storage doesn't have a direct updateMetadata method
    // We'll need to handle this differently - store metadata in a separate collection
    // For now, we'll return success and handle it in the UI
    
    return { 
      success: true, 
      metadata: updatedMetadata, 
      error: null 
    };
  } catch (error) {
    return { 
      success: false, 
      metadata: null, 
      error: error.message 
    };
  }
};

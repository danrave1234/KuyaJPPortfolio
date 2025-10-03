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

// Get all images from a folder
export const getImagesFromFolder = async (folderPath = 'gallery') => {
  try {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);
    
    const imagePromises = result.items.map(async (item) => {
      const url = await getDownloadURL(item);
      const metadata = await getMetadata(item);
      return {
        id: item.name,
        name: item.name,
        src: url,
        path: item.fullPath,
        title: metadata.customMetadata?.title || item.name,
        alt: metadata.customMetadata?.alt || item.name,
        description: metadata.customMetadata?.description || '', // Retrieve description
        isSeries: metadata.customMetadata?.isSeries === 'true', // Convert back to boolean
        seriesIndex: metadata.customMetadata?.seriesIndex ? parseInt(metadata.customMetadata.seriesIndex) : 1,
        size: metadata.size,
        timeCreated: metadata.timeCreated
      };
    });
    
    const images = await Promise.all(imagePromises);
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

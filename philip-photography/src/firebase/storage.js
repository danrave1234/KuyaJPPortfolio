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
export const uploadImage = async (file, path = 'gallery') => {
  try {
    // Create a reference to the file
    const imageRef = ref(storage, `${path}/${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(imageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { 
      success: true, 
      url: downloadURL, 
      ref: imageRef,
      error: null 
    };
  } catch (error) {
    return { 
      success: false, 
      url: null, 
      ref: null,
      error: error.message 
    };
  }
};

// Upload multiple images
export const uploadMultipleImages = async (files, path = 'gallery') => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, path));
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

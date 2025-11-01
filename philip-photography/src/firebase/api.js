// New API service for single-request gallery loading
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from './config';

// Point Functions to asia-southeast1 to match backend
const functions = getFunctions(app, 'asia-southeast1');

// Method 1: HTTP Request (simpler, less secure)
export const getGalleryImagesHTTP = async (folder = 'gallery', page = 1, limit = 20) => {
  try {
    // Use existing Firebase project functions URL
    const functionsURL = 'https://asia-southeast1-kuyajp-portfolio.cloudfunctions.net';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${functionsURL}/getGalleryImages?folder=${folder}&page=${page}&limit=${limit}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching gallery images via HTTP:', error);
    return { success: false, error: error.message, images: [] };
  }
};

// Method 2: Callable Function (more secure, recommended)
export const getGalleryImagesCallable = async (folder = 'gallery', page = 1, limit = 20) => {
  try {
    const getGalleryImages = httpsCallable(functions, 'getGalleryImagesCallable');
    const result = await getGalleryImages({ folder, page, limit });
    return result.data;
  } catch (error) {
    console.error('Error fetching gallery images via callable:', error);
    return { success: false, error: error.message, images: [] };
  }
};

// Fallback to original method if functions are not available
export const getGalleryImagesFallback = async (folder = 'gallery') => {
  try {
    // Import the original function
    const { getImagesFromFolder } = await import('./storage.js');
    return await getImagesFromFolder(folder);
  } catch (error) {
    console.error('Error with fallback method:', error);
    return { success: false, error: error.message, images: [] };
  }
};

// Smart function that tries callable first, then HTTP, then fallback
export const getGalleryImages = async (folder = 'gallery', page = 1, limit = 20) => {
  // Try callable function first (most secure) with timeout
  const callablePromise = getGalleryImagesCallable(folder, page, limit);
  const callableTimeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Callable timeout')), 10000)
  );
  
  try {
    const result = await Promise.race([callablePromise, callableTimeout]);
    if (result && result.success) {
      return result;
    }
  } catch (error) {
    console.warn('Callable function failed, trying HTTP method:', error.message);
  }

  // Try HTTP method as fallback (already has timeout)
  try {
    const result = await getGalleryImagesHTTP(folder, page, limit);
    if (result && result.success) {
      return result;
    }
  } catch (error) {
    console.warn('HTTP method failed, using original method:', error.message);
  }

  // Final fallback to original method (no pagination support)
  return await getGalleryImagesFallback(folder);
};

// Search gallery images by title and description
export const searchGalleryImages = async (folder = 'gallery', query = '', page = 1, limit = 20) => {
  try {
    const functionsURL = 'https://asia-southeast1-kuyajp-portfolio.cloudfunctions.net';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${functionsURL}/searchGalleryImages?folder=${folder}&q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching gallery images:', error);
    return { success: false, error: error.message, images: [] };
  }
};

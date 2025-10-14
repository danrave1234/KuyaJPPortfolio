// Firebase Storage Configuration
// Your actual Firebase project configuration

// Firebase Storage Configuration - using existing project with custom domain
export const FIREBASE_CONFIG = {
  // Firebase Storage bucket URL
  STORAGE_URL: 'https://firebasestorage.googleapis.com/v0/b/kuyajp-portfolio.firebasestorage.app/o',
  
  // Gallery folder path in Firebase Storage
  GALLERY_FOLDER: 'gallery',
  
  // Helper function to generate Firebase Storage URLs
  getImageUrl: (filename) => {
    const encodedFilename = encodeURIComponent(filename)
    return `${FIREBASE_CONFIG.STORAGE_URL}/${FIREBASE_CONFIG.GALLERY_FOLDER}%2F${encodedFilename}?alt=media`
  },
  
  // Helper function to generate multiple image URLs for series
  getSeriesUrls: (filenames) => {
    return filenames.map(filename => FIREBASE_CONFIG.getImageUrl(filename))
  }
}

// Example usage:
// import { FIREBASE_CONFIG } from './config/firebase'
// const imageUrl = FIREBASE_CONFIG.getImageUrl('1.jpg')
// const seriesUrls = FIREBASE_CONFIG.getSeriesUrls(['2.1.jpg', '2.2.jpg', '2.3.jpg'])

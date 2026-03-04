// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import {
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';

// Firebase configuration - using existing project with custom domain
const firebaseConfig = {
  apiKey: "AIzaSyDgjs70B_RlYrwV1PSq0nwEJJ2RippzP9A",
  authDomain: "kuyajp-portfolio.firebaseapp.com",
  projectId: "kuyajp-portfolio",
  storageBucket: "kuyajp-portfolio.firebasestorage.app",
  messagingSenderId: "599415192027",
  appId: "1:599415192027:web:1f752817376ace2dee8ffe",
  measurementId: "G-19Z0VSQCHY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics (optional) - only on client side
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Firestore and get a reference to the service
// Use modern cache initialization to avoid persistence lock contention in multi-tab sessions.
// If persistence cannot be acquired, Firestore falls back to memory cache automatically.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  })
});

// Export the app instance
export default app;

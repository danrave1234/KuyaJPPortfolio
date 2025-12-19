// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

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
export const db = getFirestore(app);

// Enable offline persistence and suppress WebSocket termination errors (only on client side)
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db, {
    synchronizeTabs: true
  }).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Firestore persistence disabled: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence.
      console.warn('Firestore persistence not supported by browser');
    }
  });
}

// Export the app instance
export default app;

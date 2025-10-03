// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
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

// Initialize Firebase Analytics (optional)
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Export the app instance
export default app;

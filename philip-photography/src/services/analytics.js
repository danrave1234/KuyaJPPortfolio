// Analytics tracking service for portfolio website
import { db } from '../firebase/config';
import { analytics, auth } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';

// Admin email for exclusion from analytics
const ADMIN_EMAIL = 'jpmoradanaturegram@gmail.com';

// Check if current user is admin
const isCurrentUserAdmin = () => {
  const currentUser = auth.currentUser;
  return currentUser && currentUser.email === ADMIN_EMAIL;
};

// Generate a unique session ID for this visitor
const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Get or create session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('portfolio_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('portfolio_session_id', sessionId);
  }
  return sessionId;
};

// Get visitor ID (persistent across sessions)
// Use a more reliable method that combines multiple browser fingerprints
const getVisitorId = () => {
  let visitorId = localStorage.getItem('portfolio_visitor_id');
  if (!visitorId) {
    // Create a simple fingerprint based on browser characteristics
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset()
    ].join('|');
    
    // Create a simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    visitorId = 'visitor_' + Math.abs(hash).toString(36);
    
    try {
      localStorage.setItem('portfolio_visitor_id', visitorId);
    } catch (e) {
      // If localStorage fails, just use the generated ID for this session
      console.warn('Could not save visitor ID to localStorage');
    }
  }
  return visitorId;
};

// Get basic visitor info
const getVisitorInfo = () => {
  return {
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: {
      width: screen.width,
      height: screen.height
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    referrer: document.referrer || 'direct',
    url: window.location.href,
    timestamp: new Date()
  };
};

// Track page view (only once per page per session to avoid duplicate counts on refresh)
export const trackPageView = async (pageName, additionalData = {}) => {
  try {
    // Don't track if user is logged in as admin
    if (isCurrentUserAdmin()) {
      console.log('⏭️ Skipping analytics - Admin user detected');
      return;
    }

    // Don't track admin page views
    if (pageName.toLowerCase() === 'admin' || window.location.pathname === '/admin') {
      console.log('⏭️ Skipping analytics for admin page');
      return;
    }

    // Check if we've already tracked this page in this session
    const sessionKey = `tracked_page_${pageName}_${getSessionId()}`;
    if (sessionStorage.getItem(sessionKey)) {
      console.log('⏭️ Page already tracked in this session (refresh detected)');
      return;
    }

    const visitorInfo = getVisitorInfo();
    
    // Log to Firebase Analytics
    if (analytics) {
      logEvent(analytics, 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_referrer: document.referrer || 'direct'
      });
    }

    // Store in Firestore (collections will be created automatically on first write)
    const pageViewData = {
      visitorId: visitorInfo.visitorId,
      sessionId: visitorInfo.sessionId,
      event: 'page_view',
      pageName,
      referrer: visitorInfo.referrer,
      timestamp: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'analytics_visits'), pageViewData);
      
      // Mark this page as tracked for this session
      sessionStorage.setItem(sessionKey, 'true');
      
      // Update daily stats
      await updateDailyStats('page_views', 1);
      console.log('✅ Page view tracked successfully');
    } catch (firestoreError) {
      console.warn('⚠️ Firestore write failed (this is normal on first visit):', firestoreError.message);
    }
    
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Track image view (only once per image per session to avoid duplicate counts)
export const trackImageView = async (imageData, additionalData = {}) => {
  try {
    // Don't track if user is logged in as admin
    if (isCurrentUserAdmin()) {
      console.log('⏭️ Skipping analytics - Admin user detected');
      return;
    }

    const imagePath = imageData.path || imageData.id;
    
    // Check if we've already tracked this image in this session
    const sessionKey = `tracked_image_${imagePath}_${getSessionId()}`;
    if (sessionStorage.getItem(sessionKey)) {
      console.log('⏭️ Image already tracked in this session');
      return;
    }

    const visitorInfo = getVisitorInfo();
    
    // Log to Firebase Analytics
    if (analytics) {
      logEvent(analytics, 'image_view', {
        image_title: imageData.title || imageData.name,
        image_path: imagePath,
        gallery_type: imageData.isFeatured ? 'featured' : 'gallery'
      });
    }

    // Store in Firestore (simplified data)
    const imageViewData = {
      visitorId: visitorInfo.visitorId,
      sessionId: visitorInfo.sessionId,
      event: 'image_view',
      imageId: imagePath,
      imageTitle: imageData.title || imageData.name,
      imagePath: imagePath,
      timestamp: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'analytics_image_views'), imageViewData);
      
      // Mark this image as tracked for this session
      sessionStorage.setItem(sessionKey, 'true');
      
      // Update image view count
      await updateImageStats(imagePath, 'views', 1);
      console.log('✅ Image view tracked successfully');
    } catch (firestoreError) {
      console.warn('⚠️ Firestore write failed (this is normal on first visit):', firestoreError.message);
    }
    
  } catch (error) {
    console.error('Error tracking image view:', error);
  }
};

// Track interaction (only important interactions like contact form submissions)
export const trackInteraction = async (interactionType, data = {}) => {
  try {
    // Don't track if user is logged in as admin
    if (isCurrentUserAdmin()) {
      console.log('⏭️ Skipping analytics - Admin user detected');
      return;
    }

    // Only track important interactions (contact form, not email clicks)
    const importantInteractions = ['contact_form', 'contact_form_submit'];
    if (!importantInteractions.includes(interactionType)) {
      console.log('⏭️ Skipping non-essential interaction tracking');
      return;
    }

    const visitorInfo = getVisitorInfo();
    
    // Log to Firebase Analytics
    if (analytics) {
      logEvent(analytics, interactionType, data);
    }

    // Store in Firestore (simplified data)
    const interactionData = {
      visitorId: visitorInfo.visitorId,
      sessionId: visitorInfo.sessionId,
      event: 'interaction',
      interactionType,
      timestamp: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'analytics_interactions'), interactionData);
      
      // Update daily stats
      await updateDailyStats('interactions', 1);
      console.log('✅ Contact form submission tracked successfully');
    } catch (firestoreError) {
      console.warn('⚠️ Firestore write failed (this is normal on first visit):', firestoreError.message);
    }
    
  } catch (error) {
    console.error('Error tracking interaction:', error);
  }
};

// Track session data
export const trackSession = async (sessionData = {}) => {
  try {
    // Don't track if user is logged in as admin
    if (isCurrentUserAdmin()) {
      console.log('⏭️ Skipping analytics - Admin user detected');
      return;
    }

    const visitorInfo = getVisitorInfo();
    
    // Store in Firestore (collections will be created automatically on first write)
    const sessionInfo = {
      ...visitorInfo,
      event: 'session',
      sessionStart: sessionStorage.getItem('portfolio_session_start') || new Date().toISOString(),
      sessionEnd: new Date().toISOString(),
      ...sessionData,
      timestamp: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'analytics_sessions'), sessionInfo);
      console.log('✅ Session tracked successfully');
    } catch (firestoreError) {
      console.warn('⚠️ Firestore write failed (this is normal on first visit):', firestoreError.message);
    }
    
  } catch (error) {
    console.error('Error tracking session:', error);
  }
};

// Update daily statistics
const updateDailyStats = async (metric, incrementValue = 1) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const statsRef = doc(db, 'analytics_daily_stats', today);
    
    await updateDoc(statsRef, {
      [metric]: increment(incrementValue),
      date: today,
      lastUpdated: serverTimestamp()
    }).catch(async () => {
      // If document doesn't exist, create it
      await addDoc(collection(db, 'analytics_daily_stats'), {
        date: today,
        [metric]: incrementValue,
        lastUpdated: serverTimestamp()
      });
    });
    
  } catch (error) {
    console.error('Error updating daily stats:', error);
  }
};

// Update image-specific statistics
const updateImageStats = async (imagePath, metric, incrementValue = 1) => {
  try {
    const imageId = imagePath.replace(/[^a-zA-Z0-9]/g, '_'); // Create safe ID
    const imageStatsRef = doc(db, 'analytics_image_stats', imageId);
    
    await updateDoc(imageStatsRef, {
      imagePath,
      [metric]: increment(incrementValue),
      lastUpdated: serverTimestamp()
    }).catch(async () => {
      // If document doesn't exist, create it
      await addDoc(collection(db, 'analytics_image_stats'), {
        imagePath,
        [metric]: incrementValue,
        lastUpdated: serverTimestamp()
      });
    });
    
  } catch (error) {
    console.error('Error updating image stats:', error);
  }
};

// Track contact form submission
export const trackContactForm = async (formData = {}) => {
  await trackInteraction('contact_form_submission', {
    hasName: !!formData.name,
    hasEmail: !!formData.email,
    hasMessage: !!formData.message,
    messageLength: formData.message?.length || 0
  });
};

// Track email click
export const trackEmailClick = async (emailAddress = '') => {
  await trackInteraction('email_click', {
    emailAddress
  });
};

// Track social media click
export const trackSocialClick = async (platform = '') => {
  await trackInteraction('social_click', {
    platform
  });
};

// Track gallery navigation
export const trackGalleryNavigation = async (galleryType, action, additionalData = {}) => {
  await trackInteraction('gallery_navigation', {
    galleryType,
    action,
    ...additionalData
  });
};

// Initialize session tracking
export const initializeAnalytics = () => {
  // Set session start time
  if (!sessionStorage.getItem('portfolio_session_start')) {
    sessionStorage.setItem('portfolio_session_start', new Date().toISOString());
  }

  // Track initial page view
  const pageName = window.location.pathname === '/' ? 'Home' : 
                  window.location.pathname.replace('/', '').charAt(0).toUpperCase() + 
                  window.location.pathname.slice(2);
  
  trackPageView(pageName, { isInitialLoad: true });

  // Track session end when user leaves
  window.addEventListener('beforeunload', () => {
    const sessionStart = sessionStorage.getItem('portfolio_session_start');
    if (sessionStart) {
      const sessionDuration = Date.now() - new Date(sessionStart).getTime();
      trackSession({ sessionDuration });
    }
  });
};

// Enable analytics tracking (call this when you want to start tracking)
export const enableAnalytics = () => {
  console.log('Analytics tracking enabled');
  initializeAnalytics();
};

// Check if analytics is ready (Firestore is always ready once initialized)
export const isAnalyticsReady = () => {
  return true; // Firestore is always ready once the app is initialized
};

// Get analytics data for admin dashboard
export const getAnalyticsData = async (timeRange = '7d') => {
  try {
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get page views
    const pageViewsQuery = query(
      collection(db, 'analytics_visits'),
      where('timestamp', '>=', startDate),
      orderBy('timestamp', 'desc')
    );
    
    const pageViewsSnapshot = await getDocs(pageViewsQuery);
    const pageViews = pageViewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get image views
    const imageViewsQuery = query(
      collection(db, 'analytics_image_views'),
      where('timestamp', '>=', startDate),
      orderBy('timestamp', 'desc')
    );
    
    const imageViewsSnapshot = await getDocs(imageViewsQuery);
    const imageViews = imageViewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get interactions
    const interactionsQuery = query(
      collection(db, 'analytics_interactions'),
      where('timestamp', '>=', startDate),
      orderBy('timestamp', 'desc')
    );
    
    const interactionsSnapshot = await getDocs(interactionsQuery);
    const interactions = interactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      data: {
        pageViews,
        imageViews,
        interactions,
        timeRange,
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      }
    };

  } catch (error) {
    console.error('Error getting analytics data:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Get image statistics
export const getImageStats = async () => {
  try {
    const imageStatsQuery = query(
      collection(db, 'analytics_image_stats'),
      orderBy('views', 'desc'),
      limit(50)
    );
    
    const imageStatsSnapshot = await getDocs(imageStatsQuery);
    const imageStats = imageStatsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      data: imageStats
    };

  } catch (error) {
    console.error('Error getting image stats:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Get daily statistics
export const getDailyStats = async (days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const dailyStatsQuery = query(
      collection(db, 'analytics_daily_stats'),
      where('date', '>=', startDate.toISOString().split('T')[0]),
      orderBy('date', 'desc')
    );
    
    const dailyStatsSnapshot = await getDocs(dailyStatsQuery);
    const dailyStats = dailyStatsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      data: dailyStats
    };

  } catch (error) {
    console.error('Error getting daily stats:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Analytics API service for fetching analytics data
const functionsURL = 'https://asia-southeast1-kuyajp-portfolio.cloudfunctions.net';

// Get analytics dashboard data
export const getAnalyticsData = async (timeRange = '7d') => {
  try {
    const response = await fetch(`${functionsURL}/getAnalyticsData?timeRange=${timeRange}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return { success: false, error: error.message, data: null };
  }
};

// Get image statistics
export const getImageStats = async (limit = 50) => {
  try {
    const response = await fetch(`${functionsURL}/getImageStats?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching image stats:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// Get daily statistics
export const getDailyStats = async (days = 30) => {
  try {
    const response = await fetch(`${functionsURL}/getDailyStats?days=${days}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// Get analytics summary
export const getAnalyticsSummary = async () => {
  try {
    const response = await fetch(`${functionsURL}/getAnalyticsSummary`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return { success: false, error: error.message, data: null };
  }
};

// Analytics data caching
const analyticsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key) => {
  const cached = analyticsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  analyticsCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Cached versions of the functions
export const getAnalyticsDataCached = async (timeRange = '7d') => {
  const cacheKey = `analytics_${timeRange}`;
  const cached = getCachedData(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const result = await getAnalyticsData(timeRange);
  if (result.success) {
    setCachedData(cacheKey, result);
  }
  
  return result;
};

export const getImageStatsCached = async (limit = 50) => {
  const cacheKey = `image_stats_${limit}`;
  const cached = getCachedData(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const result = await getImageStats(limit);
  if (result.success) {
    setCachedData(cacheKey, result);
  }
  
  return result;
};

export const getAnalyticsSummaryCached = async () => {
  const cacheKey = 'analytics_summary';
  const cached = getCachedData(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const result = await getAnalyticsSummary();
  if (result.success) {
    setCachedData(cacheKey, result);
  }
  
  return result;
};

// Clear analytics cache
export const clearAnalyticsCache = () => {
  analyticsCache.clear();
};

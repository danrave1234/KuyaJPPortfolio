import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Eye, 
  Users, 
  MousePointer, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Calendar,
  Image as ImageIcon,
  Globe,
  Smartphone,
  Monitor,
  Mail,
  MessageSquare,
  Heart,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { 
  getAnalyticsDataCached, 
  getImageStatsCached, 
  getAnalyticsSummaryCached,
  clearAnalyticsCache 
} from '../firebase/analytics-api';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [imageStats, setImageStats] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  const timeRangeOptions = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load data in parallel
      const [analyticsResult, imageStatsResult, summaryResult] = await Promise.all([
        getAnalyticsDataCached(timeRange),
        getImageStatsCached(20),
        getAnalyticsSummaryCached()
      ]);

      if (analyticsResult.success) {
        setAnalyticsData(analyticsResult.data);
      } else {
        setError(analyticsResult.error);
      }

      if (imageStatsResult.success) {
        setImageStats(imageStatsResult.data);
      }

      if (summaryResult.success) {
        setSummary(summaryResult.data);
      }

    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const handleRefresh = () => {
    clearAnalyticsCache();
    loadAnalyticsData();
  };

  const handleClearAnalytics = async () => {
    try {
      setClearing(true);
      
      const response = await fetch(
        'https://asia-southeast1-kuyajp-portfolio.cloudfunctions.net/clearAnalyticsData',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Cleared ${result.totalDeleted} analytics records`);
        setShowClearConfirm(false);
        clearAnalyticsCache();
        loadAnalyticsData();
      } else {
        console.error('❌ Failed to clear analytics:', result.error);
        setError('Failed to clear analytics data');
      }
    } catch (err) {
      console.error('❌ Error clearing analytics:', err);
      setError('Error clearing analytics data');
    } finally {
      setClearing(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-500';
    if (growth < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-[rgb(var(--primary))]" />
        <span className="ml-2 text-[rgb(var(--fg))]">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">Error loading analytics: {error}</div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  const metrics = analyticsData?.metrics || {};
  const today = summary?.today || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[rgb(var(--fg))]">Analytics Dashboard</h2>
          <p className="text-[rgb(var(--fg-muted))]">Monitor your portfolio performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleRefresh}
            className="p-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--fg))] hover:bg-[rgb(var(--bg-muted))] transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-[rgb(var(--bg))] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Clear all analytics data"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-medium">Clear Data</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(var(--bg))] rounded-lg shadow-xl max-w-md w-full p-6 border border-[rgb(var(--border))]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-[rgb(var(--fg))]">Clear Analytics Data?</h3>
            </div>
            
            <p className="text-[rgb(var(--fg-muted))] mb-6">
              This will permanently delete all analytics data including page views, image views, interactions, and statistics. This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={clearing}
                className="px-4 py-2 border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--fg))] hover:bg-[rgb(var(--bg-muted))] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAnalytics}
                disabled={clearing}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {clearing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Clear All Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--fg-muted))]">Page Views Today</p>
                <p className="text-2xl font-bold text-[rgb(var(--fg))]">{formatNumber(today.pageViews)}</p>
              </div>
              <div className="flex items-center gap-2">
                {getGrowthIcon(today.pageViewsGrowth)}
                <span className={`text-sm ${getGrowthColor(today.pageViewsGrowth)}`}>
                  {today.pageViewsGrowth > 0 ? '+' : ''}{today.pageViewsGrowth}%
                </span>
              </div>
            </div>
            <Eye className="w-8 h-8 text-[rgb(var(--primary))] mt-2" />
          </div>

          <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--fg-muted))]">Unique Visitors</p>
                <p className="text-2xl font-bold text-[rgb(var(--fg))]">{formatNumber(today.uniqueVisitors)}</p>
              </div>
              <div className="flex items-center gap-2">
                {getGrowthIcon(today.visitorsGrowth)}
                <span className={`text-sm ${getGrowthColor(today.visitorsGrowth)}`}>
                  {today.visitorsGrowth > 0 ? '+' : ''}{today.visitorsGrowth}%
                </span>
              </div>
            </div>
            <Users className="w-8 h-8 text-[rgb(var(--primary))] mt-2" />
          </div>

          <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--fg-muted))]">Image Views</p>
                <p className="text-2xl font-bold text-[rgb(var(--fg))]">{formatNumber(today.imageViews)}</p>
              </div>
              <div className="flex items-center gap-2">
                {getGrowthIcon(today.imageViewsGrowth)}
                <span className={`text-sm ${getGrowthColor(today.imageViewsGrowth)}`}>
                  {today.imageViewsGrowth > 0 ? '+' : ''}{today.imageViewsGrowth}%
                </span>
              </div>
            </div>
            <ImageIcon className="w-8 h-8 text-[rgb(var(--primary))] mt-2" />
          </div>

          <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--fg-muted))]">Interactions</p>
                <p className="text-2xl font-bold text-[rgb(var(--fg))]">{formatNumber(today.interactions)}</p>
              </div>
              <div className="flex items-center gap-2">
                {getGrowthIcon(today.interactionsGrowth)}
                <span className={`text-sm ${getGrowthColor(today.interactionsGrowth)}`}>
                  {today.interactionsGrowth > 0 ? '+' : ''}{today.interactionsGrowth}%
                </span>
              </div>
            </div>
            <MousePointer className="w-8 h-8 text-[rgb(var(--primary))] mt-2" />
          </div>
        </div>
      )}

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Popular Pages */}
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[rgb(var(--fg))] mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Popular Pages
          </h3>
          <div className="space-y-3">
            {Object.entries(metrics.popularPages || {}).slice(0, 5).map(([page, views]) => (
              <div key={page} className="flex items-center justify-between">
                <span className="text-[rgb(var(--fg))] capitalize">{page}</span>
                <span className="text-[rgb(var(--fg-muted))] font-mono">{views}</span>
              </div>
            ))}
            {Object.keys(metrics.popularPages || {}).length === 0 && (
              <p className="text-[rgb(var(--fg-muted))] text-sm">No page view data available</p>
            )}
          </div>
        </div>

        {/* Device Types */}
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[rgb(var(--fg))] mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Device Types
          </h3>
          <div className="space-y-3">
            {Object.entries(metrics.deviceTypes || {}).map(([device, count]) => (
              <div key={device} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {device === 'mobile' ? (
                    <Smartphone className="w-4 h-4 text-[rgb(var(--primary))]" />
                  ) : (
                    <Monitor className="w-4 h-4 text-[rgb(var(--primary))]" />
                  )}
                  <span className="text-[rgb(var(--fg))] capitalize">{device}</span>
                </div>
                <span className="text-[rgb(var(--fg-muted))] font-mono">{count}</span>
              </div>
            ))}
            {Object.keys(metrics.deviceTypes || {}).length === 0 && (
              <p className="text-[rgb(var(--fg-muted))] text-sm">No device data available</p>
            )}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[rgb(var(--fg))] mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Traffic Sources
          </h3>
          <div className="space-y-3">
            {Object.entries(metrics.trafficSources || {}).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <span className="text-[rgb(var(--fg))] capitalize">{source}</span>
                <span className="text-[rgb(var(--fg-muted))] font-mono">{count}</span>
              </div>
            ))}
            {Object.keys(metrics.trafficSources || {}).length === 0 && (
              <p className="text-[rgb(var(--fg-muted))] text-sm">No traffic data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Most Popular Images */}
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[rgb(var(--fg))] mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Most Viewed Images
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {imageStats.slice(0, 6).map((image, index) => (
            <div key={image.id} className="flex items-center justify-between p-3 bg-[rgb(var(--bg-muted))] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[rgb(var(--primary))] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="text-[rgb(var(--fg))] font-medium truncate max-w-[200px]" title={image.imagePath}>
                    {image.imagePath?.split('/').pop()?.replace(/\.[^/.]+$/, "") || 'Unknown Image'}
                  </p>
                  <p className="text-xs text-[rgb(var(--fg-muted))]">{image.views || 0} views</p>
                </div>
              </div>
            </div>
          ))}
          {imageStats.length === 0 && (
            <p className="text-[rgb(var(--fg-muted))] text-sm col-span-full">No image view data available</p>
          )}
        </div>
      </div>

      {/* Interactions Breakdown */}
      {Object.keys(metrics.interactionsByType || {}).length > 0 && (
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[rgb(var(--fg))] mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Interactions Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metrics.interactionsByType || {}).map(([type, count]) => (
              <div key={type} className="text-center p-3 bg-[rgb(var(--bg-muted))] rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {type.includes('email') && <Mail className="w-5 h-5 text-[rgb(var(--primary))]" />}
                  {type.includes('contact') && <MessageSquare className="w-5 h-5 text-[rgb(var(--primary))]" />}
                  {type.includes('gallery') && <ImageIcon className="w-5 h-5 text-[rgb(var(--primary))]" />}
                  {type.includes('social') && <Heart className="w-5 h-5 text-[rgb(var(--primary))]" />}
                </div>
                <p className="text-sm text-[rgb(var(--fg-muted))] capitalize">
                  {type.replace(/_/g, ' ')}
                </p>
                <p className="text-lg font-bold text-[rgb(var(--fg))]">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Summary */}
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[rgb(var(--fg))] mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Period Summary ({timeRangeOptions.find(opt => opt.value === timeRange)?.label})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[rgb(var(--primary))]">{formatNumber(metrics.totalPageViews || 0)}</p>
            <p className="text-sm text-[rgb(var(--fg-muted))]">Total Page Views</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[rgb(var(--primary))]">{formatNumber(metrics.uniqueVisitors || 0)}</p>
            <p className="text-sm text-[rgb(var(--fg-muted))]">Unique Visitors</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[rgb(var(--primary))]">{formatNumber(metrics.totalImageViews || 0)}</p>
            <p className="text-sm text-[rgb(var(--fg-muted))]">Image Views</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[rgb(var(--primary))]">{formatNumber(metrics.totalInteractions || 0)}</p>
            <p className="text-sm text-[rgb(var(--fg-muted))]">Total Interactions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

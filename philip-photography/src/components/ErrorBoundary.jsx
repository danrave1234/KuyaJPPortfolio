import React from 'react';
import { RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-[rgb(var(--bg))] transition-colors duration-300 flex items-center justify-center p-2 sm:p-4 pt-20 sm:pt-24">
          <div className="w-full max-w-2xl mx-auto">
            <div className="text-center">
              {/* Error Message */}
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-red-500 mb-2 sm:mb-3 font-heading px-2">
                  Something Went Wrong
                </h1>
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-[rgb(var(--fg))] mb-2 sm:mb-3 font-heading px-2">
                  We're Sorry for the Inconvenience
                </h2>
                <p className="text-[rgb(var(--fg-muted))] text-sm sm:text-base mb-3 sm:mb-4 max-w-xl mx-auto px-2 leading-relaxed">
                  An unexpected error occurred while loading this page. 
                  Don't worry, our wildlife photography is still safe and sound!
                </p>
              </div>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-left mx-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                    Error Details (Development Only):
                  </h3>
                  <details className="text-xs text-red-700 dark:text-red-300">
                    <summary className="cursor-pointer mb-2">Click to expand</summary>
                    <pre className="whitespace-pre-wrap overflow-auto max-h-32 sm:max-h-40 text-xs">
                      {this.state.error && this.state.error.toString()}
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center mb-4 sm:mb-6 px-2">
                <button
                  onClick={this.handleReset}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
                
                <Link
                  to="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[rgb(var(--bg))] hover:bg-[rgb(var(--bg-muted))] text-[rgb(var(--fg))] border border-[rgb(var(--border))] px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg text-sm"
                >
                  <Home size={16} />
                  Go Home
                </Link>
              </div>

              {/* Additional Help */}
              <div className="border-t border-[rgb(var(--border))] pt-3 sm:pt-4 px-2">
                <p className="text-xs text-[rgb(var(--fg-muted))] mb-2">
                  If this problem persists, please:
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center text-xs">
                  <Link
                    to="/contact"
                    className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))]/80 hover:underline transition-colors duration-200"
                  >
                    Contact Us
                  </Link>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))]/80 hover:underline transition-colors duration-200"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;

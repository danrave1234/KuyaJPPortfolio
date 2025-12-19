import Link from 'next/link'
import { Home, ArrowLeft, Camera } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] transition-colors duration-300 flex items-center justify-center p-2 sm:p-4 pt-20 sm:pt-24">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center">
          {/* 404 Number */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[rgb(var(--primary))] mb-2 sm:mb-3 font-heading">
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[rgb(var(--fg))] mb-2 sm:mb-3 font-heading px-2">
              Oops! Page Not Found
            </h2>
            <p className="text-[rgb(var(--muted))] text-sm sm:text-base md:text-lg mb-3 sm:mb-4 max-w-xl mx-auto px-2 leading-relaxed">
              The page you're looking for seems to have flown away like a bird in the wild. 
              Let's get you back to exploring amazing wildlife photography.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center mb-6 sm:mb-8 px-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
            >
              <Home size={16} />
              Go Home
            </Link>
            
            <Link
              href="/gallery"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[rgb(var(--bg))] hover:bg-gray-100 dark:hover:bg-gray-800 text-[rgb(var(--fg))] border border-gray-300 dark:border-gray-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg text-sm"
            >
              <Camera size={16} />
              View Gallery
            </Link>
          </div>

          {/* Quick Navigation */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6 px-2">
            <h3 className="text-sm sm:text-base font-semibold text-[rgb(var(--fg))] mb-2 sm:mb-3">
              Quick Navigation
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              <Link
                href="/"
                className="text-xs sm:text-sm text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))]/80 hover:underline transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="/gallery"
                className="text-xs sm:text-sm text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))]/80 hover:underline transition-colors duration-200"
              >
                Gallery
              </Link>
              <Link
                href="/about"
                className="text-xs sm:text-sm text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))]/80 hover:underline transition-colors duration-200"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-xs sm:text-sm text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))]/80 hover:underline transition-colors duration-200"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-4 sm:mt-6 px-2">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1 text-xs sm:text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors duration-200"
            >
              <ArrowLeft size={12} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

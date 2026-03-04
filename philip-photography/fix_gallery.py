import os

file_path = r'c:\Users\Danrave\Desktop\Project\KuyaJPPortfolio\philip-photography\app\page-components\Gallery.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def replace_lines(lines, start_idx, end_idx, new_text):
    # Split new_text into lines with trailing newlines
    new_lines = [line + '\n' for line in new_text.split('\n')]
    # Remove the last empty newline if it resulted from a trailing \n
    if new_lines and new_lines[-1] == '\n':
        new_lines.pop()
    
    return lines[:start_idx] + new_lines + lines[end_idx:]

chunk3_text = """                // Determine overlay height based on image orientation
                const dimensions = imageDimensions[art.id]
                const aspectRatio = dimensions?.aspectRatio || 1

                return (
                  <figure
                    key={uniqueKey}
                    className={`group cursor-pointer ${gridClasses} rounded-xl overflow-hidden relative`}
                    onClick={() => {
                      // Track image view in analytics
                      if (analytics) {
                        logEvent(analytics, 'view_item', {
                          item_id: art.id,
                          item_name: art.title,
                          item_category: 'photography',
                          item_variant: art.isSeries ? 'series' : 'single'
                        })
                      }

                      // Track image view with custom analytics
                      trackImageView({
                        id: art.id,
                        title: art.title,
                        path: art.src,
                        isFeatured: false
                      }, {
                        isSeries: art.isSeries,
                        seriesIndex: i,
                        galleryType: 'main'
                      });

                      // We use album grouping, so art is directly passed
                      handleImageClick(art, 0);
                    }}
                  >
                    <div className="w-full h-full relative overflow-hidden bg-gray-900 border border-[rgb(var(--muted))]/10">
                      <img
                        src={imageSrc}
                        alt={art.title || ''}
                        className="w-full h-full object-cover"
                        style={{
                          opacity: loadedImages.has(art.id) ? 1 : 0,
                          transition: 'opacity 0.7s ease-in-out'
                        }}
                        onLoad={(e) => {
                          const { naturalWidth, naturalHeight } = e.target
                          handleImageLoad(art.id, naturalWidth, naturalHeight)
                          // Small delay to ensure smooth fade-in
                          setTimeout(() => {
                            setLoadedImages(prev => new Set([...prev, art.id]))
                          }, 50)
                        }}
                      />

                      {/* Standardized Gradient Overlay - Consistent across all aspect ratios */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100" />

                      {/* Series Album Cover Badge */}
                      {art.isSeriesAlbum && (
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1.5 border border-white/20 z-10 transition-opacity duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-lg">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                          <span className="text-white text-[10px] sm:text-xs font-medium tracking-wide">
                            {art.seriesTotal} Photos
                          </span>
                        </div>
                      )}

                      {/* Content Overlay - Standardized padding and typography */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transition-all duration-500 ease-out transform translate-y-0 opacity-100 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 flex items-end">
                        <div className="flex flex-col w-full">
                          <h3 className="text-white font-medium text-xs sm:text-sm lg:text-base leading-tight tracking-wide drop-shadow-md line-clamp-2">
                            {art.title}
                          </h3>
                          {art.scientificName && (
                            <p className="text-white/70 text-[10px] sm:text-xs italic font-serif mt-0.5 tracking-wide line-clamp-1">
                              {art.scientificName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </figure>
                )"""

chunk2_text = """    const { aspectRatio } = dimensions

    // Smart grid assignment based strictly on aspect ratio for consistency
    if (aspectRatio < 0.8) {
      // Portrait - always use medium (1 column, 2 rows)
      return 'medium'
    } else if (aspectRatio > 1.8) {
      // Very wide panorama - use wide (2 columns, 1 row)
      return 'wide'
    } else if (aspectRatio >= 1.2 && aspectRatio <= 1.8) {
      // Landscape - large (2 columns, 2 rows) or small based on hash to preserve some variety
      const hash = artwork.id ? artwork.id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0) : Math.random() * 1000;
      return Math.abs(hash) % 4 === 0 ? 'large' : 'small' 
    } else {
      // Squareish - small
      return 'small'
    }
  }"""

chunk1_text = """  // Group series into album covers instead of unrolling them
  const processedArtworks = displayedArtworks.map(art => {
    if (art.isSeries && art.images && art.images.length > 0) {
      const coverImage = art.images[0];
      return {
        ...art,
        id: coverImage.id || art.id, // Prefer cover image ID for dimension matching
        src: coverImage.src,
        isSeriesAlbum: true,
        seriesTotal: art.images.length,
      };
    }
    return art;
  });

  // Deduplicate processed artworks based on unique identifier
  const deduplicatedArtworks = processedArtworks.filter((art, index, array) => {
    const uniqueKey = art.src || art.id;
    return array.findIndex(item =>
      (item.src || item.id) === uniqueKey
    ) === index;
  });"""

# Reverse order replacements to preserve line numbers
new_lines = replace_lines(lines, 1039, 1125, chunk3_text)
new_lines = replace_lines(new_lines, 763, 784, chunk2_text)
new_lines = replace_lines(new_lines, 669, 728, chunk1_text)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Replaced successfully!")

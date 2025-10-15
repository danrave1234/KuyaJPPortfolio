// Utility function to generate SEO-friendly slugs from bird names and scientific names

/**
 * Generate a URL-safe slug from bird name and scientific name
 * @param {string} title - The bird's common name
 * @param {string} scientificName - The bird's scientific name (optional)
 * @param {string} id - The image ID for uniqueness (optional)
 * @returns {string} - SEO-friendly slug
 */
export const generateSlug = (title, scientificName = '', id = '') => {
  // Start with the title
  let slug = title || 'untitled';
  
  // Add scientific name if available
  if (scientificName && scientificName.trim()) {
    // Remove italic formatting if present
    const cleanScientificName = scientificName.replace(/<\/?em>/g, '').replace(/<\/?i>/g, '').trim();
    slug += `-${cleanScientificName}`;
  }
  
  // Add ID for uniqueness if provided
  if (id) {
    slug += `-${id}`;
  }
  
  // Convert to lowercase
  slug = slug.toLowerCase();
  
  // Replace spaces and special characters with hyphens
  slug = slug
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^\w\-]/g, '')        // Remove special characters except hyphens and word chars
    .replace(/-+/g, '-')            // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens
  
  // Ensure slug is not empty
  if (!slug) {
    slug = 'image';
  }
  
  // Add timestamp if still empty or too short
  if (slug.length < 3) {
    slug += `-${Date.now().toString(36)}`;
  }
  
  return slug;
};

/**
 * Extract image ID from a slug (last segment after final hyphen)
 * @param {string} slug - The slug to extract ID from
 * @returns {string} - The extracted ID or empty string
 */
export const extractIdFromSlug = (slug) => {
  if (!slug) return '';
  
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Check if last part looks like an ID (alphanumeric, possibly with numbers)
  if (/^[a-zA-Z0-9]+$/.test(lastPart) && lastPart.length > 3) {
    return lastPart;
  }
  
  return '';
};

/**
 * Generate a readable title from a slug (reverse of generateSlug)
 * @param {string} slug - The slug to convert back to title
 * @returns {string} - Human-readable title
 */
export const slugToTitle = (slug) => {
  if (!slug) return '';
  
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Validate if a slug is properly formatted
 * @param {string} slug - The slug to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  
  // Check if slug contains only allowed characters
  const validSlugRegex = /^[a-z0-9\-]+$/;
  return validSlugRegex.test(slug) && slug.length > 0;
};


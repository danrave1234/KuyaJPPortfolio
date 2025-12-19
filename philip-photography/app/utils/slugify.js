export const generateSlug = (title, scientificName = '', id = '') => {
  let slug = title || 'untitled'
  
  if (scientificName && scientificName.trim()) {
    const cleanScientificName = scientificName.replace(/<\/?em>/g, '').replace(/<\/?i>/g, '').trim()
    slug += `-${cleanScientificName}`
  }
  
  if (id) {
    slug += `-${id}`
  }
  
  slug = slug.toLowerCase()
  
  slug = slug
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  if (!slug) {
    slug = 'image'
  }
  
  if (slug.length < 3) {
    slug += `-${Date.now().toString(36)}`
  }
  
  return slug
}

export const extractIdFromSlug = (slug) => {
  if (!slug) return ''
  
  const parts = slug.split('-')
  const lastPart = parts[parts.length - 1]
  
  if (/^[a-zA-Z0-9]+$/.test(lastPart) && lastPart.length > 3) {
    return lastPart
  }
  
  return ''
}

export const slugToTitle = (slug) => {
  if (!slug) return ''
  
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false
  
  const validSlugRegex = /^[a-z0-9\-]+$/
  return validSlugRegex.test(slug) && slug.length > 0
}





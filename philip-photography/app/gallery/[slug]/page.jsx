import React from 'react'
import { metadata as baseMetadata } from '../../metadata'
import GalleryClient from '../../components/GalleryClient'
import { generateSlug } from '../../utils/slugify'

export const metadata = {
  ...baseMetadata,
  title: 'Wildlife & Nature Photography Gallery - John Philip Morada',
  description: 'Explore the wildlife and nature photography gallery by John Philip Morada. Featuring Philippine wildlife, birds, and nature photography.',
}

// Generate static params for static export
export async function generateStaticParams() {
  try {
    // Fetch images from Firebase Cloud Function API
    const functionsURL = 'https://asia-southeast1-kuyajp-portfolio.cloudfunctions.net'
    const response = await fetch(`${functionsURL}/getGalleryImages?folder=gallery&page=1&limit=1000`, {
      // Use a longer timeout for build time
      signal: AbortSignal.timeout(30000) // 30 seconds
    })
    
    if (!response.ok) {
      console.warn('Failed to fetch gallery images for static params, returning empty array')
      return []
    }
    
    const data = await response.json()
    
    if (!data.success || !data.images || data.images.length === 0) {
      return []
    }
    
    // Generate slugs for each image
    const slugs = data.images.map((image) => {
      const title = image.title || image.name || 'untitled'
      const scientificName = image.scientificName || ''
      const id = image.id || image.name || ''
      
      // Extract ID from filename if needed (e.g., "image_1.jpg" -> "1")
      let cleanId = id
      if (id.includes('_')) {
        const match = id.match(/_(\d+)/)
        if (match) {
          cleanId = match[1]
        }
      }
      
      const slug = generateSlug(title, scientificName, cleanId)
      return { slug }
    })
    
    // Remove duplicates
    const uniqueSlugs = Array.from(new Set(slugs.map(s => s.slug))).map(slug => ({ slug }))
    
    return uniqueSlugs
  } catch (error) {
    console.warn('Error generating static params for gallery slugs:', error.message)
    // Return empty array on error - static export requires all params at build time
    return []
  }
}

export default function GallerySlug({ params }) {
  const { slug } = React.use(params)
  return <GalleryClient slug={slug} />
}





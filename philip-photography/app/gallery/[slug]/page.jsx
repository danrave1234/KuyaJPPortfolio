import React from 'react'
import { metadata as baseMetadata } from '../../metadata'
import GalleryClient from '../../components/GalleryClient'
import { generateSlug } from '../../utils/slugify'

// Function to fetch images
async function getImages() {
  const functionsURL = 'https://asia-southeast1-kuyajp-portfolio.cloudfunctions.net'
  const response = await fetch(`${functionsURL}/getGalleryImages?folder=gallery&page=1&limit=1000`, {
    next: { revalidate: 3600 } // Revalidate every hour
  })
  
  if (!response.ok) return null
  const data = await response.json()
  return data.success ? data.images : null
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const images = await getImages()
  
  if (!images) return baseMetadata

  // Find the image that matches the slug
  const image = images.find(img => {
    const title = img.title || img.name || 'untitled'
    const scientificName = img.scientificName || ''
    const id = img.id || img.name || ''
    
    let cleanId = id
    if (id.includes('_')) {
      const match = id.match(/_(\d+)/)
      if (match) cleanId = match[1]
    }
    
    return generateSlug(title, scientificName, cleanId) === slug
  })

  if (!image) return baseMetadata

  const title = image.title || 'Untitled'
  const scientificName = image.scientificName ? ` (${image.scientificName})` : ''
  const displayTitle = `${title}${scientificName} - Wildlife Photography by John Philip Morada`
  const description = image.description || `Explore the stunning wildlife photography of ${title}${image.scientificName ? ` (${image.scientificName})` : ''} captured by John Philip Morada.`
  const imageUrl = image.src || ''

  return {
    ...baseMetadata,
    title: displayTitle,
    description: description,
    openGraph: {
      ...baseMetadata.openGraph,
      title: displayTitle,
      description: description,
      images: imageUrl ? [{ url: imageUrl }] : baseMetadata.openGraph?.images,
      type: 'article',
    },
    twitter: {
      ...baseMetadata.twitter,
      title: displayTitle,
      description: description,
      images: imageUrl ? [imageUrl] : baseMetadata.twitter?.images,
    }
  }
}

// Generate static params for static export
export async function generateStaticParams() {
  try {
    const images = await getImages()
    
    if (!images || images.length === 0) {
      return []
    }
    
    // Generate slugs for each image
    const slugs = images.map((image) => {
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





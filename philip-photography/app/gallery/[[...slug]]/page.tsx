import { Metadata } from 'next'
import GalleryClient from '../../components/GalleryClient'
import { metadata as baseMetadata } from '../../metadata'

const FIREBASE_API_BASE = 'https://asia-southeast1-kuyajp-portfolio.cloudfunctions.net'
const THEMES = ['birdlife', 'astro', 'landscape']
const BASE_URL = 'https://jpmorada.photography'

// Extract a human-readable title from a slug
// e.g. "philippine-coucal-centropus-viridis-1" → "Philippine Coucal Centropus Viridis"
function titleFromSlug(slug: string): string {
    return slug
        .replace(/-\d+$/, '')                      // remove trailing series number
        .replace(/-/g, ' ')                         // hyphens → spaces
        .replace(/\b\w/g, (c) => c.toUpperCase())  // title-case
        .trim()
}

interface PhotoData {
    title?: string
    description?: string
    scientificName?: string
    location?: string
    alt?: string
    src?: string
    galleryUrl?: string
    theme?: string
}

// Fetch all photo slugs across all themes for static generation at build time
export async function generateStaticParams(): Promise<Array<{ slug: string[] }>> {
    const slugs = new Set<string>()

    for (const theme of THEMES) {
        try {
            let page = 1
            let hasMore = true
            while (hasMore) {
                const url = `${FIREBASE_API_BASE}/getGalleryImages?folder=gallery/${theme}&page=${page}&limit=50`
                const res = await fetch(url)
                if (!res.ok) break
                const data = await res.json()
                const images: PhotoData[] = data?.images || []
                for (const img of images) {
                    const slug = img.galleryUrl?.split('/').pop()
                    if (slug) slugs.add(slug)
                }
                hasMore = data?.pagination?.hasMore === true
                page++
            }
        } catch {
            // skip theme on error
        }
    }

    // Always include the known category slugs as fallback
    slugs.add('birdlife')
    slugs.add('astro')
    slugs.add('landscape')

    const params = Array.from(slugs).map((slug) => ({ slug: [slug] }))

    // Include the empty slug for the root gallery page
    params.push({ slug: [] })

    return params
}

// Fetch photo metadata from Firebase by searching across all themes
async function fetchPhotoBySlug(slug: string): Promise<PhotoData | null> {
    const searchTitle = slug.replace(/-\d+$/, '').replace(/-/g, ' ')

    for (const theme of THEMES) {
        try {
            const url = `${FIREBASE_API_BASE}/searchGalleryImages?folder=gallery/${theme}&q=${encodeURIComponent(searchTitle)}&page=1&limit=5`
            const res = await fetch(url, { next: { revalidate: 3600 } })
            if (!res.ok) continue
            const data = await res.json()
            if (data?.images?.length > 0) {
                // Prefer exact slug match; fall back to first result
                const match: PhotoData =
                    data.images.find((img: PhotoData) => {
                        const imgSlug = img.galleryUrl?.split('/').pop() || ''
                        return imgSlug === slug
                    }) || data.images[0]
                return { ...match, theme }
            }
        } catch {
            // continue to next theme
        }
    }
    return null
}

function themeLabel(theme?: string): string {
    if (theme === 'astro') return 'Astrophotography'
    if (theme === 'landscape') return 'Landscape Photography'
    return 'Wildlife Photography'
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug?: string[] }>
}): Promise<Metadata> {
    const { slug: slugArray } = await params
    const slug = slugArray?.[0]

    if (!slug) {
        return {
            ...baseMetadata,
            title: 'Photography Gallery - John Philip Morada | Wildlife, Astro & Landscape',
            description: 'Explore the photography gallery of John Philip Morada. Browse wildlife & bird photography, astrophotography, and landscape photography from the Philippines and beyond.',
            alternates: {
                canonical: '/gallery',
            },
        }
    }

    const fallbackTitle = titleFromSlug(slug)

    try {
        const photo = await fetchPhotoBySlug(slug)

        if (photo) {
            const label = themeLabel(photo.theme)
            const title = photo.scientificName
                ? `${photo.title || fallbackTitle} (${photo.scientificName}) - ${label} by John Philip Morada`
                : `${photo.title || fallbackTitle} - ${label} by John Philip Morada`

            const description =
                photo.description ||
                (photo.location
                    ? `${photo.title || fallbackTitle} captured in ${photo.location}. Photography by John Philip Morada.`
                    : `${photo.title || fallbackTitle} — photography by John Philip Morada.`)

            const canonicalUrl = `${BASE_URL}/gallery/${slug}`

            return {
                title,
                description,
                alternates: { canonical: `/gallery/${slug}` },
                openGraph: {
                    title,
                    description,
                    url: canonicalUrl,
                    images: photo.src
                        ? [{ url: photo.src, alt: photo.alt || photo.title || fallbackTitle }]
                        : undefined,
                    type: 'article',
                },
                twitter: {
                    card: 'summary_large_image',
                    title,
                    description,
                    images: photo.src ? [photo.src] : undefined,
                },
            }
        }
    } catch {
        // Fall through to slug-based fallback
    }

    // Fallback metadata derived from slug only
    const fallbackDescription = `${fallbackTitle} — photography by John Philip Morada. Explore the full gallery at jpmorada.photography.`
    return {
        title: `${fallbackTitle} - Photography by John Philip Morada`,
        description: fallbackDescription,
        alternates: { canonical: `/gallery/${slug}` },
    }
}

export default async function GalleryCatchAllPage({
    params,
}: {
    params: Promise<{ slug?: string[] }>
}) {
    const { slug: slugArray } = await params
    const slug = slugArray?.[0]

    return <GalleryClient slug={slug} />
}

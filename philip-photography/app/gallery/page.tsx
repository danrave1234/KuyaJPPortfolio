import { metadata as baseMetadata } from '../metadata'
import GalleryClient from '../components/GalleryClient'

export const metadata = {
  ...baseMetadata,
  title: 'Photography Gallery - John Philip Morada | Wildlife, Astro & Landscape',
  description:
    'Explore the photography gallery of John Philip Morada. Browse wildlife & bird photography, astrophotography, and landscape photography from the Philippines and beyond.',
  alternates: {
    canonical: '/gallery',
  },
}

export default function GalleryPage() {
  return <GalleryClient />
}
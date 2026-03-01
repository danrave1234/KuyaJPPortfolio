import { metadata as baseMetadata } from '../../metadata'
import GalleryClient from '../../components/GalleryClient'

export const metadata = {
  ...baseMetadata,
  title: 'Landscape Photography Gallery - John Philip Morada | Philippines & Beyond',
  description: 'Explore the landscape photography gallery by John Philip Morada. Featuring mountains, seascapes, rice terraces, forests, and stunning natural scenery from the Philippines.',
  keywords: 'landscape photography, Philippine landscapes, seascape photography, mountain photography, nature scenery, John Philip Morada, travel photography, landscape portfolio Philippines',
  alternates: {
    canonical: '/gallery/landscape',
  },
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'Landscape Photography Gallery - John Philip Morada | Philippines & Beyond',
    description: 'Explore the landscape photography gallery by John Philip Morada. Featuring mountains, seascapes, rice terraces, forests, and stunning natural scenery from the Philippines.',
    url: 'https://jpmorada.photography/gallery/landscape',
  },
}

export default function LandscapeGallery() {
  return <GalleryClient category="landscape" />
}

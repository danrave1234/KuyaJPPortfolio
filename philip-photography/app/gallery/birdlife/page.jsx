import { metadata as baseMetadata } from '../../metadata'
import GalleryClient from '../../components/GalleryClient'

export const metadata = {
  ...baseMetadata,
  title: 'Wildlife & Bird Photography Gallery - John Philip Morada',
  description: 'Explore the wildlife and bird photography gallery by John Philip Morada. Featuring Philippine birds, wildlife portraits, and nature photography from the field.',
  keywords: 'wildlife photography, bird photography, Philippine birds, Philippine wildlife, John Philip Morada, nature photography, avian photography, wildlife portfolio',
  alternates: {
    canonical: '/gallery/birdlife',
  },
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'Wildlife & Bird Photography Gallery - John Philip Morada',
    description: 'Explore the wildlife and bird photography gallery by John Philip Morada. Featuring Philippine birds, wildlife portraits, and nature photography from the field.',
    url: 'https://jpmorada.photography/gallery/birdlife',
  },
}

export default function BirdlifeGallery() {
  return <GalleryClient category="birdlife" />
}

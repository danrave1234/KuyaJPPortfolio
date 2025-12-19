import { metadata as baseMetadata } from '../metadata'
import GalleryClient from '../components/GalleryClient'

export const metadata = {
  ...baseMetadata,
  title: 'Wildlife & Nature Photography Gallery - John Philip Morada',
  description: 'Explore the wildlife and nature photography gallery by John Philip Morada. Featuring Philippine wildlife, birds, and nature photography.',
}

export default function Gallery() {
  return <GalleryClient />
}





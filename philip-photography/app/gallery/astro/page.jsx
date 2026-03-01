import { metadata as baseMetadata } from '../../metadata'
import GalleryClient from '../../components/GalleryClient'

export const metadata = {
  ...baseMetadata,
  title: 'Astrophotography Gallery - John Philip Morada | Deep Sky & Night Sky',
  description: 'Explore the astrophotography gallery by John Philip Morada. Featuring deep sky objects, nebulae, star trails, and the Milky Way captured from the Philippines.',
  keywords: 'astrophotography, deep sky photography, night sky photography, nebula photography, Milky Way photography, John Philip Morada, star trails, astro portfolio Philippines',
  alternates: {
    canonical: '/gallery/astro',
  },
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'Astrophotography Gallery - John Philip Morada | Deep Sky & Night Sky',
    description: 'Explore the astrophotography gallery by John Philip Morada. Featuring deep sky objects, nebulae, star trails, and the Milky Way captured from the Philippines.',
    url: 'https://jpmorada.photography/gallery/astro',
  },
}

export default function AstroGallery() {
  return <GalleryClient category="astro" />
}

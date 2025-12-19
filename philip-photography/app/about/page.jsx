import { metadata as baseMetadata } from '../metadata'
import AboutClient from '../components/AboutClient'

export const metadata = {
  ...baseMetadata,
  title: 'About John Philip Morada - Wildlife & Nature Photographer',
  description: 'Learn about John Philip Morada, a professional wildlife and nature photographer specializing in Philippine wildlife, birds, and nature conservation.',
  alternates: {
    canonical: '/about',
  },
}

export default function About() {
  return <AboutClient />
}





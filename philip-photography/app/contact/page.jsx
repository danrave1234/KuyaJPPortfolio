import { metadata as baseMetadata } from '../metadata'
import ContactClient from '../components/ContactClient'

export const metadata = {
  ...baseMetadata,
  title: 'Contact John Philip Morada - Wildlife Photography Services',
  description: 'Contact John Philip Morada for wildlife and nature photography services, bookings, and collaborations. Based in Batangas, Luzon, Philippines.',
  alternates: {
    canonical: '/contact',
  },
}

export default function Contact() {
  return <ContactClient />
}





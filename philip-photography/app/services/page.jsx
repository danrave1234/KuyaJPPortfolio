import { metadata as baseMetadata } from '../metadata'
import ServicesClient from '../components/ServicesClient'

export const metadata = {
  ...baseMetadata,
  title: 'Wildlife & Bird Photography Services | Batangas, Luzon',
  description: 'Professional wildlife and bird photography services based in Batangas, Luzon. Assignments across Batangas, Metro Manila, and Southern Luzon. Ethical, fieldcraft-first approach.',
  keywords: 'bird photographer Batangas, wildlife photographer Luzon, bird photography services, Metro Manila wildlife photography',
}

export default function Services() {
  return <ServicesClient />
}





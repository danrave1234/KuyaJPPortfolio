import { metadata as homeMetadata } from './metadata'
import HomeClient from './components/HomeClient'

export const metadata = {
  ...homeMetadata,
  title: 'Japi Morada Photography - John Philip Morada Wildlife & Nature Photography Portfolio',
  description: 'Japi Morada Photography - Professional wildlife and nature photography by John Philip Morada. Capturing the beauty of Philippine wildlife, birds, and nature through patient observation and storytelling.',
}

export default function Home() {
  return <HomeClient />
}





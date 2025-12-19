import { metadata as baseMetadata } from '../metadata'
import AdminClient from '../components/AdminClient'
import ProtectedRoute from '../components/ProtectedRoute'

export const metadata = {
  ...baseMetadata,
  title: 'Admin Dashboard - John Philip Morada Photography',
  description: 'Admin dashboard for managing photography portfolio.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function Admin() {
  return (
    <ProtectedRoute>
      <AdminClient />
    </ProtectedRoute>
  )
}





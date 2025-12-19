import Link from 'next/link'
import NotFoundClient from './components/NotFoundClient'

export const metadata = {
  title: '404 - Page Not Found | John Philip Morada Photography',
  description: 'The page you are looking for could not be found.',
}

export default function NotFound() {
  return <NotFoundClient />
}





import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/src/contexts/AuthContext'
import { ThemeProvider } from '@/src/components/ThemeProvider'
import Navbar from '@/app/components/Navbar'
import ConditionalFooter from '@/app/components/ConditionalFooter'
import BackToTop from '@/app/components/BackToTop'
import ErrorBoundary from '@/app/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://jpmorada.photography'),
  title: 'Japi Morada Photography - John Philip Morada Wildlife & Nature Photography Portfolio',
  description: 'Japi Morada Photography - Professional wildlife and nature photography by John Philip Morada. Capturing the beauty of Philippine wildlife, birds, and nature through patient observation and storytelling. Available for photography bookings and collaborations.',
  keywords: 'Japi Morada, Japi Photography, John Philip Photography, John Philip Morada Photography, John Philip Morada Portfolio, wildlife photography, nature photography, bird photography, Philippine wildlife, John Philip Morada, nature conservation, wildlife art, photographer Philippines, wildlife photographer, nature photographer, bird photographer, Philippine birds, wildlife portfolio, nature portfolio, photography services, wildlife booking, nature photography booking',
  authors: [{ name: 'John Philip Morada' }],
  creator: 'John Philip Morada',
  publisher: 'John Philip Morada',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Japi Morada Photography - John Philip Morada Wildlife & Nature Photography Portfolio',
    description: 'Japi Morada Photography - Professional wildlife and nature photography by John Philip Morada. Capturing the beauty of Philippine wildlife, birds, and nature through patient observation and storytelling. Available for photography bookings and collaborations.',
    siteName: 'John Philip Morada Photography',
    images: [
      {
        url: '/LightmodeLogo.png',
        width: 1200,
        height: 630,
        alt: 'John Philip Morada Photography',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Japi Morada Photography - John Philip Morada Wildlife & Nature Photography Portfolio',
    description: 'Japi Morada Photography - Professional wildlife and nature photography by John Philip Morada. Capturing the beauty of Philippine wildlife, birds, and nature through patient observation and storytelling.',
    images: ['/LightmodeLogo.png'],
    creator: '@kuyajp',
    site: '@kuyajp',
  },
  icons: {
    icon: [
      { url: '/LightmodeLogo.png', sizes: '16x16' },
      { url: '/LightmodeLogo.png', sizes: '32x32' },
      { url: '/LightmodeLogo.png', sizes: '48x48' },
      { url: '/LightmodeLogo.png', sizes: '96x96' },
      { url: '/LightmodeLogo.png', sizes: '192x192' },
    ],
    apple: [
      { url: '/LightmodeLogo.png', sizes: '180x180' },
    ],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  other: {
    'geo.region': 'PH',
    'geo.placename': 'Batangas, Luzon, Philippines',
    'geo.position': '14.7943;120.8786',
    'ICBM': '14.7943, 120.8786',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#3B82F6',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking script to prevent theme flash - must run before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="icon" type="image/svg+xml" href="/LightmodeLogo.svg" media="(prefers-color-scheme: light)" />
        <link rel="icon" type="image/svg+xml" href="/DarkmodeLogo.svg" media="(prefers-color-scheme: dark)" />
        <link type="text/plain" rel="author" href="/humans.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'John Philip Morada',
              alternateName: 'John Philip Morada',
              jobTitle: 'Wildlife Photographer',
              description: 'Professional wildlife and nature photographer specializing in Philippine wildlife, birds, and nature conservation.',
              url: 'https://jpmorada.photography',
              image: 'https://jpmorada.photography/LightmodeLogo.png',
              sameAs: [
                'https://www.instagram.com/jpmorada_/',
                'https://www.facebook.com/john.morada.red',
              ],
              knowsAbout: [
                'Wildlife Photography',
                'Nature Photography',
                'Bird Photography',
                'Philippine Wildlife',
                'Nature Conservation',
              ],
              hasOccupation: {
                '@type': 'Occupation',
                name: 'Wildlife Photographer',
                description: 'Professional photographer specializing in wildlife and nature photography',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ProfessionalService',
              name: 'John Philip Morada Photography',
              description: 'Professional wildlife and nature photography services specializing in Philippine wildlife, birds, and nature conservation.',
              url: 'https://jpmorada.photography',
              logo: 'https://jpmorada.photography/LightmodeLogo.svg',
              image: 'https://jpmorada.photography/Hero.jpg',
              priceRange: '$$',
              telephone: '',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Bulacan',
                addressRegion: 'Luzon',
                addressCountry: 'Philippines',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: '14.7943',
                longitude: '120.8786',
              },
              sameAs: [
                'https://www.instagram.com/jpmorada_/',
                'https://www.facebook.com/john.morada.red',
              ],
              serviceType: [
                'Wildlife Photography',
                'Nature Photography',
                'Bird Photography',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'John Philip Morada Photography',
              url: 'https://jpmorada.photography',
              telephone: '+63 945 385 9776',
              image: 'https://jpmorada.photography/LightmodeLogo.png',
              logo: 'https://jpmorada.photography/LightmodeLogo.png',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Bulacan',
                addressRegion: 'Luzon',
                addressCountry: 'PH',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 14.7943,
                longitude: 120.8786,
              },
              areaServed: ['Bulacan', 'Metro Manila', 'Central Luzon'],
              sameAs: [
                'https://www.instagram.com/jpmorada_/',
                'https://www.facebook.com/john.morada.red',
              ],
              openingHoursSpecification: [{
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                opens: '08:00',
                closes: '18:00',
              }],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'John Philip Morada Photography',
              url: 'https://jpmorada.photography',
              description: 'Professional wildlife and nature photography portfolio by John Philip Morada',
              publisher: {
                '@type': 'Person',
                name: 'John Philip Morada',
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://jpmorada.photography/gallery?search={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://jpmorada.photography/',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Gallery',
                  item: 'https://jpmorada.photography/gallery',
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: 'About',
                  item: 'https://jpmorada.photography/about',
                },
                {
                  '@type': 'ListItem',
                  position: 4,
                  name: 'Contact',
                  item: 'https://jpmorada.photography/contact',
                },
              ],
            }),
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <ErrorBoundary>
              <Navbar />
              <main>{children}</main>
              <ConditionalFooter />
              <BackToTop />
            </ErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}





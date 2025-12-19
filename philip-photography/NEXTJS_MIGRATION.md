# Next.js Migration Guide

This document outlines the migration from React + Vite to Next.js for better SEO.

## What Has Been Migrated

### ✅ Completed
1. **Next.js Project Structure**
   - Created `app/` directory with App Router structure
   - Set up `app/layout.jsx` with proper metadata API
   - Created page routes: `/`, `/gallery`, `/gallery/[slug]`, `/about`, `/services`, `/contact`, `/admin`

2. **Components**
   - Migrated Navbar to use Next.js `Link` and `usePathname`
   - Migrated Footer to use Next.js `useRouter`
   - Migrated BackToTop to use Next.js `usePathname`
   - Migrated ErrorBoundary (client component)
   - Created ThemeProvider for Next.js

3. **Configuration**
   - Updated `package.json` with Next.js dependencies
   - Created `next.config.js` with static export configuration
   - Updated `tailwind.config.js` for Next.js
   - Updated `firebase.json` to use `out` directory (Next.js static export)
   - Created `postcss.config.js` for Next.js

4. **SEO Improvements**
   - Implemented Next.js Metadata API in `app/layout.jsx`
   - Added structured data (JSON-LD) in layout
   - Created page-specific metadata exports
   - Removed dependency on client-side SEO component

## What Needs to Be Done

### ⚠️ Remaining Tasks

1. **Update Page Components**
   - Remove `react-router-dom` imports from all pages
   - Replace `Link` from `react-router-dom` with Next.js `Link`
   - Replace `useNavigate` with Next.js `useRouter`
   - Replace `useParams` with Next.js `useParams` (from `next/navigation`)
   - Remove `SEO` component usage (handled by Next.js metadata API)

2. **Update Components**
   - Update any components that use `react-router-dom` hooks
   - Ensure all components that need client-side features have `'use client'` directive

3. **Firebase Configuration**
   - Ensure Firebase initialization works with Next.js static export
   - Test Firebase Auth, Storage, and Firestore with static export

4. **Build & Deploy**
   - Test `npm run build` to ensure static export works
   - Update deployment scripts if needed
   - Verify Firebase Hosting configuration

## Migration Steps for Pages

### Example: Converting a Page Component

**Before (React Router):**
```jsx
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'

export default function Page() {
  const navigate = useNavigate()
  
  return (
    <>
      <SEO title="Page Title" />
      <Link to="/other">Link</Link>
      <button onClick={() => navigate('/other')}>Navigate</button>
    </>
  )
}
```

**After (Next.js):**
```jsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  
  return (
    <>
      {/* SEO handled by metadata export */}
      <Link href="/other">Link</Link>
      <button onClick={() => router.push('/other')}>Navigate</button>
    </>
  )
}
```

### Page Metadata

Each page should export metadata:

```jsx
import { metadata as baseMetadata } from '../metadata'

export const metadata = {
  ...baseMetadata,
  title: 'Page Title',
  description: 'Page description',
}
```

## Benefits of Next.js Migration

1. **Better SEO**
   - Server-side rendering (SSR) for better search engine indexing
   - Proper metadata API for each page
   - Structured data in HTML head

2. **Performance**
   - Automatic code splitting
   - Image optimization
   - Better caching strategies

3. **Developer Experience**
   - File-based routing
   - Built-in API routes
   - Better TypeScript support

## Testing Checklist

- [ ] All pages load correctly
- [ ] Navigation works (Navbar, Footer links)
- [ ] Firebase Auth works
- [ ] Firebase Storage images load
- [ ] Gallery modal/navigation works
- [ ] Admin page authentication works
- [ ] SEO metadata appears in page source
- [ ] Static export builds successfully
- [ ] Firebase Hosting deployment works

## Notes

- The project uses static export (`output: 'export'`) for Firebase Hosting compatibility
- Client components must have `'use client'` directive
- Server components (default) cannot use hooks or browser APIs
- Metadata is handled server-side via exports, not client-side components





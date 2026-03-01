'use client'

import { Suspense } from 'react'
import Gallery from '@/src/page-components/Gallery'

export default function GalleryClient({ slug = undefined, category = undefined }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <Gallery slug={slug} category={category} />
    </Suspense>
  )
}












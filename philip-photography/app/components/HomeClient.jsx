'use client'

import { useState } from 'react'
import Home from '@/src/page-components/Home'
import ScrollSnapContainer from './ScrollSnapContainer'

export default function HomeClient() {
  const [activeSection, setActiveSection] = useState('home')
  const [scrolled, setScrolled] = useState(false)

  const handleScroll = (scrollY) => {
    setScrolled(scrollY > 10)
  }

  return (
    <ScrollSnapContainer onActiveSectionChange={setActiveSection} onScroll={handleScroll}>
      <Home />
    </ScrollSnapContainer>
  )
}





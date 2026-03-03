'use client'

import { useState } from 'react'
import FadeInWhenVisible from '@/app/components/FadeInWhenVisible'
import { useTheme, THEME_CONTENT } from '@/src/contexts/ThemeContext'
import { useViewportScale } from '@/src/hooks/useViewportScale'

export default function About() {
  const { theme } = useTheme()
  const { scale, isFitNeeded } = useViewportScale(950, 0.8) // About is often longer, slightly different base
  const content = theme ? THEME_CONTENT[theme] : THEME_CONTENT.birdlife
  const [openFAQ, setOpenFAQ] = useState(null)

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  // Theme-specific images
  const THEME_IMAGES = {
    birdlife: {
      services: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop", // Camera kit
      what: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop", // Heron
      why: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop", // Forest fog
      how: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop", // Path
      approach: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1600&auto=format&fit=crop" // Forest sunlight
    },
    astro: {
      services: "/AstroHero.jpg",
      what: "/AstroHero.jpg",
      why: "/AstroHero.jpg",
      how: "/AstroHero.jpg",
      approach: "/AstroHero.jpg"
    },
    landscape: {
      services: "/LandscapeHero.jpg",
      what: "/LandscapeHero.jpg",
      why: "/LandscapeHero.jpg",
      how: "/LandscapeHero.jpg",
      approach: "/LandscapeHero.jpg"
    }
  }

  const images = THEME_IMAGES[theme] || THEME_IMAGES.birdlife

  return (
    <>
      <main className="min-h-screen bg-[rgb(var(--bg))] transition-colors duration-300">
        <div className="container-responsive pt-20 sm:pt-24 md:pt-20 lg:pt-24 pb-8 sm:pb-10 md:pb-12">
          <header
            className="mb-8 sm:mb-10 md:mb-12"
            style={{ transform: isFitNeeded ? `scale(${scale})` : 'none', transformOrigin: 'top center' }}
          >
            <FadeInWhenVisible>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                <div className="lg:col-span-7">
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 sm:mb-4 transition-colors duration-300">
                    {content.about?.tag || "About The Photographer"}
                  </div>
                  <h1 className="font-extrabold text-[rgb(var(--fg))] uppercase leading-[0.9] transition-colors duration-300">
                    <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                      <span className="inline-block">
                        {content.about?.title || "John Philip Morada"}
                        <span className="mt-1 sm:mt-2 block h-[3px] sm:h-[4px] w-full bg-[rgb(var(--primary))] rounded-full" />
                      </span>
                    </span>
                    <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl opacity-90">
                      {content.about?.intro?.subtitle || "Behind the Lens"}
                    </span>
                  </h1>
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[rgb(var(--muted))]/20 transition-colors duration-300">
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] transition-colors duration-300">Stories, craft, and dedication</div>
                  </div>
                </div>
                <div className="lg:col-span-5 lg:self-end mt-4 lg:mt-0">
                  <p className="text-[rgb(var(--muted))] text-sm sm:text-base md:text-lg leading-relaxed lg:border-l lg:border-[rgb(var(--muted))]/20 lg:pl-6 transition-colors duration-300">
                    {content.about?.intro?.text || content.about?.bio}
                  </p>
                </div>
              </div>
              <div className="mt-4 sm:mt-6 h-px w-full bg-[rgb(var(--muted))]/20 transition-colors duration-300" />
            </FadeInWhenVisible>
          </header>

          <FadeInWhenVisible delay={100}>
            <section className="prose prose-invert max-w-3xl mt-8 sm:mt-10">
              <p className="text-[rgb(var(--muted-fg))] text-sm sm:text-base md:text-lg leading-relaxed transition-colors duration-300">
                {content.about?.intro?.quote}
              </p>
            </section>
          </FadeInWhenVisible>

          {/* Authentic sections: what / why / how / approach */}
          <div className="mt-12 sm:mt-16 space-y-12 sm:space-y-16 lg:space-y-24">
            {/* Services section for local SEO */}
            <FadeInWhenVisible delay={200}>
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                <div className="sm:col-span-1 lg:col-span-6">
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 sm:mb-4 transition-colors duration-300">Services</div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 sm:mb-5 transition-colors duration-300">
                    {content.about?.services?.title}
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-[rgb(var(--muted-fg))] text-sm sm:text-base">
                    {content.about?.services?.items && content.about?.services?.items.map((item, index) => (
                      <li key={index}><span className="font-medium text-[rgb(var(--fg))]">{item}</span></li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <a href="/contact" className="inline-block px-6 py-3 rounded-full border border-[rgb(var(--muted))]/30 hover:border-[rgb(var(--primary))]/50 hover:bg-[rgb(var(--primary))]/5 hover:text-[rgb(var(--fg))] transition-all duration-300 text-sm font-medium">Inquire about availability</a>
                  </div>
                </div>
                <figure className="sm:col-span-1 lg:col-span-6 rounded-2xl overflow-hidden border border-[rgb(var(--muted))]/20 transition-colors duration-300 shadow-lg">
                  <img src={images.services} alt="Service highlight" className="w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
                </figure>
              </section>
            </FadeInWhenVisible>

            {/* What */}
            <FadeInWhenVisible delay={300}>
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                <div className="sm:col-span-1 lg:col-span-6 order-2 lg:order-1">
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 sm:mb-4 transition-colors duration-300">What I Photograph</div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 sm:mb-5 transition-colors duration-300">
                    {content.about?.what?.title}
                  </h3>
                  <p className="text-[rgb(var(--muted-fg))] text-sm sm:text-base leading-relaxed transition-colors duration-300">
                    {content.about?.what?.desc}
                  </p>
                </div>
                <figure className="sm:col-span-1 lg:col-span-6 order-1 lg:order-2 rounded-2xl overflow-hidden border border-[rgb(var(--muted))]/20 transition-colors duration-300 shadow-lg">
                  <img
                    src={images.what}
                    alt="Portfolio highlight"
                    className="w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </figure>
              </section>
            </FadeInWhenVisible>

            {/* Why */}
            <FadeInWhenVisible delay={300}>
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                <figure className="sm:col-span-1 lg:col-span-6 rounded-2xl overflow-hidden border border-[rgb(var(--muted))]/20 lg:order-1 order-2 transition-colors duration-300 shadow-lg">
                  <img
                    src={images.why}
                    alt="Atmospheric shot"
                    className="w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </figure>
                <div className="sm:col-span-1 lg:col-span-6 lg:order-2 order-1">
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 sm:mb-4 transition-colors duration-300">Why I Photograph</div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 sm:mb-5 transition-colors duration-300">
                    {content.about?.why?.title}
                  </h3>
                  <p className="text-[rgb(var(--muted-fg))] text-sm sm:text-base leading-relaxed transition-colors duration-300">
                    {content.about?.why?.desc}
                  </p>
                </div>
              </section>
            </FadeInWhenVisible>

            {/* How */}
            <FadeInWhenVisible delay={300}>
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                <div className="sm:col-span-1 lg:col-span-6 order-2 lg:order-1">
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 sm:mb-4 transition-colors duration-300">How I Work</div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 sm:mb-5 transition-colors duration-300">
                    {content.about?.how?.title}
                  </h3>
                  <p className="text-[rgb(var(--muted-fg))] text-sm sm:text-base leading-relaxed transition-colors duration-300">
                    {content.about?.how?.desc}
                  </p>
                </div>
                <figure className="sm:col-span-1 lg:col-span-6 order-1 lg:order-2 rounded-2xl overflow-hidden border border-[rgb(var(--muted))]/20 transition-colors duration-300 shadow-lg">
                  <img
                    src={images.how}
                    alt="Field work"
                    className="w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </figure>
              </section>
            </FadeInWhenVisible>

            {/* Approach & Ethics */}
            <FadeInWhenVisible delay={300}>
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                <figure className="sm:col-span-1 lg:col-span-6 rounded-2xl overflow-hidden border border-[rgb(var(--muted))]/20 lg:order-1 order-2 transition-colors duration-300 shadow-lg">
                  <img
                    src={images.approach}
                    alt="Habitat shot"
                    className="w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </figure>
                <div className="sm:col-span-1 lg:col-span-6 lg:order-2 order-1">
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 sm:mb-4 transition-colors duration-300">Approach & Ethics</div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 sm:mb-5 transition-colors duration-300">
                    {content.about?.philosophy?.title}
                  </h3>
                  <p className="text-[rgb(var(--muted-fg))] text-sm sm:text-base leading-relaxed transition-colors duration-300">
                    {content.about?.philosophy?.text}
                  </p>
                </div>
              </section>
            </FadeInWhenVisible>
          </div>

          {/* FAQ section - Enhanced */}
          <section className="mt-16 sm:mt-20 md:mt-24">
            <FadeInWhenVisible delay={400}>
              <div className="text-center mb-8 sm:mb-12">
                <h3 className="text-lg sm:text-xl font-semibold text-[rgb(var(--fg))] mb-3 sm:mb-4">Frequently Asked Questions</h3>
                <div className="w-16 sm:w-20 h-px bg-[rgb(var(--primary))] mx-auto"></div>
              </div>

              <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
                {/* FAQ 1 */}
                <div className="border border-[rgb(var(--muted))]/20 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(0)}
                    className="w-full px-6 py-4 text-left bg-[rgb(var(--muted))]/5 hover:bg-[rgb(var(--muted))]/10 transition-colors duration-300 flex items-center justify-between"
                  >
                    <span className="font-semibold text-[rgb(var(--fg))]">What's your photography background?</span>
                    <svg
                      className={`w-5 h-5 text-[rgb(var(--primary))] transition-transform duration-300 ${openFAQ === 0 ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFAQ === 0 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 py-4 text-sm text-[rgb(var(--muted-fg))] border-t border-[rgb(var(--muted))]/20">
                      {content.about?.bio}
                    </div>
                  </div>
                </div>

                {/* FAQ 2 */}
                <div className="border border-[rgb(var(--muted))]/20 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(1)}
                    className="w-full px-6 py-4 text-left bg-[rgb(var(--muted))]/5 hover:bg-[rgb(var(--muted))]/10 transition-colors duration-300 flex items-center justify-between"
                  >
                    <span className="font-semibold text-[rgb(var(--fg))]">Why do you focus on this genre?</span>
                    <svg
                      className={`w-5 h-5 text-[rgb(var(--primary))] transition-transform duration-300 ${openFAQ === 1 ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFAQ === 1 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 py-4 text-sm text-[rgb(var(--muted-fg))] border-t border-[rgb(var(--muted))]/20">
                      {content.about?.why?.desc}
                    </div>
                  </div>
                </div>

                {/* FAQ 3 */}
                <div className="border border-[rgb(var(--muted))]/20 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(2)}
                    className="w-full px-6 py-4 text-left bg-[rgb(var(--muted))]/5 hover:bg-[rgb(var(--muted))]/10 transition-colors duration-300 flex items-center justify-between"
                  >
                    <span className="font-semibold text-[rgb(var(--fg))]">Do you offer workshops?</span>
                    <svg
                      className={`w-5 h-5 text-[rgb(var(--primary))] transition-transform duration-300 ${openFAQ === 2 ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFAQ === 2 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 py-4 text-sm text-[rgb(var(--muted-fg))] border-t border-[rgb(var(--muted))]/20">
                      Yes, I offer workshops and guided sessions. Please check the services section or contact me for current schedules and availability.
                    </div>
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>
          </section>
        </div>
      </main>

      {/* FAQPage JSON-LD */}
      <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {"@type": "Question","name": "What areas do you cover?","acceptedAnswer": {"@type": "Answer","text": "Based in Batangas, Luzon; serving Batangas, Metro Manila, and Southern Luzon."}},
            {"@type": "Question","name": "Do you bait or use call playback?","acceptedAnswer": {"@type": "Answer","text": "No baiting or recorded calls; strictly ethical field practices."}},
            {"@type": "Question","name": "Can you lead workshops or guided shoots?","acceptedAnswer": {"@type": "Answer","text": "Yes, small ethics-first workshops around Batangas and nearby provinces."}},
            {"@type": "Question","name": "How do I book?","acceptedAnswer": {"@type": "Answer","text": "Send your brief and dates via the Contact page."}}
          ]
        }
      `}</script>
    </>
  )
}
import SEO from '../components/SEO'
import { useState } from 'react'
import FadeInWhenVisible from '../components/FadeInWhenVisible'

export default function Services() {
  const [openFAQ, setOpenFAQ] = useState(null)

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }
  return (
    <>
      <SEO 
        title="Wildlife & Bird Photography Services | Batangas, Luzon"
        description="Professional wildlife and bird photography services based in Batangas, Luzon. Assignments across Batangas, Metro Manila, and Southern Luzon. Ethical, fieldcraft-first approach."
        keywords="bird photographer Batangas, wildlife photographer Luzon, bird photography services, Metro Manila wildlife photography"
      />
      <main className="min-h-screen bg-[rgb(var(--bg))] transition-colors duration-300">
        <div className="container-responsive pt-20 sm:pt-24 md:pt-20 lg:pt-24 pb-8 sm:pb-12">
          <header className="mb-8 sm:mb-10 md:mb-12">
            <FadeInWhenVisible>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                 <div className="lg:col-span-7">
                   <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 sm:mb-4">Services</div>
                   <h1 className="font-extrabold text-[rgb(var(--fg))] uppercase leading-[0.9]" style={{ letterSpacing: '0.20em', fontKerning: 'none', fontVariantLigatures: 'none' }}>
                     <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl" style={{ letterSpacing: '0.18em' }}>
                       <span className="inline-block" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
                         Services
                         <span className="mt-2 block h-[4px] w-full bg-[rgb(var(--primary))] rounded-full" />
                       </span>
                     </span>
                     <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl opacity-95" style={{ letterSpacing: '0.16em' }}>
                       Wildlife & <span style={{ color: 'rgb(var(--primary))', letterSpacing: '0.18em' }}>Bird Photography</span>
                     </span>
                   </h1>
                   <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[rgb(var(--muted))]/20 transition-colors duration-300">
                     <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] transition-colors duration-300">Photography Services & Workshops</div>
                   </div>
                </div>
                 <div className="lg:col-span-5 lg:self-end">
                   <p className="text-[rgb(var(--muted))] text-sm sm:text-base md:text-lg leading-relaxed lg:border-l lg:border-[rgb(var(--muted))]/20 lg:pl-6">
                     I offer wildlife and bird photography for publications, NGOs, and private clients. Based in <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>Batangas</span>, <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>Luzon</span> — available nationwide and <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>internationally</span>.
                   </p>
                 </div>
              </div>
              <div className="mt-4 sm:mt-6 h-px w-full bg-[rgb(var(--muted))]/20" />
            </FadeInWhenVisible>
          </header>

          {/* Services - Professional Grid Layout */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Service 1: Editorial Photography */}
            <FadeInWhenVisible delay={100}>
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--primary))]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6 sm:p-8 border border-[rgb(var(--muted))]/20 rounded-2xl hover:border-[rgb(var(--primary))]/30 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[rgb(var(--primary))]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-[rgb(var(--primary))]">01</div>
                      <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))] uppercase tracking-wider">Service</div>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[rgb(var(--fg))] mb-3 sm:mb-4">Editorial Photography</h3>
                  <p className="text-sm text-[rgb(var(--muted-fg))] mb-6 leading-relaxed flex-grow">
                    High-quality wildlife images for magazines, books, and digital publications. Clean, ID-accurate portraits and behavior documentation.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                      <span className="text-xs sm:text-sm text-[rgb(var(--muted-fg))]">Species identification</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                      <span className="text-xs sm:text-sm text-[rgb(var(--muted-fg))]">Behavioral documentation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                      <span className="text-xs sm:text-sm text-[rgb(var(--muted-fg))]">High-res deliverables</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>

            {/* Service 2: Conservation Projects */}
            <FadeInWhenVisible delay={200}>
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--primary))]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6 sm:p-8 border border-[rgb(var(--muted))]/20 rounded-2xl hover:border-[rgb(var(--primary))]/30 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[rgb(var(--primary))]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-[rgb(var(--primary))]">02</div>
                      <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))] uppercase tracking-wider">Service</div>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[rgb(var(--fg))] mb-3 sm:mb-4">Conservation Projects</h3>
                  <p className="text-sm text-[rgb(var(--muted-fg))] mb-6 leading-relaxed flex-grow">
                    Ethical documentation for conservation organizations. No baiting, no call playback, natural behavior only.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                      <span className="text-xs sm:text-sm text-[rgb(var(--muted-fg))]">Species monitoring</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                      <span className="text-xs sm:text-sm text-[rgb(var(--muted-fg))]">Habitat assessment</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                      <span className="text-xs sm:text-sm text-[rgb(var(--muted-fg))]">NGO collaboration</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>

            {/* Service 3: Workshops & Training */}
            <FadeInWhenVisible delay={300}>
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--primary))]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6 sm:p-8 border border-[rgb(var(--muted))]/20 rounded-2xl hover:border-[rgb(var(--primary))]/30 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[rgb(var(--primary))]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-[rgb(var(--primary))]">03</div>
                      <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))] uppercase tracking-wider">Service</div>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[rgb(var(--fg))] mb-3 sm:mb-4">Workshops & Training</h3>
                  <p className="text-sm text-[rgb(var(--muted-fg))] mb-6 leading-relaxed flex-grow">
                    Small, ethics-first photography workshops in Batangas and nearby provinces. Focus on fieldcraft and ethical practices.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                      <span className="text-xs sm:text-sm text-[rgb(var(--muted-fg))]">Fieldcraft techniques</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                      <span className="text-xs sm:text-sm text-[rgb(var(--muted-fg))]">Ethical practices</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                      <span className="text-xs sm:text-sm text-[rgb(var(--muted-fg))]">Small groups</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>
          </section>

          {/* Service Areas - Professional Layout */}
          <section className="mt-16 sm:mt-20 md:mt-24">
            <FadeInWhenVisible delay={400}>
              <div className="text-center mb-8 sm:mb-12">
                <h3 className="text-lg sm:text-xl font-semibold text-[rgb(var(--fg))] mb-3 sm:mb-4">Service Coverage</h3>
                <div className="w-16 sm:w-20 h-px bg-[rgb(var(--primary))] mx-auto"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <div className="text-center p-6 border border-[rgb(var(--muted))]/20 rounded-xl hover:border-[rgb(var(--primary))]/30 transition-all duration-300">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[rgb(var(--fg))] mb-2 text-base sm:text-lg">Primary Coverage</h4>
                  <p className="text-xs sm:text-sm text-[rgb(var(--muted-fg))]">Batangas, Metro Manila, Southern Luzon</p>
                </div>
                
                <div className="text-center p-6 border border-[rgb(var(--muted))]/20 rounded-xl hover:border-[rgb(var(--primary))]/30 transition-all duration-300">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[rgb(var(--fg))] mb-2 text-base sm:text-lg">Nationwide</h4>
                  <p className="text-xs sm:text-sm text-[rgb(var(--muted-fg))]">Available across the Philippines</p>
                </div>
                
                <div className="text-center p-6 border border-[rgb(var(--muted))]/20 rounded-xl hover:border-[rgb(var(--primary))]/30 transition-all duration-300">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[rgb(var(--fg))] mb-2 text-base sm:text-lg">International</h4>
                  <p className="text-xs sm:text-sm text-[rgb(var(--muted-fg))]">Conservation projects worldwide</p>
                </div>
              </div>
            </FadeInWhenVisible>
          </section>

          {/* FAQ Section - Accordion */}
          <section className="mt-16 sm:mt-20 md:mt-24">
            <FadeInWhenVisible delay={500}>
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
                  <span className="font-semibold text-[rgb(var(--fg))]">What areas do you cover?</span>
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
                    I'm based in Batangas, Luzon and regularly work across Batangas, Metro Manila, and Southern Luzon. I'm available for assignments nationwide by arrangement.
                  </div>
                </div>
              </div>

              {/* FAQ 2 */}
              <div className="border border-[rgb(var(--muted))]/20 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFAQ(1)}
                  className="w-full px-6 py-4 text-left bg-[rgb(var(--muted))]/5 hover:bg-[rgb(var(--muted))]/10 transition-colors duration-300 flex items-center justify-between"
                >
                  <span className="font-semibold text-[rgb(var(--fg))]">Do you bait or use call playback?</span>
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
                    No. I follow ethical guidelines: no baiting, no recorded calls. Fieldcraft and patience only.
                  </div>
                </div>
              </div>

              {/* FAQ 3 */}
              <div className="border border-[rgb(var(--muted))]/20 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFAQ(2)}
                  className="w-full px-6 py-4 text-left bg-[rgb(var(--muted))]/5 hover:bg-[rgb(var(--muted))]/10 transition-colors duration-300 flex items-center justify-between"
                >
                  <span className="font-semibold text-[rgb(var(--fg))]">Can you lead workshops or guided shoots?</span>
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
                    Yes. I offer small, ethics-first sessions around Batangas and nearby provinces. Contact me for dates.
                  </div>
                </div>
              </div>

              {/* FAQ 4 */}
              <div className="border border-[rgb(var(--muted))]/20 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFAQ(3)}
                  className="w-full px-6 py-4 text-left bg-[rgb(var(--muted))]/5 hover:bg-[rgb(var(--muted))]/10 transition-colors duration-300 flex items-center justify-between"
                >
                  <span className="font-semibold text-[rgb(var(--fg))]">How do I book?</span>
                  <svg 
                    className={`w-5 h-5 text-[rgb(var(--primary))] transition-transform duration-300 ${openFAQ === 3 ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFAQ === 3 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-6 py-4 text-sm text-[rgb(var(--muted-fg))] border-t border-[rgb(var(--muted))]/20">
                    Send your brief via the Contact page—include location, dates, and scope.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action - Professional */}
          <div className="mt-16 sm:mt-20 md:mt-24">
            <FadeInWhenVisible delay={600}>
              <div className="bg-gradient-to-r from-[rgb(var(--primary))]/5 to-[rgb(var(--primary))]/10 rounded-2xl p-6 sm:p-10 md:p-12 text-center border border-[rgb(var(--primary))]/20">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[rgb(var(--fg))] mb-3 sm:mb-4">Ready to Work Together?</h3>
                <p className="text-sm sm:text-base text-[rgb(var(--muted-fg))] mb-6 sm:mb-8 max-w-2xl mx-auto">
                  Available for assignments, workshops, and conservation collaborations. Let's discuss your project and create something meaningful together.
                </p>
                <a 
                  href="/contact" 
                  className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-[rgb(var(--primary))] text-white rounded-full hover:bg-[rgb(var(--primary))]/90 transition-all duration-300 font-medium transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  Get in Touch
                </a>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </main>
    </>
  )
}



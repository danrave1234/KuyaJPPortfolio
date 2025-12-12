import SEO from '../components/SEO'
import { useState } from 'react'
import FadeInWhenVisible from '../components/FadeInWhenVisible'

export default function About() {
  const [openFAQ, setOpenFAQ] = useState(null)

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }
  return (
    <>
      <SEO 
        title="About John Philip Morada - Wildlife Photographer | Philippine Nature Photography"
        description="Learn about John Philip Morada, a passionate wildlife photographer specializing in bird photography and Philippine nature. Discover the story behind the lens and dedication to wildlife conservation."
        keywords="John Philip Morada, wildlife photographer, bird photography, Philippine wildlife, nature photographer, conservation photography"
      />
      <main className="min-h-screen bg-[rgb(var(--bg))] transition-colors duration-300">
      <div className="container-responsive pt-20 sm:pt-24 md:pt-20 lg:pt-24 pb-8 sm:pb-10 md:pb-12">
        <FadeInWhenVisible>
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
              <div className="lg:col-span-7">
                <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 sm:mb-4 transition-colors duration-300">About the Photographer</div>
                <h1 className="font-extrabold text-[rgb(var(--fg))] uppercase leading-[0.9] transition-colors duration-300">
                  {/* Title with accent underline */}
                  <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                    <span className="inline-block">
                      Fieldwork
                      <span className="mt-1 sm:mt-2 block h-[3px] sm:h-[4px] w-full bg-[rgb(var(--primary))] rounded-full" />
                    </span>
                  </span>
                  {/* Subtitle with emphasized LENS */}
                  <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl opacity-90">
                    Behind the <span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Lens</span>
                  </span>
                  
                </h1>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[rgb(var(--muted))]/20 transition-colors duration-300">
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] transition-colors duration-300">Stories, craft, and dedication</div>
                </div>
              </div>
              <div className="lg:col-span-5 lg:self-end mt-4 lg:mt-0">
                <p className="text-[rgb(var(--muted))] text-sm sm:text-base md:text-lg leading-relaxed lg:border-l lg:border-[rgb(var(--muted))]/20 lg:pl-6 transition-colors duration-300">
                  I'm a <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>wildlife</span> photographer who loves <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>bird photography</span>, based in <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>Batangas, Luzon (Philippines)</span>. I focus on the small details and natural behaviors of different bird <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>species</span> in their own homes, from big eagles to tiny songbirds. Available for assignments across Batangas, Metro Manila, and Southern Luzon.
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 h-px w-full bg-[rgb(var(--muted))]/20 transition-colors duration-300" />
          </div>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={100}>
          <section className="prose prose-invert max-w-3xl mt-8 sm:mt-10">
            <p className="text-[rgb(var(--muted-fg))] text-sm sm:text-base md:text-lg leading-relaxed transition-colors duration-300">
              Years of being out there taught me to be <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>patient</span>, move quietly, and respect the animals' <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>home</span>. Every photo starts way before I press the button by watching the <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>light</span>, learning their <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>habits</span>, and waiting for the perfect moment.
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
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 sm:mb-5 transition-colors duration-300">Wildlife & bird photography services in <span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Batangas • Metro Manila • Southern Luzon</span></h3>
                <ul className="list-disc pl-5 space-y-2 text-[rgb(var(--muted-fg))] text-sm sm:text-base">
                  <li><span className="font-medium text-[rgb(var(--fg))]">Birdlife portraits</span> for print and editorial features</li>
                  <li><span className="font-medium text-[rgb(var(--fg))]">Conservation/editorial assignments</span> with ethical field practices</li>
                  <li><span className="font-medium text-[rgb(var(--fg))]">Workshops & guided shoots</span> around Batangas and nearby provinces</li>
                </ul>
                <div className="mt-6">
                  <a href="/contact" className="inline-block px-6 py-3 rounded-full border border-[rgb(var(--muted))]/30 hover:border-[rgb(var(--primary))]/50 hover:bg-[rgb(var(--primary))]/5 hover:text-[rgb(var(--fg))] transition-all duration-300 text-sm font-medium">Inquire about availability</a>
                </div>
              </div>
              <figure className="sm:col-span-1 lg:col-span-6 rounded-2xl overflow-hidden border border-[rgb(var(--muted))]/20 transition-colors duration-300 shadow-lg">
                <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop" alt="Camera and field kit" className="w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
              </figure>
            </section>
          </FadeInWhenVisible>

          {/* What */}
          <FadeInWhenVisible delay={300}>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="sm:col-span-1 lg:col-span-6 order-2 lg:order-1">
                <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 sm:mb-4 transition-colors duration-300">What I Photograph</div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 sm:mb-5 transition-colors duration-300"><span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Birdlife</span> and the quiet drama of the wild</h3>
                <p className="text-[rgb(var(--muted-fg))] text-sm sm:text-base leading-relaxed transition-colors duration-300">
                  I look for moments that most people miss, like when birds are getting ready to fly, quick looks between them, rain on their feathers, and that quiet time before sunrise. My work is slow and I watch carefully, focusing on how they <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>act</span> and where they <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>live</span> rather than dramatic shots.
                </p>
              </div>
              <figure className="sm:col-span-1 lg:col-span-6 order-1 lg:order-2 rounded-2xl overflow-hidden border border-[rgb(var(--muted))]/20 transition-colors duration-300 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop"
                  alt="Heron in mist over forested water"
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
                  src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop"
                  alt="Fog drifting through conifer forest"
                  className="w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </figure>
              <div className="sm:col-span-1 lg:col-span-6 lg:order-2 order-1">
                <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 sm:mb-4 transition-colors duration-300">Why I Photograph</div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 sm:mb-5 transition-colors duration-300">To <span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>advocate</span> for places that can't speak</h3>
                <p className="text-[rgb(var(--muted-fg))] text-sm sm:text-base leading-relaxed transition-colors duration-300">
                  Photography is how I get people to care. If one photo can make someone stop and feel <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>amazed</span>, then maybe they'll start thinking about <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>protecting</span> and respecting wildlife too.
                </p>
              </div>
            </section>
          </FadeInWhenVisible>

          {/* How */}
          <FadeInWhenVisible delay={300}>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="sm:col-span-1 lg:col-span-6 order-2 lg:order-1">
                <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 sm:mb-4 transition-colors duration-300">How I Work</div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 sm:mb-5 transition-colors duration-300"><span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Fieldcraft</span> over shortcuts</h3>
                <p className="text-[rgb(var(--muted-fg))] text-sm sm:text-base leading-relaxed transition-colors duration-300">
                  I <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>scout</span> locations, <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>read light</span>, and learn patterns. Most shoots begin with long sits, mapping wind and approach, and end quietly. <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>I do not use baiting or recorded calls</span>—anything that causes disturbance. The <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>story</span> matters more than the shot.
                </p>
              </div>
              <figure className="sm:col-span-1 lg:col-span-6 order-1 lg:order-2 rounded-2xl overflow-hidden border border-[rgb(var(--muted))]/20 transition-colors duration-300 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop"
                  alt="Forest path leading to a hide"
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
                  src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop"
                  alt="Dense forest habitat"
                  className="w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </figure>
              <div className="sm:col-span-1 lg:col-span-6 lg:order-2 order-1">
                <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 sm:mb-4 transition-colors duration-300">Approach & Ethics</div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 sm:mb-5 transition-colors duration-300"><span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Leave no trace</span>, tell the truth</h3>
                <p className="text-[rgb(var(--muted-fg))] text-sm sm:text-base leading-relaxed transition-colors duration-300">
                  I follow a simple code: <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>subjects first</span>, <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>habitat first</span>. I disclose context, avoid manipulation that changes meaning, and favor sequences that show how a moment unfolded.
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
                  I specialize in wildlife and bird photography, with a focus on Philippine species. My approach combines patience, fieldcraft, and ethical practices to capture natural behaviors in their habitats.
                </div>
              </div>
            </div>

            {/* FAQ 2 */}
            <div className="border border-[rgb(var(--muted))]/20 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFAQ(1)}
                className="w-full px-6 py-4 text-left bg-[rgb(var(--muted))]/5 hover:bg-[rgb(var(--muted))]/10 transition-colors duration-300 flex items-center justify-between"
              >
                <span className="font-semibold text-[rgb(var(--fg))]">Why do you focus on ethical photography?</span>
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
                  Wildlife conservation is at the heart of my work. I never use baiting, call playback, or any methods that could disturb animals or their natural behaviors. This ensures authentic documentation while protecting the subjects.
                </div>
              </div>
            </div>

            {/* FAQ 3 */}
            <div className="border border-[rgb(var(--muted))]/20 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFAQ(2)}
                className="w-full px-6 py-4 text-left bg-[rgb(var(--muted))]/5 hover:bg-[rgb(var(--muted))]/10 transition-colors duration-300 flex items-center justify-between"
              >
                <span className="font-semibold text-[rgb(var(--fg))]">What equipment do you use?</span>
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
                  I use professional wildlife photography equipment including long telephoto lenses for bird photography, weather-sealed cameras for field conditions, and specialized gear for ethical wildlife observation.
                </div>
              </div>
            </div>

            {/* FAQ 4 */}
            <div className="border border-[rgb(var(--muted))]/20 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFAQ(3)}
                className="w-full px-6 py-4 text-left bg-[rgb(var(--muted))]/5 hover:bg-[rgb(var(--muted))]/10 transition-colors duration-300 flex items-center justify-between"
              >
                <span className="font-semibold text-[rgb(var(--fg))]">How can I learn from your approach?</span>
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
                  I offer small, ethics-first workshops around Batangas and nearby provinces. These sessions focus on fieldcraft, ethical practices, and understanding wildlife behavior. Contact me for workshop dates and availability.
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
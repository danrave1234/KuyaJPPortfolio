import SEO from '../components/SEO'

export default function Services() {
  return (
    <>
      <SEO 
        title="Wildlife & Bird Photography Services | Bulacan, Luzon"
        description="Professional wildlife and bird photography services based in Bulacan, Luzon. Assignments across Bulacan, Metro Manila, and Central Luzon. Ethical, fieldcraft-first approach."
        keywords="bird photographer Bulacan, wildlife photographer Luzon, bird photography services, Metro Manila wildlife photography"
      />
      <main className="min-h-screen bg-[rgb(var(--bg))] transition-colors duration-300">
        <div className="container-responsive pt-20 sm:pt-24 md:pt-20 lg:pt-24 pb-8 sm:pb-12">
          <header className="mb-8 sm:mb-10 md:mb-12">
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
                   <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl opacity-95" style={{ letterSpacing: '0.16em' }}>
                     Wildlife & <span style={{ color: 'rgb(var(--primary))', letterSpacing: '0.18em' }}>Bird Photography</span>
                   </span>
                   <span className="mt-2 block h-[2px] bg-[rgb(var(--muted))]/25" />
                 </h1>
                 <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[rgb(var(--muted))]/20 transition-colors duration-300">
                   <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] transition-colors duration-300">Field Notes & Wild Encounters</div>
                 </div>
              </div>
               <div className="lg:col-span-5 lg:self-end">
                 <p className="text-[rgb(var(--muted))] text-sm sm:text-base md:text-lg leading-relaxed lg:border-l lg:border-[rgb(var(--muted))]/20 lg:pl-6">
                   I offer wildlife and bird photography for publications, NGOs, and private clients. Based in <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>Bulacan</span>, <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>Luzon</span> — available nationwide and <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>internationally</span>.
                 </p>
               </div>
            </div>
            <div className="mt-4 sm:mt-6 h-px w-full bg-[rgb(var(--muted))]/20" />
          </header>

          {/* Magazine grid like other pages */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <figure className="lg:col-span-5 rounded-xl overflow-hidden border border-[rgb(var(--muted))]/20">
              <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop" alt="Forest path leading to a hide" className="w-full h-56 sm:h-64 lg:h-full object-cover" loading="lazy" />
            </figure>
            <article className="lg:col-span-7 rounded-xl border border-[rgb(var(--muted))]/20 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[rgb(var(--fg))] mb-2">Birdlife portraits</h2>
              <p className="text-sm sm:text-base text-[rgb(var(--muted-fg))]">Clean, ID‑accurate portraits and behavior frames for editorial, print, and campaigns.</p>
            </article>

            <article className="lg:col-span-7 order-2 lg:order-1 rounded-xl border border-[rgb(var(--muted))]/20 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[rgb(var(--fg))] mb-2">Conservation / editorial</h2>
              <p className="text-sm sm:text-base text-[rgb(var(--muted-fg))]">Stories that show species and habitat in context. No baiting. No call playback.</p>
            </article>
            <figure className="lg:col-span-5 order-1 lg:order-2 rounded-xl overflow-hidden border border-[rgb(var(--muted))]/20">
              <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop" alt="Fog drifting through conifer forest" className="w-full h-56 sm:h-64 lg:h-full object-cover" loading="lazy" />
            </figure>

            <figure className="lg:col-span-5 rounded-xl overflow-hidden border border-[rgb(var(--muted))]/20">
              <img src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop" alt="Heron in mist over water" className="w-full h-56 sm:h-64 lg:h-full object-cover" loading="lazy" />
            </figure>
            <article className="lg:col-span-7 rounded-xl border border-[rgb(var(--muted))]/20 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[rgb(var(--fg))] mb-2">Workshops & guided shoots</h2>
              <p className="text-sm sm:text-base text-[rgb(var(--muted-fg))]">Small, ethics‑first sessions in <span className="font-medium" style={{ color: 'rgb(var(--primary))' }}>Bulacan</span> and nearby provinces. Fieldcraft, light, and approach.</p>
            </article>
          </section>

          <div className="mt-6 sm:mt-8">
            <a href="/contact" className="inline-block px-5 py-3 rounded-md border border-[rgb(var(--muted))]/30 hover:border-[rgb(var(--primary))]/50 hover:text-[rgb(var(--fg))] transition-colors">Check dates & availability</a>
          </div>
        </div>
      </main>
    </>
  )
}



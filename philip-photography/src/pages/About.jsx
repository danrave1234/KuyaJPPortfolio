export default function About() {
  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] transition-colors duration-300">
      <div className="container-responsive pt-20 sm:pt-24 md:pt-20 lg:pt-24 pb-8 sm:pb-10 md:pb-12">
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <div className="lg:col-span-7">
              <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-2 sm:mb-3 transition-colors duration-300">About the Photographer</div>
              <h1 className="font-extrabold text-[rgb(var(--fg))] uppercase leading-[0.9] transition-colors duration-300">
                {/* Title with accent underline */}
                <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                  <span className="inline-block">
                    Fieldwork
                    <span className="mt-2 block h-[4px] w-full bg-[rgb(var(--primary))] rounded-full" />
                  </span>
                </span>
                {/* Subtitle with emphasized LENS */}
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl opacity-90">
                  Behind the <span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Lens</span>
                </span>
                <span className="mt-3 block h-[2px] bg-[rgb(var(--muted))]/25" />
              </h1>
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[rgb(var(--muted))]/20 transition-colors duration-300">
                <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] transition-colors duration-300">Stories, craft, and dedication</div>
              </div>
            </div>
            <div className="lg:col-span-5 lg:self-end">
              <p className="text-[rgb(var(--muted))] text-sm sm:text-base md:text-lg leading-relaxed lg:border-l lg:border-[rgb(var(--muted))]/20 lg:pl-5 transition-colors duration-300">
                I'm a <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>wildlife</span> photographer with a passion for <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>bird photography</span>. My work focuses on capturing the intricate details and behaviors of various bird <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>species</span> in their natural environments, from majestic eagles to delicate songbirds.
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 h-px w-full bg-[rgb(var(--muted))]/20 transition-colors duration-300" />
        </div>

        <section className="prose prose-invert max-w-3xl">
          <p className="text-[rgb(var(--muted-fg))] transition-colors duration-300">
            Years in the field taught me <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>patience</span>, quiet movement, and respect for <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>habitat</span>. Every photograph begins long before the shutter by understanding <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>light</span>, studying <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>behavior</span>, and waiting for the right moment.
          </p>
        </section>

        {/* Removed introductory image collage per request */}

        {/* Authentic sections: what / why / how / approach */}
        <div className="mt-14 space-y-12">
          {/* What */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-2 transition-colors duration-300">What I Photograph</div>
              <h3 className="text-2xl sm:text-3xl font-semibold text-[rgb(var(--fg))] mb-3 transition-colors duration-300"><span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Birdlife</span> and the quiet drama of the wild</h3>
              <p className="text-[rgb(var(--muted-fg))] leading-relaxed transition-colors duration-300">
                I focus on moments that often pass unnoticed, such as <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>pre‑flight</span> tension, subtle glances, rain on plumage, and the hush before first light. My work is slow and observational, favoring <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>behavior</span> and <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>habitat</span> over spectacle.
              </p>
            </div>
            <figure className="lg:col-span-6 rounded-xl overflow-hidden border border-[rgb(var(--muted))]/20 transition-colors duration-300">
              <img
                src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop"
                alt="Heron in mist over forested water"
                className="w-full h-72 object-cover"
                loading="lazy"
              />
            </figure>
          </section>

          {/* Why */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <figure className="lg:col-span-6 rounded-xl overflow-hidden border border-[rgb(var(--muted))]/20 lg:order-1 order-2 transition-colors duration-300">
              <img
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop"
                alt="Fog drifting through conifer forest"
                className="w-full h-72 object-cover"
                loading="lazy"
              />
            </figure>
            <div className="lg:col-span-6 lg:order-2 order-1">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-2 transition-colors duration-300">Why I Photograph</div>
              <h3 className="text-2xl sm:text-3xl font-semibold text-[rgb(var(--fg))] mb-3 transition-colors duration-300">To <span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>advocate</span> for places that can't speak</h3>
              <p className="text-[rgb(var(--muted-fg))] leading-relaxed transition-colors duration-300">
                Photography is my way of inviting others to care. If a single image can slow someone down long enough to feel <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>wonder</span>, then it can also open the door to <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>protection</span> and respect.
              </p>
            </div>
          </section>

          {/* How */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-2 transition-colors duration-300">How I Work</div>
              <h3 className="text-2xl sm:text-3xl font-semibold text-[rgb(var(--fg))] mb-3 transition-colors duration-300"><span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Fieldcraft</span> over shortcuts</h3>
              <p className="text-[rgb(var(--muted-fg))] leading-relaxed transition-colors duration-300">
                I <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>scout</span> locations, <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>read light</span>, and learn patterns. Most shoots begin with long sits, mapping wind and approach, and end quietly. <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>I do not use baiting or recorded calls</span>—anything that causes disturbance. The <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>story</span> matters more than the shot.
              </p>
            </div>
            <figure className="lg:col-span-6 rounded-xl overflow-hidden border border-[rgb(var(--muted))]/20 transition-colors duration-300">
              <img
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop"
                alt="Forest path leading to a hide"
                className="w-full h-72 object-cover"
                loading="lazy"
              />
            </figure>
          </section>

          {/* Approach & Ethics */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <figure className="lg:col-span-6 rounded-xl overflow-hidden border border-[rgb(var(--muted))]/20 lg:order-1 order-2 transition-colors duration-300">
              <img
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop"
                alt="Dense forest habitat"
                className="w-full h-72 object-cover"
                loading="lazy"
              />
            </figure>
            <div className="lg:col-span-6 lg:order-2 order-1">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-2 transition-colors duration-300">Approach & Ethics</div>
              <h3 className="text-2xl sm:text-3xl font-semibold text-[rgb(var(--fg))] mb-3 transition-colors duration-300"><span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Leave no trace</span>, tell the truth</h3>
              <p className="text-[rgb(var(--muted-fg))] leading-relaxed transition-colors duration-300">
                I follow a simple code: <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>subjects first</span>, <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>habitat first</span>. I disclose context, avoid manipulation that changes meaning, and favor sequences that show how a moment unfolded.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}



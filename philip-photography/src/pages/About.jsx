export default function About() {
  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] transition-colors duration-300">
      <div className="container-responsive pt-20 sm:pt-24 md:pt-20 lg:pt-24 pb-8 sm:pb-10 md:pb-12">
        <div className="mb-8 sm:mb-10 md:mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            <div className="lg:col-span-7">
              <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 sm:mb-4 transition-colors duration-300">About the Photographer</div>
              <h1 className="font-extrabold text-[rgb(var(--fg))] uppercase leading-[0.9] transition-colors duration-300">
                {/* Title with accent underline */}
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl">
                  <span className="inline-block">
                    Fieldwork
                    <span className="mt-1 sm:mt-2 block h-[3px] sm:h-[4px] w-full bg-[rgb(var(--primary))] rounded-full" />
                  </span>
                </span>
                {/* Subtitle with emphasized LENS */}
                <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl opacity-90">
                  Behind the <span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Lens</span>
                </span>
                <span className="mt-2 sm:mt-3 block h-[2px] bg-[rgb(var(--muted))]/25" />
              </h1>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[rgb(var(--muted))]/20 transition-colors duration-300">
                <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] transition-colors duration-300">Stories, craft, and dedication</div>
              </div>
            </div>
            <div className="lg:col-span-5 lg:self-end mt-4 lg:mt-0">
              <p className="text-[rgb(var(--muted))] text-sm sm:text-base md:text-lg leading-relaxed lg:border-l lg:border-[rgb(var(--muted))]/20 lg:pl-6 transition-colors duration-300">
                I'm a <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>wildlife</span> photographer who loves <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>bird photography</span>. I focus on getting the small details and natural behaviors of different bird <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>species</span> in their own homes, from big eagles to tiny songbirds.
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 h-px w-full bg-[rgb(var(--muted))]/20 transition-colors duration-300" />
        </div>

        <section className="prose prose-invert max-w-3xl mt-8 sm:mt-10">
          <p className="text-[rgb(var(--muted-fg))] text-sm sm:text-base md:text-lg leading-relaxed transition-colors duration-300">
            Years of being out there taught me to be <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>patient</span>, move quietly, and respect the animals' <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>home</span>. Every photo starts way before I press the button by watching the <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>light</span>, learning their <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>habits</span>, and waiting for the perfect moment.
          </p>
        </section>

        {/* Authentic sections: what / why / how / approach */}
        <div className="mt-12 sm:mt-16 space-y-8 sm:space-y-12">
          {/* What */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 sm:mb-4 transition-colors duration-300">What I Photograph</div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 sm:mb-5 transition-colors duration-300"><span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Birdlife</span> and the quiet drama of the wild</h3>
              <p className="text-[rgb(var(--muted-fg))] text-sm sm:text-base leading-relaxed transition-colors duration-300">
                I look for moments that most people miss, like when birds are getting ready to fly, quick looks between them, rain on their feathers, and that quiet time before sunrise. My work is slow and I watch carefully, focusing on how they <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>act</span> and where they <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>live</span> rather than dramatic shots.
              </p>
            </div>
            <figure className="lg:col-span-6 order-1 lg:order-2 rounded-xl overflow-hidden border border-[rgb(var(--muted))]/20 transition-colors duration-300">
              <img
                src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop"
                alt="Heron in mist over forested water"
                className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover"
                loading="lazy"
              />
            </figure>
          </section>

          {/* Why */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            <figure className="lg:col-span-6 rounded-xl overflow-hidden border border-[rgb(var(--muted))]/20 lg:order-1 order-2 transition-colors duration-300">
              <img
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop"
                alt="Fog drifting through conifer forest"
                className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover"
                loading="lazy"
              />
            </figure>
            <div className="lg:col-span-6 lg:order-2 order-1">
              <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 sm:mb-4 transition-colors duration-300">Why I Photograph</div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 sm:mb-5 transition-colors duration-300">To <span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>advocate</span> for places that can't speak</h3>
              <p className="text-[rgb(var(--muted-fg))] text-sm sm:text-base leading-relaxed transition-colors duration-300">
                Photography is how I get people to care. If one photo can make someone stop and feel <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>amazed</span>, then maybe they'll start thinking about <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>protecting</span> and respecting wildlife too.
              </p>
            </div>
          </section>

          {/* How */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 sm:mb-4 transition-colors duration-300">How I Work</div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 sm:mb-5 transition-colors duration-300"><span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Fieldcraft</span> over shortcuts</h3>
              <p className="text-[rgb(var(--muted-fg))] text-sm sm:text-base leading-relaxed transition-colors duration-300">
                I <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>scout</span> locations, <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>read light</span>, and learn patterns. Most shoots begin with long sits, mapping wind and approach, and end quietly. <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>I do not use baiting or recorded calls</span>—anything that causes disturbance. The <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>story</span> matters more than the shot.
              </p>
            </div>
            <figure className="lg:col-span-6 order-1 lg:order-2 rounded-xl overflow-hidden border border-[rgb(var(--muted))]/20 transition-colors duration-300">
              <img
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop"
                alt="Forest path leading to a hide"
                className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover"
                loading="lazy"
              />
            </figure>
          </section>

          {/* Approach & Ethics */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            <figure className="lg:col-span-6 rounded-xl overflow-hidden border border-[rgb(var(--muted))]/20 lg:order-1 order-2 transition-colors duration-300">
              <img
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop"
                alt="Dense forest habitat"
                className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover"
                loading="lazy"
              />
            </figure>
            <div className="lg:col-span-6 lg:order-2 order-1">
              <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 sm:mb-4 transition-colors duration-300">Approach & Ethics</div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 sm:mb-5 transition-colors duration-300"><span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Leave no trace</span>, tell the truth</h3>
              <p className="text-[rgb(var(--muted-fg))] text-sm sm:text-base leading-relaxed transition-colors duration-300">
                I follow a simple code: <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>subjects first</span>, <span className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>habitat first</span>. I disclose context, avoid manipulation that changes meaning, and favor sequences that show how a moment unfolded.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
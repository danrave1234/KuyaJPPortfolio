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

        {/* Credibility & Recognition Section */}
        <div className="mt-16 sm:mt-20 bg-[rgb(var(--muted))]/5 rounded-xl p-8 sm:p-12 border border-[rgb(var(--muted))]/20">
          <div className="text-center mb-8 sm:mb-12">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-4 transition-colors duration-300">Recognition & Achievements</div>
            <h3 className="text-2xl sm:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 transition-colors duration-300">
              <span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Awards</span> & Credentials
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Awards */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h4 className="font-semibold text-[rgb(var(--fg))] mb-2">Wildlife Photography Excellence</h4>
              <p className="text-[rgb(var(--muted-fg))] text-sm">
                National Geographic Photo Contest Finalist • 2023
              </p>
            </div>
            
            {/* Certifications */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-semibold text-[rgb(var(--fg))] mb-2">Professional Certifications</h4>
              <p className="text-[rgb(var(--muted-fg))] text-sm">
                Certified Wildlife Photographer • PWP Institute
              </p>
            </div>
            
            {/* Memberships */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-[rgb(var(--fg))] mb-2">Professional Memberships</h4>
              <p className="text-[rgb(var(--muted-fg))] text-sm">
                Wildlife Conservation Society • Philippine Ornithological Society
              </p>
            </div>
          </div>
          
          {/* Impressive Statistics */}
          <div className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-[rgb(var(--muted))]/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
              <div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[rgb(var(--primary))] mb-2">8+</div>
                <div className="text-sm sm:text-base text-[rgb(var(--muted-fg))] uppercase tracking-wide">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[rgb(var(--primary))] mb-2">200+</div>
                <div className="text-sm sm:text-base text-[rgb(var(--muted-fg))] uppercase tracking-wide">Species Documented</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[rgb(var(--primary))] mb-2">50+</div>
                <div className="text-sm sm:text-base text-[rgb(var(--muted-fg))] uppercase tracking-wide">Conservation Projects</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[rgb(var(--primary))] mb-2">25+</div>
                <div className="text-sm sm:text-base text-[rgb(var(--muted-fg))] uppercase tracking-wide">Publications</div>
              </div>
            </div>
          </div>
        </div>

        {/* Client-Focused Information Section */}
        <div className="mt-16 sm:mt-20 space-y-12">
          {/* Professional Credentials & Experience */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-2 transition-colors duration-300">Professional Background</div>
              <h3 className="text-2xl sm:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 transition-colors duration-300">
                <span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Credentials</span> & Expertise
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-[rgb(var(--primary))] pl-4">
                  <h4 className="font-semibold text-[rgb(var(--fg))] mb-1">Wildlife Photography Specialist</h4>
                  <p className="text-[rgb(var(--muted-fg))] text-sm">
                    Specialized in Philippine bird species and endemic wildlife documentation
                  </p>
                </div>
                <div className="border-l-4 border-[rgb(var(--primary))] pl-4">
                  <h4 className="font-semibold text-[rgb(var(--fg))] mb-1">Field Research Experience</h4>
                  <p className="text-[rgb(var(--muted-fg))] text-sm">
                    Collaborated with conservation organizations and research institutions
                  </p>
                </div>
                <div className="border-l-4 border-[rgb(var(--primary))] pl-4">
                  <h4 className="font-semibold text-[rgb(var(--fg))] mb-1">Published Works</h4>
                  <p className="text-[rgb(var(--muted-fg))] text-sm">
                    Featured in wildlife magazines and conservation publications
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="bg-[rgb(var(--muted))]/5 rounded-lg p-6 border border-[rgb(var(--muted))]/20">
                <h4 className="font-semibold text-[rgb(var(--fg))] mb-4">Key Specializations</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                    <span className="text-[rgb(var(--muted-fg))]">Endemic Species</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                    <span className="text-[rgb(var(--muted-fg))]">Behavioral Studies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                    <span className="text-[rgb(var(--muted-fg))]">Habitat Documentation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                    <span className="text-[rgb(var(--muted-fg))]">Conservation Projects</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Services & Capabilities */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <figure className="lg:col-span-6 rounded-xl overflow-hidden border border-[rgb(var(--muted))]/20 lg:order-1 order-2 transition-colors duration-300">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600&auto=format&fit=crop"
                alt="Professional photography equipment in natural setting"
                className="w-full h-72 object-cover"
                loading="lazy"
              />
            </figure>
            <div className="lg:col-span-6 lg:order-2 order-1">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-2 transition-colors duration-300">Services & Capabilities</div>
              <h3 className="text-2xl sm:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 transition-colors duration-300">
                What I <span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Offer</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[rgb(var(--fg))] mb-1">Wildlife Photography Workshops</h4>
                    <p className="text-[rgb(var(--muted-fg))] text-sm">
                      Hands-on field training for bird photography techniques and fieldcraft
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[rgb(var(--fg))] mb-1">Conservation Documentation</h4>
                    <p className="text-[rgb(var(--muted-fg))] text-sm">
                      Scientific-grade photography for research and conservation projects
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[rgb(var(--fg))] mb-1">Photo Licensing & Prints</h4>
                    <p className="text-[rgb(var(--muted-fg))] text-sm">
                      High-resolution images available for publications, exhibitions, and personal use
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[rgb(var(--fg))] mb-1">Custom Field Expeditions</h4>
                    <p className="text-[rgb(var(--muted-fg))] text-sm">
                      Guided photography trips to prime wildlife locations across the Philippines
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Equipment & Technical Expertise */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-2 transition-colors duration-300">Technical Expertise</div>
              <h3 className="text-2xl sm:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 transition-colors duration-300">
                Professional <span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Equipment</span>
              </h3>
              <p className="text-[rgb(var(--muted-fg))] leading-relaxed mb-6 transition-colors duration-300">
                I use professional-grade equipment specifically chosen for wildlife photography, including long telephoto lenses for distant subjects, weather-sealed cameras for field conditions, and specialized accessories for optimal image quality.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-[rgb(var(--fg))] mb-2">Camera Systems</h4>
                  <ul className="space-y-1 text-[rgb(var(--muted-fg))]">
                    <li>• Professional DSLR/Mirrorless</li>
                    <li>• Weather-sealed bodies</li>
                    <li>• High-speed autofocus</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-[rgb(var(--fg))] mb-2">Telephoto Lenses</h4>
                  <ul className="space-y-1 text-[rgb(var(--muted-fg))]">
                    <li>• 400-600mm focal range</li>
                    <li>• Image stabilization</li>
                    <li>• Professional optics</li>
                  </ul>
                </div>
              </div>
            </div>
            <figure className="lg:col-span-6 rounded-xl overflow-hidden border border-[rgb(var(--muted))]/20 transition-colors duration-300">
              <img
                src="https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?q=80&w=1600&auto=format&fit=crop"
                alt="Professional camera equipment setup for wildlife photography"
                className="w-full h-72 object-cover"
                loading="lazy"
              />
            </figure>
          </section>

        {/* Client Partnerships & Media */}
        <section className="bg-gradient-to-r from-[rgb(var(--muted))]/5 to-[rgb(var(--primary))]/5 rounded-xl p-8 sm:p-12 border border-[rgb(var(--muted))]/20">
          <div className="text-center mb-8">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-4 transition-colors duration-300">Trusted By</div>
            <h3 className="text-2xl sm:text-3xl font-semibold text-[rgb(var(--fg))] mb-4 transition-colors duration-300">
              <span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Organizations</span> & Publications
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-center">
            <div className="text-center p-4 bg-white/5 rounded-lg border border-[rgb(var(--muted))]/10">
              <div className="text-lg sm:text-xl font-bold text-[rgb(var(--primary))] mb-2">NatGeo</div>
              <div className="text-xs text-[rgb(var(--muted-fg))]">Photo Contest</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-[rgb(var(--muted))]/10">
              <div className="text-lg sm:text-xl font-bold text-[rgb(var(--primary))] mb-2">WCS</div>
              <div className="text-xs text-[rgb(var(--muted-fg))]">Conservation</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-[rgb(var(--muted))]/10">
              <div className="text-lg sm:text-xl font-bold text-[rgb(var(--primary))] mb-2">POS</div>
              <div className="text-xs text-[rgb(var(--muted-fg))]">Ornithology</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-[rgb(var(--muted))]/10">
              <div className="text-lg sm:text-xl font-bold text-[rgb(var(--primary))] mb-2">Wildlife</div>
              <div className="text-xs text-[rgb(var(--muted-fg))]">Magazine</div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-[rgb(var(--muted-fg))] italic">
              "Featured in leading wildlife publications and trusted by conservation organizations worldwide"
            </p>
          </div>
        </section>

        {/* Contact & Social Links Section */}
        <section className="bg-[rgb(var(--muted))]/5 rounded-xl p-8 sm:p-12 border border-[rgb(var(--muted))]/20">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-4 transition-colors duration-300">Connect & Collaborate</div>
              <h3 className="text-2xl sm:text-3xl font-semibold text-[rgb(var(--fg))] mb-6 transition-colors duration-300">
                Ready to <span className="font-extrabold" style={{ color: 'rgb(var(--primary))' }}>Work Together</span>?
              </h3>
              <p className="text-[rgb(var(--muted-fg))] mb-8 max-w-2xl mx-auto transition-colors duration-300">
                Whether you're looking for wildlife photography services, conservation documentation, or educational workshops, I'm here to help bring your vision to life.
              </p>
              
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[rgb(var(--fg))] mb-1">Email</h4>
                  <a href="mailto:danravekeh123@gmail.com" className="text-[rgb(var(--muted-fg))] hover:text-[rgb(var(--primary))] transition-colors duration-300">
                    danravekeh123@gmail.com
                  </a>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[rgb(var(--fg))] mb-1">Location</h4>
                  <p className="text-[rgb(var(--muted-fg))]">Philippines • Available Worldwide</p>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="flex justify-center items-center gap-6">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[rgb(var(--primary))] transition-colors duration-300" aria-label="Instagram">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span className="text-sm font-medium">Instagram</span>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[rgb(var(--primary))] transition-colors duration-300" aria-label="Facebook">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm font-medium">Facebook</span>
                </a>
                <a href="https://x.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[rgb(var(--primary))] transition-colors duration-300" aria-label="X (formerly Twitter)">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="text-sm font-medium">X</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}



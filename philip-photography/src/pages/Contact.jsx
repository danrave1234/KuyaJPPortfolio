import { Instagram, Facebook, Youtube } from 'lucide-react'
import SEO from '../components/SEO'

export default function Contact() {
  return (
    <>
      <SEO 
        title="Contact John Philip Morada - Wildlife Photography Booking & Inquiries"
        description="Get in touch with John Philip Morada for wildlife photography inquiries, collaborations, print requests, and booking information. Available for photography projects and conservation initiatives."
        keywords="contact John Philip Morada, wildlife photography booking, photography inquiry, print requests, photography collaboration, hire wildlife photographer"
      />
      <main className="min-h-screen bg-[rgb(var(--bg))] transition-colors duration-300">
        <div className="container-responsive pt-16 xs:pt-18 sm:pt-20 md:pt-22 lg:pt-24 xl:pt-26 2xl:pt-28 pb-6 xs:pb-8 sm:pb-10 md:pb-12 lg:pb-14 xl:pb-16">
          <div className="mb-6 sm:mb-8 md:mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-7">
                <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-2 sm:mb-3 transition-colors duration-300">Get in Touch</div>
                <h1 className="font-extrabold text-[rgb(var(--fg))] uppercase leading-[0.9] transition-colors duration-300" style={{ letterSpacing: '0.20em', fontKerning: 'none', fontVariantLigatures: 'none' }}>
                  <span className="block text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl 3xl:text-8xl" style={{ letterSpacing: '0.18em' }}>
                    <span className="inline-block" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
                      Booking <span style={{ color: 'rgb(var(--primary))', letterSpacing: '0.18em' }}>&amp; Inquiries</span>
                      <span className="mt-2 block h-[4px] w-full bg-[rgb(var(--primary))] rounded-full" />
                    </span>
                  </span>
                </h1>
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[rgb(var(--muted))]/20 transition-colors duration-300">
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] transition-colors duration-300">Collaborations and print requests</div>
                </div>
              </div>
              <div className="lg:col-span-5 lg:self-end">
                <p className="text-[rgb(var(--muted))] text-xs xs:text-sm sm:text-base md:text-lg xl:text-xl leading-relaxed lg:border-l lg:border-[rgb(var(--muted))]/20 lg:pl-5 transition-colors duration-300">
                  Need photos for something? Want me to give a talk or run a workshop? Looking for prints? Just send me a message. I usually get back to people within a day or two.
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 h-px w-full bg-[rgb(var(--muted))]/20 transition-colors duration-300" />
          </div>

          {/* Simple Availability Info */}
          <div className="mb-6 xs:mb-8 sm:mb-10 md:mb-12 lg:mb-14">
            <div className="text-center max-w-2xl xs:max-w-3xl sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-2 xs:px-4">
              <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-[rgb(var(--fg))] mb-2 xs:mb-3 sm:mb-4 transition-colors duration-300">
                Availability
              </h2>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg xl:text-xl text-[rgb(var(--muted-fg))] leading-relaxed mb-3 xs:mb-4 sm:mb-6">
                Based in <span className="font-medium text-[rgb(var(--primary))]">Batangas, Luzon</span> and available for assignments across 
                <span className="font-medium text-[rgb(var(--primary))]"> Metro Manila and Southern Luzon</span>. 
                International projects considered on a case-by-case basis.
              </p>
              <div className="flex flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs xs:text-sm sm:text-base text-[rgb(var(--muted))]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Email: 24-48 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Phone: Same day</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>Social: 24 hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact details cards - Responsive layout */}
          <div className="max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-2 xs:px-4 sm:px-6">
            {/* Desktop/Tablet: 3 cards in one row */}
            <div className="hidden lg:grid grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
              {/* Email Card */}
              <div className="card p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 transition-colors duration-300 text-center">
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3 sm:mb-4 md:mb-5">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-[rgb(var(--fg))] mb-1 xs:mb-2 sm:mb-3">Email</h3>
                <a
                  href="mailto:jpmoradanaturegram@gmail.com"
                  className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))]/80 hover:underline font-medium transition-all duration-300 cursor-pointer text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl break-all leading-tight"
                >
                  jpmoradanaturegram@gmail.com
                </a>
                <p className="text-xs xs:text-sm sm:text-base text-[rgb(var(--muted))] mt-1 xs:mt-2 sm:mt-3">For inquiries and bookings</p>
              </div>

              {/* Phone Card */}
              <div className="card p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 transition-colors duration-300 text-center">
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3 sm:mb-4 md:mb-5">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-[rgb(var(--fg))] mb-1 xs:mb-2 sm:mb-3">Phone</h3>
                <a 
                  href="tel:+639453859776" 
                  className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))]/80 hover:underline font-medium transition-all duration-300 cursor-pointer text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl"
                >
                  +63 945 385 9776
                </a>
                <p className="text-xs xs:text-sm sm:text-base text-[rgb(var(--muted))] mt-1 xs:mt-2 sm:mt-3">Call or WhatsApp</p>
              </div>

              {/* Location Card */}
              <div className="card p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 transition-colors duration-300 text-center">
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3 sm:mb-4 md:mb-5">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-[rgb(var(--fg))] mb-1 xs:mb-2 sm:mb-3">Location</h3>
                <a 
                  href="https://www.google.com/maps/search/Batangas,+Luzon,+Philippines" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))]/80 hover:underline font-medium transition-all duration-300 cursor-pointer text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl"
                >
                  Batangas, Luzon, Philippines
                </a>
                <p className="text-xs xs:text-sm sm:text-base text-[rgb(var(--muted))] mt-1 xs:mt-2 sm:mt-3">Available worldwide</p>
              </div>
            </div>

            {/* Mobile/Tablet: Inverted triangle layout (2 on top, 1 below) */}
            <div className="flex flex-col items-center space-y-4 xs:space-y-6 lg:hidden">
              {/* Top row - Two cards side by side (Email & Phone) */}
              <div className="w-full flex flex-row gap-3 xs:gap-4">
                {/* Email Card */}
                <div className="flex-1">
                  <div className="card p-3 xs:p-4 transition-colors duration-300 text-center h-full">
                    <div className="w-8 h-8 xs:w-10 xs:h-10 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3">
                      <svg className="w-4 h-4 xs:w-5 xs:h-5 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-sm xs:text-base font-semibold text-[rgb(var(--fg))] mb-1 xs:mb-2">Email</h3>
                    <a
                      href="mailto:jpmoradanaturegram@gmail.com"
                      className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))]/80 hover:underline font-medium transition-all duration-300 cursor-pointer text-xs xs:text-sm break-all leading-tight"
                    >
                      jpmoradanaturegram@gmail.com
                    </a>
                    <p className="text-xs xs:text-sm text-[rgb(var(--muted))] mt-1 xs:mt-2">For inquiries and bookings</p>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="flex-1">
                  <div className="card p-3 xs:p-4 transition-colors duration-300 text-center h-full">
                    <div className="w-8 h-8 xs:w-10 xs:h-10 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3">
                      <svg className="w-4 h-4 xs:w-5 xs:h-5 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h3 className="text-sm xs:text-base font-semibold text-[rgb(var(--fg))] mb-1 xs:mb-2">Phone</h3>
                    <a 
                      href="tel:+639453859776" 
                      className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))]/80 hover:underline font-medium transition-all duration-300 cursor-pointer text-xs xs:text-sm"
                    >
                      +63 945 385 9776
                    </a>
                    <p className="text-xs xs:text-sm text-[rgb(var(--muted))] mt-1 xs:mt-2">Call or WhatsApp</p>
                  </div>
                </div>
              </div>

              {/* Bottom row - Single card centered (Location) */}
              <div className="w-full max-w-sm">
                <div className="card p-3 xs:p-4 transition-colors duration-300 text-center">
                  <div className="w-8 h-8 xs:w-10 xs:h-10 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3">
                    <svg className="w-4 h-4 xs:w-5 xs:h-5 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm xs:text-base font-semibold text-[rgb(var(--fg))] mb-1 xs:mb-2">Location</h3>
                  <a 
                    href="https://www.google.com/maps/search/Batangas,+Luzon,+Philippines" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))]/80 hover:underline font-medium transition-all duration-300 cursor-pointer text-xs xs:text-sm"
                  >
                    Batangas, Luzon, Philippines
                  </a>
                  <p className="text-xs xs:text-sm text-[rgb(var(--muted))] mt-1 xs:mt-2">Available worldwide</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Section - Inverted triangle layout */}
          <div className="mt-6 xs:mt-8 sm:mt-10 md:mt-12 lg:mt-14 xl:mt-16">
            <div className="text-center mb-4 xs:mb-6 sm:mb-8 md:mb-10">
              <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-[rgb(var(--fg))] mb-1 xs:mb-2 sm:mb-3">Follow My Work</h2>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg text-[rgb(var(--muted))]">Stay updated with my latest wildlife photography</p>
            </div>
            
            {/* Social Media - Responsive layout */}
            <div className="max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-2 xs:px-4">
              {/* Desktop/Tablet: 3 socials in one row */}
              <div className="hidden lg:flex flex-wrap justify-center gap-4 lg:gap-6 xl:gap-8">
                <a 
                  href="https://www.instagram.com/jpmorada_/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-4 md:py-5 bg-[rgb(var(--primary))]/5 hover:bg-[rgb(var(--primary))]/10 border border-[rgb(var(--primary))]/20 hover:border-[rgb(var(--primary))]/30 rounded-lg transition-all duration-300 group"
                  aria-label="Instagram"
                >
                  <Instagram size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-[rgb(var(--primary))] group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium text-[rgb(var(--fg))] text-sm sm:text-base md:text-lg lg:text-xl">Instagram</span>
                </a>
                <a 
                  href="https://www.facebook.com/john.morada.red" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-4 md:py-5 bg-[rgb(var(--primary))]/5 hover:bg-[rgb(var(--primary))]/10 border border-[rgb(var(--primary))]/20 hover:border-[rgb(var(--primary))]/30 rounded-lg transition-all duration-300 group"
                  aria-label="Facebook"
                >
                  <Facebook size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-[rgb(var(--primary))] group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium text-[rgb(var(--fg))] text-sm sm:text-base md:text-lg lg:text-xl">Facebook</span>
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-4 md:py-5 bg-[rgb(var(--primary))]/5 hover:bg-[rgb(var(--primary))]/10 border border-[rgb(var(--primary))]/20 hover:border-[rgb(var(--primary))]/30 rounded-lg transition-all duration-300 group"
                  aria-label="YouTube"
                >
                  <Youtube size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-[rgb(var(--primary))] group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium text-[rgb(var(--fg))] text-sm sm:text-base md:text-lg lg:text-xl">YouTube</span>
                </a>
              </div>

              {/* Mobile/Tablet: Inverted triangle layout (2 on top, 1 below) */}
              <div className="flex flex-col items-center space-y-3 xs:space-y-4 lg:hidden">
                {/* Top row - Two socials side by side (Instagram & Facebook) */}
                <div className="w-full flex flex-row gap-3 xs:gap-4">
                  {/* Instagram */}
                  <div className="flex-1">
                  <a 
                    href="https://www.instagram.com/jpmorada_/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center gap-2 xs:gap-3 px-4 xs:px-6 py-4 xs:py-5 bg-[rgb(var(--primary))]/5 hover:bg-[rgb(var(--primary))]/10 border border-[rgb(var(--primary))]/20 hover:border-[rgb(var(--primary))]/30 rounded-lg transition-all duration-300 group w-full h-full min-h-[60px]"
                    aria-label="Instagram"
                  >
                    <Instagram size={18} className="xs:w-6 xs:h-6 text-[rgb(var(--primary))] group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium text-[rgb(var(--fg))] text-sm xs:text-base">Instagram</span>
                  </a>
                  </div>

                  {/* Facebook */}
                  <div className="flex-1">
                    <a 
                      href="https://www.facebook.com/john.morada.red" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center justify-center gap-2 xs:gap-3 px-4 xs:px-6 py-4 xs:py-5 bg-[rgb(var(--primary))]/5 hover:bg-[rgb(var(--primary))]/10 border border-[rgb(var(--primary))]/20 hover:border-[rgb(var(--primary))]/30 rounded-lg transition-all duration-300 group w-full h-full min-h-[60px]"
                      aria-label="Facebook"
                    >
                      <Facebook size={18} className="xs:w-6 xs:h-6 text-[rgb(var(--primary))] group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-medium text-[rgb(var(--fg))] text-sm xs:text-base">Facebook</span>
                    </a>
                  </div>
                </div>

                {/* Bottom row - Single social centered (YouTube) */}
                <div className="w-full max-w-sm">
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center gap-2 xs:gap-3 px-4 xs:px-6 py-4 xs:py-5 bg-[rgb(var(--primary))]/5 hover:bg-[rgb(var(--primary))]/10 border border-[rgb(var(--primary))]/20 hover:border-[rgb(var(--primary))]/30 rounded-lg transition-all duration-300 group w-full min-h-[60px]"
                    aria-label="YouTube"
                  >
                    <Youtube size={18} className="xs:w-6 xs:h-6 text-[rgb(var(--primary))] group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium text-[rgb(var(--fg))] text-sm xs:text-base">YouTube</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}



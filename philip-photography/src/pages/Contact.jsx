import { useState } from 'react'
import { Instagram, Facebook, Youtube } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  const onSubmit = (e) => {
    e.preventDefault()
    const to = 'hello@philip.photo'
    const subject = `Inquiry from ${form.name || 'Website Visitor'}`
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
  }
  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] transition-colors duration-300">
      <div className="container-responsive pt-24 pb-12">
        <div className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-3 transition-colors duration-300">Get in Touch</div>
              <h1 className="font-extrabold text-[rgb(var(--fg))] uppercase leading-[0.9] transition-colors duration-300">
                <span className="block text-5xl sm:text-6xl md:text-7xl">Booking</span>
                <span className="block text-4xl sm:text-5xl md:text-6xl opacity-90">& Inquiries</span>
              </h1>
              <div className="mt-3 pt-3 border-t border-[rgb(var(--muted))]/20 transition-colors duration-300">
                <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] transition-colors duration-300">Collaborations and print requests</div>
              </div>
            </div>
            <div className="lg:col-span-5 lg:self-end">
              <p className="text-[rgb(var(--muted))] text-base sm:text-lg leading-relaxed lg:border-l lg:border-[rgb(var(--muted))]/20 lg:pl-5 transition-colors duration-300">
                For commissions, talks, workshops, or print inquiries, send a message. I typically reply within 48 hours.
              </p>
            </div>
          </div>
          <div className="mt-6 h-px w-full bg-[rgb(var(--muted))]/20 transition-colors duration-300" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form className="grid gap-4 lg:col-span-6 max-w-xl" onSubmit={onSubmit}>
            <div>
              <label htmlFor="name" className="block text-xs uppercase tracking-wider text-[rgb(var(--muted))] mb-2 transition-colors duration-300">Name</label>
              <input id="name" name="name" value={form.name} onChange={onChange} required className="card p-3 w-full transition-colors duration-300" placeholder="Your full name"/>
            </div>
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-wider text-[rgb(var(--muted))] mb-2 transition-colors duration-300">Email</label>
              <input id="email" name="email" value={form.email} onChange={onChange} required type="email" className="card p-3 w-full transition-colors duration-300" placeholder="you@example.com"/>
              <p className="mt-1 text-xs text-[rgb(var(--muted))] transition-colors duration-300">I'll use this only to reply to your message.</p>
            </div>
            <div>
              <label htmlFor="message" className="block text-xs uppercase tracking-wider text-[rgb(var(--muted))] mb-2 transition-colors duration-300">Message</label>
              <textarea id="message" name="message" value={form.message} onChange={onChange} required className="card p-3 min-h-36 w-full transition-colors duration-300" placeholder="Tell me about your project, dates, or questions"/>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="btn">Send</button>
              <span className="text-xs text-[rgb(var(--muted))] transition-colors duration-300">Typical response within 48 hours.</span>
            </div>
          </form>
          <figure className="lg:col-span-6 rounded-xl overflow-hidden border border-[rgb(var(--muted))]/20 transition-colors duration-300">
            <img
              src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1600&auto=format&fit=crop"
              alt="Lush green forest canopy"
              className="w-full h-[22rem] object-cover"
              loading="lazy"
            />
          </figure>
        </div>

        {/* Contact details cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 transition-colors duration-300">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-1 transition-colors duration-300">Email</div>
            <a href="mailto:hello@philip.photo" className="text-[rgb(var(--fg))] hover:underline transition-colors duration-300">hello@philip.photo</a>
          </div>
          <div className="card p-4 transition-colors duration-300">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-1 transition-colors duration-300">Location</div>
            <div className="text-[rgb(var(--fg))] transition-colors duration-300">Philippines • Available worldwide</div>
          </div>
          <div className="card p-4 transition-colors duration-300">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-1 transition-colors duration-300">Services</div>
            <div className="text-[rgb(var(--fg))] transition-colors duration-300">Photography commissions</div>
          </div>
          <div className="card p-4 transition-colors duration-300">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-1 transition-colors duration-300">Follow</div>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[rgb(var(--primary))] transition-colors duration-300" aria-label="Instagram">
                <Instagram size={18} />
                <span>Instagram</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[rgb(var(--primary))] transition-colors duration-300" aria-label="Facebook">
                <Facebook size={18} />
                <span>Facebook</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[rgb(var(--primary))] transition-colors duration-300" aria-label="YouTube">
                <Youtube size={18} />
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}



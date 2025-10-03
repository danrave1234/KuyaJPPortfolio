import { useNavigate } from 'react-router-dom'
import { Instagram, Facebook, Youtube } from 'lucide-react'

export default function Footer() {
  const navigate = useNavigate()

  const handleAdminAccess = () => {
    // Navigate to admin route (we'll create this)
    navigate('/admin')
  }

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="container-responsive py-10 text-sm text-[rgb(var(--muted))]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.25em]">Philip Photography</div>
            <p className="text-[rgb(var(--muted))]">Wildlife and nature photography focused on patient observation and storytelling.</p>
          </div>

          <nav className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.25em]">Navigate</div>
            <ul className="space-y-1">
              <li><button onClick={() => navigate('/')} className="hover:text-[rgb(var(--fg))] transition">Home</button></li>
              <li><button onClick={() => navigate('/gallery')} className="hover:text-[rgb(var(--fg))] transition">Gallery</button></li>
              <li><button onClick={() => navigate('/about')} className="hover:text-[rgb(var(--fg))] transition">About</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-[rgb(var(--fg))] transition">Contact</button></li>
            </ul>
          </nav>

          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.25em]">Contact</div>
            <ul className="space-y-1">
              <li><a href="mailto:hello@philip.photo" className="hover:text-[rgb(var(--fg))] transition">hello@philip.photo</a></li>
              <li><span>Based in Philippines • Available worldwide</span></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.25em]">Social</div>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[rgb(var(--fg))] transition-colors duration-300" aria-label="Instagram">
                <Instagram size={18} />
                <span>Instagram</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[rgb(var(--fg))] transition-colors duration-300" aria-label="Facebook">
                <Facebook size={18} />
                <span>Facebook</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[rgb(var(--fg))] transition-colors duration-300" aria-label="YouTube">
                <Youtube size={18} />
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Philip Photography. All rights reserved.</span>
          {/* Hidden admin access - invisible button */}
          <button 
            onClick={handleAdminAccess}
            className="opacity-0 hover:opacity-100 transition-opacity duration-300 text-xs text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] cursor-pointer"
            title="Admin Access"
            aria-label="Admin Access"
          >
            Admin
          </button>
        </div>
      </div>
    </footer>
  )
}



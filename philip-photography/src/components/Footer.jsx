import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()

  const handleAdminAccess = () => {
    // Navigate to admin route (we'll create this)
    navigate('/admin')
  }

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="container-responsive py-6 text-sm text-[rgb(var(--muted))]">
        <div className="flex items-center justify-between">
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



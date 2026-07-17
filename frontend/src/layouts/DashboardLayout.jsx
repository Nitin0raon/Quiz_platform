import { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, FileText, Zap, BarChart2,
  User, LogOut, Menu, X, ChevronRight, Brain,
  TrendingUp,
} from 'lucide-react'

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .f-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em; }
    .f-body { font-family: 'Inter', sans-serif; }
    .f-mono { font-family: 'JetBrains Mono', monospace; }
  `}</style>
)

const NAV = [
  { to: '/home',      label: 'Home',      icon: LayoutDashboard },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart2 },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/quizzes',   label: 'Quizzes',   icon: Zap },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/profile',   label: 'Profile',   icon: User },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`
      flex flex-col h-full bg-[#14161B] border-r border-[#24272E] relative z-20
      ${mobile ? 'w-72' : 'w-64'}
    `}>
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3 border-b border-[#24272E]">
        <div className="w-9 h-9 bg-[#F5B942] rounded-lg flex items-center justify-center shadow-[0_0_15px_-3px_rgba(245,185,66,0.35)] flex-shrink-0">
          <Brain className="w-5 h-5 text-[#0A0B0D]" strokeWidth={2.5} />
        </div>
        <span className="f-display font-bold text-[#ECEAE6] text-xl tracking-tight mt-0.5">
          Quiz<span className="text-[#F5B942]">AI</span>
        </span>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1.5 rounded-lg text-[#8B8F97] hover:text-[#ECEAE6] hover:bg-[#24272E]/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-thin">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 f-body
              ${isActive
                ? 'bg-[#F5B942] text-[#0A0B0D] shadow-md shadow-[#F5B942]/20'
                : 'text-[#8B8F97] hover:bg-[#24272E]/50 hover:text-[#ECEAE6]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-4 pb-6 pt-4 border-t border-[#24272E] bg-[#14161B]">
        {/* User Card */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#0A0B0D] border border-[#24272E] mb-3">
          <div className="w-9 h-9 rounded-lg bg-[#24272E] border border-[#4A4E56] flex items-center justify-center flex-shrink-0">
            <span className="text-[#ECEAE6] font-bold text-sm f-display">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#ECEAE6] truncate f-body">{user?.username}</p>
            <p className="text-xs text-[#8B8F97] truncate font-medium f-mono">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#8B8F97]
                     hover:bg-rose-400/10 hover:text-rose-400 transition-colors duration-200 f-body"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-[#0A0B0D] overflow-hidden text-[#8B8F97] f-body selection:bg-[#F5B942] selection:text-[#0A0B0D]">
      {FONTS}
      
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="relative z-50 flex-shrink-0 animate-slide-up h-full shadow-2xl shadow-black">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F5B942]/5 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Topbar (Mobile) */}
        <header className="lg:hidden flex items-center gap-4 px-5 py-4 bg-[#14161B]/90 backdrop-blur-md border-b border-[#24272E] relative z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-[#24272E]/50 text-[#8B8F97] hover:text-[#ECEAE6] transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#F5B942] rounded-md flex items-center justify-center shadow-[0_0_10px_-2px_rgba(245,185,66,0.3)]">
              <Brain className="w-4 h-4 text-[#0A0B0D]" strokeWidth={2.5} />
            </div>
            <span className="f-display font-bold text-[#ECEAE6] text-lg tracking-tight mt-0.5">
              Quiz<span className="text-[#F5B942]">AI</span>
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-8 relative z-10">
          <div className="max-w-7xl mx-auto h-full animate-fade-in">
            {/* Main Card Wrapper - acts as a unified stage for child components */}
            <div className="bg-[#14161B]/40 border border-[#24272E]/50 rounded-2xl p-4 lg:p-8 min-h-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
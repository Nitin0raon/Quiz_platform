import { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, FileText, Zap, BarChart2,
  User, LogOut, Menu, X, ChevronRight, Brain,
  TrendingUp,
} from 'lucide-react'

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
      flex flex-col h-full bg-zinc-900 border-r border-zinc-800/50 relative z-20
      ${mobile ? 'w-72' : 'w-64'}
    `}>
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3 border-b border-zinc-800/50">
        <div className="w-9 h-9 bg-lime-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_-3px_rgba(163,230,53,0.3)] flex-shrink-0">
          <Brain className="w-5 h-5 text-zinc-950" strokeWidth={2.5} />
        </div>
        <span className="font-display font-bold text-white text-xl tracking-tight">
          Quiz<span className="text-lime-400">AI</span>
        </span>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
              ${isActive
                ? 'bg-lime-400 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-white'
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
      <div className="px-4 pb-6 pt-4 border-t border-zinc-800/50 bg-zinc-900">
        {/* User Card (zinc-800/70) */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-800/70 border border-zinc-700/50 mb-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-700 border border-zinc-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{user?.username}</p>
            <p className="text-xs text-zinc-400 truncate font-medium">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400
                     hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden font-sans selection:bg-lime-400 selection:text-zinc-950">
      {/* Page Background (zinc-950) */}
      
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
          <div className="relative z-50 flex-shrink-0 animate-slide-up h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/5 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Topbar (zinc-900/90) */}
        <header className="lg:hidden flex items-center gap-4 px-5 py-4 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800/50 relative z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-lime-400 rounded-md flex items-center justify-center">
              <Brain className="w-4 h-4 text-zinc-950" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">
              Quiz<span className="text-lime-400">AI</span>
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-8 relative z-10">
          <div className="max-w-7xl mx-auto h-full animate-fade-in">
            {/* Main Card Wrapper (zinc-900/35) - acts as a unified stage for child components */}
            <div className="bg-zinc-900/[0.35] border border-zinc-800/30 rounded-2xl p-4 lg:p-8 min-h-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
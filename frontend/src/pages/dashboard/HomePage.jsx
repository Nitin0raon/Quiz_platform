import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { analyticsService } from '../../services/analyticsService'
import { documentService } from '../../services/documentService'
import {
  Zap, FileText, BarChart2, BookOpen, TrendingUp,
  Brain, Target, ArrowRight, Clock
} from 'lucide-react'
import SkeletonCard from '../../components/common/SkeletonCard'
import { formatDate, formatTime } from '../../utils/helpers'

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .f-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em; }
    .f-body { font-family: 'Inter', sans-serif; }
    .f-mono { font-family: 'JetBrains Mono', monospace; }
  `}</style>
)

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-generated quizzes',
    desc: 'Upload any PDF and get a tailored quiz in seconds — multiple choice, short answer, or mixed.',
  },
  {
    icon: Target,
    title: 'Adaptive difficulty',
    desc: 'Choose easy, medium, or hard — or let the system adapt based on your past performance.',
  },
  {
    icon: TrendingUp,
    title: 'Progress analytics',
    desc: 'Track accuracy by topic, monitor streaks, and identify which areas need more attention.',
  },
]

const QUICK_ACTIONS = [
  { icon: Zap,       title: 'Generate quiz', desc: 'Pick a document, topic, and difficulty level', to: '/quizzes/generate' },
  { icon: FileText,  title: 'Upload PDF',    desc: 'Add study material to generate quizzes from',  to: '/documents' },
  { icon: BookOpen,  title: 'My quizzes',    desc: 'Browse, retake, or review past quizzes',       to: '/quizzes' },
  { icon: BarChart2, title: 'Analytics',     desc: 'Charts, accuracy trends, and leaderboard',     to: '/analytics' },
]

function difficultyClass(d) {
  return d === 'easy'
    ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
    : d === 'medium'
    ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
    : 'bg-rose-400/10 text-rose-400 border-rose-400/20'
}

function accuracyColor(n) {
  if (n >= 80) return 'text-emerald-400'
  if (n >= 60) return 'text-amber-400'
  return 'text-rose-400'
}

function barColor(n) {
  if (n >= 80) return 'bg-emerald-400'
  if (n >= 60) return 'bg-amber-400'
  return 'bg-rose-400'
}

function accuracyBadge(n) {
  if (n >= 80) return { chip: 'bg-emerald-400/10 text-emerald-400', border: 'border-emerald-400/20' }
  if (n >= 60) return { chip: 'bg-amber-400/10 text-amber-400', border: 'border-amber-400/20' }
  return { chip: 'bg-rose-400/10 text-rose-400', border: 'border-rose-400/20' }
}

export default function HomePage() {
  const { user } = useAuth()

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsService.dashboard().then(r => r.data),
    staleTime: 60_000,
  })

  useQuery({
    queryKey: ['documents', 'recent'],
    queryFn: () => documentService.list({ page_size: 3 }).then(r => r.data),
    staleTime: 60_000,
  })

  const name           = user?.first_name || user?.username
  const streak         = dashboard?.user?.streak_days   || 0
  const points         = dashboard?.user?.total_points  || 0
  const accuracy       = dashboard?.summary?.average_accuracy || 0
  const recentAttempts = dashboard?.recent_attempts || []
  const topicPerf      = dashboard?.topic_performance || []

  return (
    <div className="space-y-10 animate-fade-in text-[#8B8F97] f-body selection:bg-[#F5B942] selection:text-[#0A0B0D] pb-10">
      {FONTS}

      {/* ── HERO ── */}
      <div className="rounded-2xl bg-[#14161B] border border-[#24272E] p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-black/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F5B942]/[0.05] rounded-full blur-[100px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#F5B942 1px, transparent 1px)', backgroundSize: '36px 36px' }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="f-mono text-[11px] tracking-widest uppercase text-[#F5B942] mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> dashboard
            </p>
            <h1 className="text-3xl md:text-4xl f-display font-semibold text-[#ECEAE6] mb-3">
              Welcome back, {name}
            </h1>
            <p className="text-base text-[#8B8F97] leading-relaxed max-w-md f-body">
              {streak >= 3
                ? `You're on a ${streak}-day streak. Keep up the momentum.`
                : 'Every quiz makes you sharper. Ready to continue?'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              to="/quizzes/generate"
              className="inline-flex items-center justify-center gap-2 bg-[#F5B942] hover:bg-[#f0aa26]
                         text-[#0A0B0D] f-body font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_-3px_rgba(245,185,66,0.35)]"
            >
              Generate quiz <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/quizzes/attempts"
              className="inline-flex items-center justify-center gap-2 bg-[#0A0B0D] hover:bg-[#0A0B0D]/70
                         text-[#ECEAE6] f-body font-medium text-sm px-6 py-3 rounded-xl
                         border border-[#24272E] hover:border-[#F5B942]/50 hover:text-[#F5B942] transition-colors"
            >
              View history
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#24272E]/60 rounded-xl mt-10 overflow-hidden border border-[#24272E] relative z-10">
          {[
            { label: 'Total points', value: points,        sub: '+124 this week' },
            { label: 'Avg accuracy', value: `${accuracy}%`, sub: 'across all quizzes' },
            { label: 'Day streak',   value: streak,        sub: `Personal best: ${dashboard?.user?.best_streak || streak}` },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-[#0A0B0D] px-6 py-5 group hover:bg-[#14161B] transition-colors">
              <p className="text-3xl f-display font-bold text-[#ECEAE6] mb-1 group-hover:text-[#F5B942] transition-colors">{value}</p>
              <p className="text-[11px] font-semibold tracking-wider uppercase text-[#8B8F97] f-mono mb-2">{label}</p>
              <p className="text-xs text-[#F5B942] flex items-center gap-1.5 opacity-80 f-mono">
                <TrendingUp className="w-3.5 h-3.5" /> {sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div>
        <p className="text-[11px] font-semibold f-mono text-[#8B8F97] mb-5 uppercase tracking-wider">
          Quick actions
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(({ icon: Icon, title, desc, to }) => (
            <Link key={title} to={to}
              className="bg-[#14161B] border border-[#24272E] rounded-2xl p-6
                         hover:border-[#F5B942]/40 hover:bg-[#14161B]/80 transition-all group shadow-lg shadow-black/10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-[#0A0B0D] border border-[#24272E] group-hover:border-[#F5B942]/30 group-hover:bg-[#F5B942]/10 transition-colors shadow-inner">
                <Icon className="w-5 h-5 text-[#F5B942]" />
              </div>
              <p className="f-display font-semibold text-base text-[#ECEAE6] group-hover:text-[#F5B942] transition-colors mb-1.5">
                {title}
              </p>
              <p className="text-xs text-[#8B8F97] leading-relaxed f-body">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Add your main content blocks here */}
        </div>
      </div>
    </div>
  )
}
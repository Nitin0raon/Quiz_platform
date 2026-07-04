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
  const streak         = dashboard?.user?.streak_days    || 0
  const points         = dashboard?.user?.total_points   || 0
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
                         text-[#0A0B0D] f-body font-semibold text-sm px-6 py-3 rounded-lg transition-colors shadow-[0_0_15px_-3px_rgba(245,185,66,0.35)]"
            >
              Generate quiz <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/quizzes/attempts"
              className="inline-flex items-center justify-center gap-2 bg-[#0A0B0D] hover:bg-[#0A0B0D]/70
                         text-[#ECEAE6] f-body font-medium text-sm px-6 py-3 rounded-lg
                         border border-[#24272E] hover:border-[#F5B942]/50 transition-colors"
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
            <div key={label} className="bg-[#0A0B0D] px-6 py-5">
              <p className="text-3xl f-mono font-semibold text-[#ECEAE6] mb-1">{value}</p>
              <p className="text-sm text-[#8B8F97] f-body mb-2">{label}</p>
              <p className="text-xs text-[#F5B942] flex items-center gap-1.5 opacity-80 f-mono">
                <TrendingUp className="w-3.5 h-3.5" /> {sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div>
        <p className="text-[11px] f-mono text-[#8B8F97] mb-5 uppercase tracking-wider">
          Quick actions
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(({ icon: Icon, title, desc, to }) => (
            <Link key={title} to={to}
              className="bg-[#14161B] border border-[#24272E] rounded-xl p-6
                         hover:border-[#F5B942]/40 hover:bg-[#181B21] transition-all group">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-[#0A0B0D] border border-[#24272E] group-hover:border-[#F5B942]/30 group-hover:bg-[#F5B942]/10 transition-colors">
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

        {/* Recent attempts */}
        {/* <div className="lg:col-span-3 bg-[#14161B] border border-[#24272E] rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <p className="f-display font-semibold text-base text-[#ECEAE6]">Recent attempts</p>
            <Link to="/quizzes/attempts"
              className="text-xs f-mono text-[#F5B942] hover:text-[#f0aa26] flex items-center gap-1 transition-colors uppercase tracking-wider">
              view all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {dashLoading ? (
            <SkeletonCard lines={4} />
          ) : recentAttempts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <div className="w-16 h-16 rounded-full bg-[#0A0B0D] flex items-center justify-center mb-4 border border-[#24272E]">
                <BookOpen className="w-6 h-6 text-[#4A4E56]" />
              </div>
              <p className="text-base f-display font-semibold text-[#ECEAE6] mb-2">No attempts yet</p>
              <p className="text-sm text-[#8B8F97] mb-6 max-w-xs f-body">Generate a quiz to see your history and performance here.</p>
              <Link to="/quizzes/generate"
                className="text-sm bg-[#F5B942] text-[#0A0B0D] f-body font-semibold px-5 py-2.5 rounded-lg hover:bg-[#f0aa26] transition-colors">
                Generate your first quiz
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#24272E] flex-1">
              {recentAttempts.slice(0, 5).map((a) => {
                const badge = accuracyBadge(a.accuracy)
                return (
                  <div key={a.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 hover:bg-[#0A0B0D]/40 rounded-lg px-2 -mx-2 transition-colors">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center f-mono text-sm font-semibold flex-shrink-0 border ${badge.chip} ${badge.border}`}>
                      {Math.round(a.accuracy)}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base f-body font-medium text-[#ECEAE6] truncate mb-1">{a.quiz__title}</p>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] f-mono uppercase tracking-wider border ${difficultyClass(a.quiz__difficulty)}`}>
                          {a.quiz__difficulty}
                        </span>
                        <span className="text-xs text-[#8B8F97] flex items-center gap-1 f-mono">
                          <Clock className="w-3.5 h-3.5" /> {formatTime(a.time_taken_seconds)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm f-mono font-semibold text-[#ECEAE6] mb-1">{a.score} <span className="text-[#4A4E56]">/ {a.total_questions}</span></p>
                      <p className="text-xs text-[#8B8F97] f-mono">{formatDate(a.started_at)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div> */}

        {/* Right col */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">

          {/* Topic performance */}
          {/* <div className="bg-[#14161B] border border-[#24272E] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="f-display font-semibold text-base text-[#ECEAE6]">Topic performance</p>
              <Link to="/analytics"
                className="text-xs f-mono text-[#F5B942] hover:text-[#f0aa26] flex items-center gap-1 transition-colors uppercase tracking-wider">
                full report <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {dashLoading ? <SkeletonCard lines={4} /> : topicPerf.length === 0 ? (
              <p className="text-sm text-[#8B8F97] text-center py-6 bg-[#0A0B0D] rounded-lg border border-[#24272E] border-dashed f-body">
                Take more quizzes to see topic insights
              </p>
            ) : (
              <div className="space-y-5">
                {topicPerf.slice(0, 4).map((t) => (
                  <div key={t.quiz__topic}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm text-[#ECEAE6]/90 truncate pr-2 f-body">{t.quiz__topic}</span>
                      <span className={`text-sm f-mono font-semibold flex-shrink-0 ${accuracyColor(t.avg_accuracy)}`}>
                        {Math.round(t.avg_accuracy)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#1B1E24] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${barColor(t.avg_accuracy)}`}
                        style={{ width: `${t.avg_accuracy}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div> */}

          {/* Platform features */}
          <div className="bg-[#14161B] border border-[#24272E] rounded-2xl p-6 flex-1">
            <p className="f-display font-semibold text-base text-[#ECEAE6] mb-6">Platform features</p>
            <div className="divide-y divide-[#24272E]/70">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="w-10 h-10 rounded-lg bg-[#0A0B0D] border border-[#24272E] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#F5B942]" />
                  </div>
                  <div>
                    <p className="text-sm f-display font-semibold text-[#ECEAE6] mb-1">{title}</p>
                    <p className="text-xs text-[#8B8F97] leading-relaxed f-body">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
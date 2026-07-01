import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { analyticsService } from '../../services/analyticsService'
import {
  Zap, FileText, Trophy, TrendingUp, ArrowRight,
  Clock, Target, Flame, Plus
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

// Local helpers for dark mode specific colors
const getDifficultyColor = (d) => {
  if (d === 'easy') return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
  if (d === 'medium') return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
  return 'bg-rose-400/10 text-rose-400 border-rose-400/20'
}

const getAccuracyColor = (n) => {
  if (n >= 80) return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
  if (n >= 60) return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
  return 'bg-rose-400/10 text-rose-400 border-rose-400/20'
}

const getBarColor = (n) => {
  if (n >= 80) return 'bg-emerald-400'
  if (n >= 60) return 'bg-amber-400'
  return 'bg-rose-400'
}

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand:  'bg-[#F5B942]/10 text-[#F5B942] border-[#F5B942]/20',
    orange: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    green:  'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    rose:   'bg-rose-400/10 text-rose-400 border-rose-400/20',
  }

  return (
    <div className="bg-[#14161B] border border-[#24272E] p-6 rounded-2xl flex items-center gap-5 hover:border-[#F5B942]/30 transition-all duration-300 shadow-lg group relative overflow-hidden">
      <div className="absolute inset-0 bg-[#F5B942]/0 group-hover:bg-[#F5B942]/[0.03] transition-colors pointer-events-none" />

      <div className={`p-3.5 rounded-xl border flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0 relative z-10">
        <p className="text-3xl f-display font-semibold text-[#ECEAE6] mb-1 leading-none">{value}</p>
        <p className="text-xs f-mono uppercase tracking-wider text-[#8B8F97]">{label}</p>
        {sub && <p className="text-[10px] f-mono text-[#8B8F97]/60 mt-1 uppercase">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsService.dashboard().then(r => r.data),
    staleTime: 60_000,
  })

  const summary = data?.summary || {}
  const recent  = data?.recent_attempts || []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in f-body selection:bg-[#F5B942] selection:text-[#0A0B0D] text-[#8B8F97]">
      {FONTS}

      {/* Header & Quick Actions Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="f-display text-3xl md:text-4xl font-semibold text-[#ECEAE6] mb-2">
            {greeting}, <span className="text-[#F5B942]">{user?.first_name || user?.username}</span> 👋
          </h1>
          <p className="text-[#8B8F97] text-base f-body">
            Here's your study progress at a glance.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <Link
            to="/quizzes/generate"
            className="flex items-center justify-center gap-2 bg-[#F5B942] hover:bg-[#f0aa26] text-[#0A0B0D] f-body font-semibold text-sm px-6 py-3.5 rounded-lg transition-colors shadow-[0_0_15px_-3px_rgba(245,185,66,0.35)]"
          >
            <Plus className="w-4.5 h-4.5" /> Generate quiz
          </Link>
          <Link
            to="/documents/upload"
            className="flex items-center justify-center gap-2 bg-[#14161B] hover:bg-[#1B1E24] text-[#ECEAE6] f-body font-medium text-sm px-6 py-3.5 rounded-lg border border-[#24272E] hover:border-[#F5B942]/50 transition-colors"
          >
            <FileText className="w-4.5 h-4.5 text-[#8B8F97]" /> Upload PDF
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#14161B] border border-[#24272E] p-6 rounded-2xl h-28 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Zap}    label="Quizzes taken" value={summary.total_quizzes_taken || 0}    color="brand"  />
          <StatCard icon={Target} label="Avg. accuracy" value={`${summary.average_accuracy || 0}%`} color="green"  sub="across all quizzes" />
          <StatCard icon={Trophy} label="Total points"  value={data?.user?.total_points || 0}       color="orange" />
          <StatCard icon={Flame}  label="Day streak"    value={`${data?.user?.streak_days || 0}`}   color="rose"   sub="keep it up!" />
        </div>
      )}

      {/* Recent attempts + topic performance */}
      <div className="grid lg:grid-cols-5 gap-8">

        {/* Recent attempts */}
        <div className="lg:col-span-3 bg-[#14161B] border border-[#24272E] rounded-2xl p-6 md:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="f-display font-semibold text-xl text-[#ECEAE6]">Recent attempts</h2>
            <Link to="/quizzes/attempts" className="text-xs f-mono text-[#F5B942] hover:text-[#f0aa26] flex items-center gap-1.5 transition-colors uppercase tracking-wider">
              view all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} lines={2} />)}</div>
          ) : recent.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 bg-[#0A0B0D]/50 rounded-xl border border-[#24272E] border-dashed">
              <div className="w-16 h-16 rounded-full bg-[#0A0B0D] border border-[#24272E] flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#4A4E56]" />
              </div>
              <p className="f-display font-semibold text-[#ECEAE6] mb-1">No attempts yet</p>
              <p className="text-sm text-[#8B8F97] mb-6 f-body">Generate and take your first quiz!</p>
              <Link to="/quizzes/generate" className="text-sm bg-[#F5B942] text-[#0A0B0D] f-body font-semibold px-6 py-2.5 rounded-lg hover:bg-[#f0aa26] transition-colors">
                Start now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((a) => (
                <div key={a.id} className="group p-4 bg-[#0A0B0D] border border-[#24272E] rounded-xl hover:border-[#F5B942]/30 transition-all flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border ${getAccuracyColor(a.accuracy)}`}>
                    <span className="f-mono font-semibold text-base">{Math.round(a.accuracy)}%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="f-body font-medium text-[#ECEAE6] text-base truncate mb-1 group-hover:text-[#F5B942] transition-colors">{a.quiz__title}</p>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] f-mono uppercase tracking-wider border ${getDifficultyColor(a.quiz__difficulty)}`}>
                        {a.quiz__difficulty}
                      </span>
                      <span className="text-xs text-[#8B8F97] flex items-center gap-1 f-mono">
                        <Clock className="w-3.5 h-3.5" /> {formatTime(a.time_taken_seconds)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base f-mono font-semibold text-[#ECEAE6] mb-0.5">{a.score} <span className="text-[#4A4E56] text-sm">/ {a.total_questions}</span></p>
                    <p className="text-xs text-[#8B8F97] f-mono">{formatDate(a.started_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Topic performance */}
        <div className="lg:col-span-2 bg-[#14161B] border border-[#24272E] rounded-2xl p-6 md:p-8 flex flex-col">
          <h2 className="f-display font-semibold text-xl text-[#ECEAE6] mb-6">Topic performance</h2>

          {isLoading ? (
            <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-[#1B1E24] animate-pulse rounded-lg"></div>)}</div>
          ) : (data?.topic_performance || []).length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 bg-[#0A0B0D]/50 rounded-xl border border-[#24272E] border-dashed text-center">
              <TrendingUp className="w-10 h-10 mb-3 text-[#3A3E46]" />
              <p className="text-sm f-body text-[#8B8F97]">Take more quizzes to see<br/>topic insights here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {(data.topic_performance || []).slice(0, 6).map((t) => (
                <div key={t.quiz__topic}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm f-body text-[#ECEAE6]/90 truncate pr-3">{t.quiz__topic}</span>
                    <span className="text-sm f-mono font-semibold text-[#ECEAE6] flex-shrink-0">{Math.round(t.avg_accuracy)}%</span>
                  </div>
                  <div className="h-2 bg-[#1B1E24] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${getBarColor(t.avg_accuracy)}`}
                      style={{ width: `${t.avg_accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}